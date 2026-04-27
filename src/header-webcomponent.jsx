import React from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';

class CustomHeader extends HTMLElement {
  connectedCallback() {
    if (!this._mounted) {
      const mountPoint = document.createElement('div');
      this.appendChild(mountPoint);
      createRoot(mountPoint).render(<Header childrenCount={0} />);
      this._mounted = true;
    }
  }
}

if (!customElements.get('custom-header')) {
  customElements.define('custom-header', CustomHeader);
}
