import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';

// Lazy-loaded components
const LandingPage = lazy(() => import('./LandingPage'));
const Zones = lazy(() => import('./pages/Zones'));
const User = lazy(() => import('./pages/User'));
const Sandbox = lazy(() => import('./pages/Sandbox'));
const Patterns = lazy(() => import('./pages/Patterns'));
const Maps = lazy(() => import('./pages/Maps'));

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
            <Route path="/sandbox/:id" element={<Sandbox />} />
            {/* Redirect /b/:id to /sandbox/:id */}
            <Route path="/b/:id" element={<RedirectToSandbox />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/maps/:id" element={<Maps />} />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

// Define a component to handle redirection from /b/:id to /sandbox/:id
function RedirectToSandbox() {
  let { id } = useParams(); // Make sure to import useParams from react-router-dom
  return <Navigate to={`/sandbox/${id}`} />;
}

export default App;