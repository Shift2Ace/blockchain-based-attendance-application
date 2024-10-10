import React from 'react';
import { Navigate } from 'react-router-dom';
import MenuBar from './components/menu';

const NodePage = () => {
  // Check if the hostname is localhost
  const isLocalhost = window.location.hostname === 'localhost';

  if (!isLocalhost) {
    // Redirect to home page if not localhost
    return <Navigate to="/home" />;
  }

  return (
    <div>
      <MenuBar />
      <h1>Node Page</h1>
      <p>This page can only be accessed from localhost.</p>
    </div>
  );
};

export default NodePage;