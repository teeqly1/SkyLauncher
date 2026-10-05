import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.scss';
import './styles/header.scss';
import './styles/sidebar.scss';
import './styles/home.scss';
import './styles/catalogue.scss';
import './styles/downloads.scss';
import './styles/settings.scss';
import './styles/details.scss';
import './styles/statusbar.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
