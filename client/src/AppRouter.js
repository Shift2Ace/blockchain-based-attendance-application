import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './views/home';
import NodePage from './views/node';
import WalletPage from './views/wallet';
import ExamplePage from './views/example';

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/node" element={<NodePage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/example" element={<ExamplePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  </Router>
);

export default AppRouter;
