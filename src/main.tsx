import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Buffer } from 'buffer'

// Polyfills for Umi/Metaplex packages
(window as any).global = window;
(window as any).Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
