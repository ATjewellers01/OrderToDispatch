import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initGlobalInputRestriction } from './utils/globalInputRestriction.js';

// Initialize global input restriction for weight/number inputs (max 3 decimals)
initGlobalInputRestriction();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);