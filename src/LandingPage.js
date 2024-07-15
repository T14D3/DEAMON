import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="App-header">
        <h1>Welcome to my "simple" API query for "The First Descendant"!</h1>
        <p></p>
        <p>To lookup user Information, enter their Name#ID into the box in the top-right</p>
        <p></p>
        <p>Zone Rewards can be viewed on the "Zones" page</p>
        <p></p>
        <p>The Sandbox is a drag-and-drop tool to create your own configurations and share them with others! (File-only for now)</p>
        <p></p>
        <p>If anything breaks or you have suggestions, contact me on Discord: <code>t14d3</code></p>
      </header>
    </div>
  );
}

export default LandingPage;
