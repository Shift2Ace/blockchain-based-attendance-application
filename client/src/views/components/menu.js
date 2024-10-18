import React from 'react';
import { Link } from 'react-router-dom';
import '../css/menu.css';

const MenuBar = () => {
  return (
    <nav className="menu-bar">
      <ul>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/node">Node</Link></li>
        <li><Link to="/wallet">Wallet</Link></li>
        <li><Link to="/attendance">Attendance</Link></li>
        <li><Link to="/example">Example</Link></li>
      </ul>
    </nav>
  );
};

export default MenuBar;
