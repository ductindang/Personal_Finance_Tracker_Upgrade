import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// This is the entry point of all the application 
// Create root will find element <div id="root"></div> in index.html
// and render to component <App /> in to it

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
