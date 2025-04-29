import React, { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";


const UpdateEvent = () => {

  return (
    <div className="login-container">
      <h1>Update Event Form</h1>


        <Alert variant="danger" className="p-2">
          somthing went wrong
        </Alert>



        <Alert variant="success" className="p-2">
          evene added successfully 
        </Alert>


      <Form  className="text-center py-2">
        <img
          alt='{event.name}'
          style={{
            width: "50%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "10px",
          }}
          src='https://picsum.photos/200/300' 
        />

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Event Name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <textarea
            className="form-control"
            placeholder="Description"
            value='{event.description}'
            rows={5}></textarea>
        </Form.Group>

        <Form.Group className="mb-3">
          <input type="file" className="form-control" ref='{image}' />
        </Form.Group>

        <Button className="btn btn-dark w-100" variant="primary" type="submit">
          Update Event
        </Button>
      </Form>
    </div>
  );
};

export default UpdateEvent;
