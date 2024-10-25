import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './views/home';
import NodePage from './views/node';
import AddressCreate from './views/address_create';
import AddressManager from './views/address_manager';
import AddressAdd from './views/address_add';
import SidRegister from './views/sid_register';
import Attendance from './views/attendance'

import ExamplePage from './views/example';

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/node" element={<NodePage />} />
      <Route path="/wallet/create_address" element={<AddressCreate />} />
      <Route path="/wallet/add_address" element={<AddressAdd />} />
      <Route path="/wallet/register" element={<SidRegister />} />
      <Route path="/wallet" element={<AddressManager />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/example" element={<ExamplePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  </Router>
);

export default AppRouter;
