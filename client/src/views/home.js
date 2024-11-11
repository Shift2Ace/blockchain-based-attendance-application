import React, { useEffect, useState } from 'react';
import MenuBar from './components/menu';
import config from './components/config.json';

import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import './css/basic_style.css';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(config.API_URL);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <div>
      <MenuBar />
      <br></br>
      <main>
        {loading ? (
          <Container className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Container>
        ) : error ? (
          <Container className="text-center">
            <Alert variant="danger">
              <Alert.Heading>Connection Error</Alert.Heading>
              <p>
                There was an error fetching the data: {error}. Please try again later.
              </p>
            </Alert>
          </Container>
        ) : (
          <Container className="marginToleft">
            <Row>
              <Col>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <h5 className="text-uppercase text-muted mb-0">System Status</h5>
                    <span className="h2 font-weight-bold mb-0 text-uppercase text-success">{data.status} <i className="bi bi-wifi"></i></span>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <h5 className="text-uppercase text-muted mb-0">Host Name</h5>
                    <span className="h2 font-weight-bold mb-0 text-uppercase">{data.host_name} <i className="bi bi-geo-alt"></i></span>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <h5 className="text-uppercase text-muted mb-0">Server Port</h5>
                    <span className="h2 font-weight-bold mb-0 text-uppercase">{data.server_port} <i className="bi bi-broadcast-pin"></i></span>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        )}
      </main>
    </div>
  );
};

export default HomePage;
