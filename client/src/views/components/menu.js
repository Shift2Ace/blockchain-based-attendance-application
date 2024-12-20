import React from 'react';
// import { Link } from 'react-router-dom';
import '../css/menu.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import '../css/basic_style.css';

//get logo image 
const { protocol, hostname, port } = window.location;
const domainUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
const logoUrl = `${domainUrl}/main-logo-3x.png`;

const MenuBar = () => {
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  return (
    <Navbar bg="light" data-bs-theme="light" expand="lg" className="bg-body-tertiary">
      <Container fluid className="marginToleft">
        <Navbar.Brand href="/home">
          <img
            alt=""
            src={logoUrl}
            width="180"
            height="35"
            className="d-inline-block align-top"
          />{' '}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/home">Home</Nav.Link>
            {isLocalhost && <Nav.Link href="/node">Node</Nav.Link>}            <Nav.Link href="/wallet">Wallet</Nav.Link>
            <Nav.Link href="/attendance">Attendance</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MenuBar;
