import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Garanta que aponta para o App
import './index.css' // Garanta que importa o CSS com o Tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)