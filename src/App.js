import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';

// Lazy-loaded components
const LandingPage = lazy(() => import('./LandingPage'));
const Zones = lazy(() => import('./pages/Zones'));
const User = lazy(() => import('./pages/User'));
const Sandbox = lazy(() => import('./pages/Sandbox'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="loading-container">
          <div className="loading-content">Loading...</div>
        </div>
      }>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/zones" element={<Zones />} />
            <Route path="/user/:name/*" element={<User />} />
            <Route path="/sandbox" element={<Sandbox />} />
            
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;
