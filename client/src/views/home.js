import React, { useEffect, useState } from 'react';
import MenuBar from './components/menu';
import config from './components/config.json';

import { Card, Row, Col } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import './css/basic_style.css';

const HomePage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(config.API_URL);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <div>
      <MenuBar />
      <Container className="marginTitle">
        <h2><span className="badge text-bg-secondary ">Home Page</span></h2>
      </Container>
      {/* {data ? (
        <div>
          <p>Status: {data.status}</p>
          <p>Node Network ID: {data.node_network_id}</p>
          <p>Host Name: {data.host_name}</p>
          <p>Server Port: {data.server_port}</p>
        </div>
      ) : (
        <p>Status: connection error</p>
      )} */}

      {data ? (
        <Container className="marginToleft">
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <h5 className="text-uppercase text-muted mb-0">System Status</h5>
                  <span className="h2 font-weight-bold mb-0 text-uppercase text-success">{data.status} <i className="bi bi-wifi"></i></span>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <h5 className="text-uppercase text-muted mb-0">Node Network ID</h5>
                  <span className="h2 font-weight-bold mb-0">{data.node_network_id} <i className="bi bi-key"></i></span>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <h5 className="text-uppercase text-muted mb-0">Host Name</h5>
                  <span className="h2 font-weight-bold mb-0 text-uppercase">{data.host_name} <i className="bi bi-geo-alt"></i></span>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <h5 className="text-uppercase text-muted mb-0">Server Port</h5>
                  <span className="h2 font-weight-bold mb-0 text-uppercase">{data.server_port} <i className="bi bi-broadcast-pin"></i></span>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      ) : (
        <p>Status: connection error</p>
      )}
    </div>
  );
};

export default HomePage;
