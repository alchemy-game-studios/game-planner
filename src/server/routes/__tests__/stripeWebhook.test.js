/**
 * stripeWebhook.test.js
 * Integration tests for Stripe webhook endpoint
 */

import request from 'supertest';
import express from 'express';
import stripeWebhookRouter from '../stripeWebhook.js';

// Mock Neo4j driver
const mockSession = {
  run: jest.fn(),
  close: jest.fn(),
};

const mockDriver = {
  session: jest.fn(() => mockSession),
};

jest.mock('../../neo4j-driver.js', () => ({
  getDriver: () => mockDriver,
}));

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: jest.fn(),
  },
  subscriptions: {
    retrieve: jest.fn(),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

describe('Stripe Webhook Endpoint', () => {
  let app;

  beforeEach(() => {
    app = express();
    // Mount webhook route with raw body parser
    app.use('/api/stripe/webhook', stripeWebhookRouter);
    
    // Clear mocks
    jest.clearAllMocks();
    mockSession.run.mockResolvedValue({ records: [] });
    
    // Set required env vars
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  describe('POST /api/stripe/webhook', () => {
    it('should return 400 for invalid signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'invalid_sig')
        .send({ type: 'test.event' });

      expect(response.status).toBe(400);
      expect(response.text).toContain('Webhook Error');
    });

    it('should handle checkout.session.completed', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_mock123',
            subscription: 'sub_mock456',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        customer: 'cus_mock123',
        status: 'active',
        items: {
          data: [{ price: { id: 'price_creator' } }],
        },
        current_period_end: 1735689600, // 2025-01-01
        cancel_at_period_end: false,
      });

      // Mock finding user by customer ID
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: () => ({
              properties: {
                id: 'user123',
                email: 'test@example.com',
              },
            }),
          },
        ],
      });

      process.env.STRIPE_CREATOR_PRICE_ID = 'price_creator';

      const response = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid_sig')
        .send(JSON.stringify(mockEvent));

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_mock456');
      expect(mockSession.run).toHaveBeenCalled();
    });

    it('should handle customer.subscription.updated', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_mock123',
            status: 'active',
            items: {
              data: [{ price: { id: 'price_studio' } }],
            },
            current_period_end: 1735689600,
            cancel_at_period_end: true,
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: () => ({
              properties: {
                id: 'user123',
                email: 'test@example.com',
              },
            }),
          },
        ],
      });

      process.env.STRIPE_STUDIO_PRICE_ID = 'price_studio';

      const response = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid_sig')
        .send(JSON.stringify(mockEvent));

      expect(response.status).toBe(200);
      
      // Verify Neo4j update was called with correct data
      const updateCall = mockSession.run.mock.calls[0];
      expect(updateCall[1]).toMatchObject({
        customerId: 'cus_mock123',
        tier: 'STUDIO',
        status: 'active',
        cancelAtPeriodEnd: true,
      });
    });

    it('should handle customer.subscription.deleted', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_mock123',
            status: 'canceled',
            ended_at: 1735689600,
            items: {
              data: [{ price: { id: 'price_creator' } }],
            },
            current_period_end: 1735689600,
            cancel_at_period_end: false,
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: () => ({
              properties: {
                id: 'user123',
                email: 'test@example.com',
              },
            }),
          },
        ],
      });

      const response = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid_sig')
        .send(JSON.stringify(mockEvent));

      expect(response.status).toBe(200);
      
      // Verify user downgraded to FREE
      const updateCall = mockSession.run.mock.calls[0];
      expect(updateCall[1]).toMatchObject({
        customerId: 'cus_mock123',
        tier: 'FREE',
        status: 'cancelled',
      });
    });

    it('should return 500 when webhook secret is missing', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const response = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'sig')
        .send({ type: 'test.event' });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Webhook secret not configured');
    });

    it('should acknowledge unhandled event types', async () => {
      const mockEvent = {
        type: 'invoice.payment_succeeded',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const response = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid_sig')
        .send(JSON.stringify(mockEvent));

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });

    it('should work in dev mode without Stripe configured', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const response = await request(app)
        .post('/api/stripe/webhook')
        .send({ type: 'test.event' });

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });
  });
});
