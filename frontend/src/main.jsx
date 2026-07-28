import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Estilos globales (reset, variables CSS, tipografía)
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
