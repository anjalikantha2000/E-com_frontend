import React, { useState } from "react";

const UserForm = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      setMessage(data.message);

      setFormData({
        name: "",
        email: "",
        phone: "",
      });

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          width: "350px",
        }}
      >
        <h2 style={{ textAlign: "center" }}>User Form</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="text"
          name="phone"
          placeholder="Enter Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Submit
        </button>

        {message && (
          <p style={{ color: "green", textAlign: "center" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

// Inline Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default UserForm;
