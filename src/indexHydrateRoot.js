import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';

console.log('document',document.documentElement.outerHTML)

ReactDOM.hydrateRoot(document.getElementById('root'),<App></App>);


reportWebVitals();
