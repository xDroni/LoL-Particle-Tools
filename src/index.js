import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faArrowRight,
  faCrosshairs,
  faEyeSlash,
  faFileArrowDown,
  faFileArrowUp
} from '@fortawesome/free-solid-svg-icons';

library.add(faFileArrowUp, faFileArrowDown, faCrosshairs, faEyeSlash, faArrowRight, faArrowLeft);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
