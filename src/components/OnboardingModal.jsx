/**
 * OnboardingModal.jsx
 * Welcome modal for new users with quick tutorial
 */

import React, { useState } from 'react';

export default function OnboardingModal({ onClose, onSkip }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '🔥 Welcome to CanonKiln',
      description: 'Build rich, interconnected story worlds with AI-powered generation.',
      image: '🎨',
    },
    {
      title: '📝 Create Entities',
      description: 'Add places, characters, items, events, and factions to your canon using the sidebar panel.',
      image: '⚔️',
    },
    {
      title: '🔗 Connect Everything',
      description: 'Use "Connect Mode" in the graph to draw relationships between entities and build your world\'s structure.',
      image: '🌐',
    },
    {
      title: '✦ AI Generation',
      description: 'Generate new entities constrained by your existing world. The AI respects your canon and creates consistent additions.',
      image: '🤖',
    },
    {
      title: '📊 Track & Export',
      description: 'View statistics, export your canon as JSON or Markdown, and watch your world grow.',
      image: '💾',
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9998,
        }}
        onClick={onSkip}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          background: '#1a1a2e',
          border: '2px solid #6a3aff',
          borderRadius: 16,
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(106, 58, 255, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Content */}
        <div style={{ padding: '40px 32px' }}>
          <div
            style={{
              fontSize: 64,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {currentStep.image}
          </div>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#e0e0e0',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {currentStep.title}
          </h2>

          <p
            style={{
              fontSize: 15,
              color: '#a0a0b0',
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            {currentStep.description}
          </p>

          {/* Progress dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 24,
            }}
          >
            {steps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: idx === step ? '#6a3aff' : '#2a2a4a',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setStep(idx)}
              />
            ))}
          </div>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
            }}
          >
            {!isLast ? (
              <>
                <button
                  onClick={onSkip}
                  style={{
                    padding: '10px 24px',
                    fontSize: 14,
                    background: 'transparent',
                    border: '1px solid #2a2a4a',
                    borderRadius: 8,
                    color: '#6a6a8a',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  style={{
                    padding: '10px 24px',
                    fontSize: 14,
                    background: '#6a3aff',
                    border: 'none',
                    borderRadius: 8,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Next →
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                style={{
                  padding: '10px 32px',
                  fontSize: 14,
                  background: '#6a3aff',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Get Started 🔥
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
