import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Ocultar el preloader cuando React termina de cargar
const preloader = document.getElementById('preloader');
if (preloader) preloader.style.display = 'none';
