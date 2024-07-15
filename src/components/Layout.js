// src/components/Layout.js

import React from 'react';
import Header from './Header';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout-container">
      <div className="overlay"></div> {/* Overlay for background */}
      <Header />
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
