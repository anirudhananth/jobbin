import React from 'react';
import ReactDom from 'react-dom/client';
import '../../assets/tailwind.css';
import Options from './options';

function init() {
    const root = document.createElement('div');
    root.className = 'container';
    document.body.appendChild(root);
    const rootDiv = ReactDom.createRoot(root);
    rootDiv.render(
        <Options />
    );
}

init();