import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// @ts-expect-error: App import may fail if type definitions are missing or incorrect
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);