import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { currentTheme } from './theme.js';

document.documentElement.dataset.theme = currentTheme();

createRoot(document.getElementById('root')).render(<App />);
