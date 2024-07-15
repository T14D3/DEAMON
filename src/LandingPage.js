import React, { useEffect } from 'react';

function LandingPage() {
  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    
    // Clean up the style when the component unmounts
    return () => {
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <div className="landing-page">
      <header className="App-header">
      <div className="welcome-message" style={{textAlign: 'center', backgroundColor: 'rgba(100, 200, 200, 0.3)', padding: '1em', borderRadius: '0.5em'}}>
      <p style={{fontWeight: 'bold', fontSize: '2em'}}>
        Welcome to 
        <span style={{ color: '#3aa0ac' }}> D</span> 
        <span style={{ color: '#3aa0ac' }}>E</span> 
        <span style={{ color: '#3aa0ac' }}>a</span>
        <span style={{ color: '#3aa0ac' }}>M</span> 
        <span style={{ color: '#3aa0ac' }}>O</span> 
        <span style={{ color: '#3aa0ac' }}>N</span> 
      </p>
      <p>
        <span style={{ color: '#3aa0ac' }}><strong> D</strong></span>escendant
        <span style={{ color: '#3aa0ac' }}><strong> E</strong></span>quipment
        <span style={{ color: '#3aa0ac' }}><strong> a</strong></span>nd
        <span style={{ color: '#3aa0ac' }}><strong> M</strong></span>odule
        <span style={{ color: '#3aa0ac' }}><strong> O</strong></span>rganizer
        <span style={{ color: '#3aa0ac' }}><strong> N</strong></span>exus
      </p>
      </div>
      <p style={{marginTop: '1em'}}>To lookup user Information, enter their Name#ID into the box in the top-right</p>
      
      <p>Zone Rewards can be viewed on the "Zones" page</p>
      
      <p>The Sandbox is a drag-and-drop tool to create your own configurations and share them with others!</p>
      
      <p>If anything breaks or you have suggestions, contact me on Discord: <code>t14d3</code></p>
      </header>
    </div>
  );
}

export default LandingPage;
