import React, { useState } from 'react';
import './css/example.css';
import MenuBar from './components/menu';
import config from './components/config.json';

const ExamplePage = () => {

  // State to hold form data
  const [formData, setFormData] = useState({ name: '', email: '' });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_URL}/api/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Data submitted successfully');
      } else {
        console.error(response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };
    
  // Render the form
  return (
    <div>
      <MenuBar />
      <div className="form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
    </div>
    
  );
};

export default ExamplePage;
