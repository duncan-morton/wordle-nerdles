import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'  // Change back from './AppFirebase'
import './index.css'  // This line is important!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)