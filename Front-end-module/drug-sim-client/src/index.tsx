import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';   // 👈 add this
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>        {/* 👈 wrap App inside BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
