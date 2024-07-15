import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/user/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Determine current hostname
  const currentHostname = window.location.hostname;

  // Render link and button text based on hostname
  let linkComponent, buttonText;
  if (currentHostname === 'tfd.t14d3.de') {
    linkComponent = <Link to="https://dev.t14d3.de">DEV</Link>;
    buttonText = 'DEV';
  } else if (currentHostname === 'dev.t14d3.de') {
    linkComponent = <a href="https://tfd.t14d3.de">Stable</a>;
    buttonText = 'Stable';
  } else {
    linkComponent = <Link to="https://dev.t14d3.de">DEV</Link>;
    buttonText = 'DEV';
  }

  return (
    <header className="header">
      <nav className="nav-container">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">Home</Link></li>
          <li className="nav-item"><Link to="/zones">Zones</Link></li>
          <li className="nav-item"><Link to="/sandbox">Sandbox</Link></li>
          <li className="nav-item">
            {linkComponent}
          </li>
        </ul>

        {/* Search form */}
        <div className="search">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user..."
            />
            <button type="submit" className="search-button">Search</button>
          </form>
        </div>
      </nav>
    </header>
  );
}

export default Header;