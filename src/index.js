import './index.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faArrowRight,
  faArrowsRotate,
  faCrosshairs,
  faEyeSlash,
  faFileArrowDown,
  faFileArrowUp
} from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { ParticlesContextProvider } from './AppContext';
import { LoadingContextProvider } from './AppContext';

library.add(
  faFileArrowUp,
  faFileArrowDown,
  faCrosshairs,
  faEyeSlash,
  faArrowRight,
  faArrowLeft,
  faArrowsRotate
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoadingContextProvider>
      <ParticlesContextProvider>
        <App />
      </ParticlesContextProvider>
    </LoadingContextProvider>
  </React.StrictMode>
);
