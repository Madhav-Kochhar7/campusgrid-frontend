/**
 * Application Hydration Entry Point
 * =================================
 * The final bridge between the React virtual DOM and the physical 
 * browser document.
 * 
 * Logic:
 * 1. Targets the 'root' div in index.html.
 * 2. Mounts the root App component.
 * 3. Enforces StrictMode for development-time sanity checks.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Create the React root at the 'root' div defined in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
