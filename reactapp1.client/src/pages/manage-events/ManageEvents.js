import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import "../../css/ManageEvents.css";
import { Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import "../../css/ManageEvents.css";

const ManageEvents = () => {
  return (
    <div className="manage-container">
      <div className="manage-events p-5">
      <div className="header d-flex justify-content-between mb-5">
        <h3 className="text-center ">Manage Events</h3>
        <Link to={"add"} className="btn btn-success">
          Add New Event +
        </Link>
      </div>

      {/* <Alert variant="danger" className="p-2">
        This is simple alert
      </Alert>

      <Alert variant="success" className="p-2">
        This is simple alert
      </Alert> */}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>id</th>
            <th>Image</th>
            <th> Name</th>
            <th> Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>id</td>
            <td>
              <img
                src="https://picsum.photos/200/300"
                alt="there is no picture "
                className="image-avatar"
              />
            </td>
            <td> Event name </td>
            <td>Event description</td>
            <td>
              <button className="btn btn-sm btn-danger">Delete</button>
              <Link to={""} className="btn btn-sm btn-primary mx-2">
                Update
              </Link>
              <Link to={"/"} className="btn btn-sm btn-info">
                show
              </Link>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
    </div>
  );
};

export default ManageEvents;
