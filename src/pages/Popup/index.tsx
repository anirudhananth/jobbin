import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../assets/tailwind.css';
import Popup from './popup';
import "../../index.css";

async function init() {

  const root = document.createElement('div');
  // root.className = 'container';
  document.body.className = 'container';
  document.body.appendChild(root);
  const rootDiv = ReactDOM.createRoot(root);
  rootDiv.render(
    // <React.StrictMode>
    <Popup />
    // </React.StrictMode>,
  );
}

init();
