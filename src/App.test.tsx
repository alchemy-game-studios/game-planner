import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app component', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Basic smoke test - just ensure the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
