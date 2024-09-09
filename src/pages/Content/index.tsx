import React from 'react';
import ReactDom from 'react-dom/client';
import '../../assets/tailwind.css';
import ContentScript from './content';

function init() {
    const root = document.createElement('div');
    if (!root) {
        throw new Error('Root element not found');
    }
    root.className = 'container';
    document.body.appendChild(root);
    const rootDiv = ReactDom.createRoot(root);
    console.log(rootDiv);
    rootDiv.render(
        <React.StrictMode>
            <ContentScript />
        </React.StrictMode>
    );
}

init();