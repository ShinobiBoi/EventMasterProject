import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import "../../css/ManageEvents.css";
import Alert from "react-bootstrap/Alert";

const ReviewEvents = () => {
  return (
    <div className="manage-container">
    <div className="manage-events p-5">
      <div className="header d-flex justify-content-between mb-5">
        <h3 className="text-center">Review Pending Events</h3>
      </div>

      {/* <Alert variant="danger" className="p-2">
    Failed to load events
    </Alert>

    <Alert variant="success" className="p-2">
    Event approved successfully
    </Alert> */}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>id</th>
            <th>Image</th>
            <th>Event Name</th>
            <th>Description</th>
            <th>Organizer</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Example row */}
          <tr>
            <td>1</td>
            <td>
              <img
                src="https://picsum.photos/200/300"
                alt="event"
                className="image-avatar"
              />
            </td>
            <td>Tech Conference 2025</td>
            <td>A conference about the latest in AI and tech</td>
            <td>Organizer Name</td>
            <td>
              <button className="btn btn-sm btn-success mx-1">Accept</button>
              <button className="btn btn-sm btn-danger mx-1">Reject</button>
              <button className="btn btn-sm btn-info mx-1">View</button>
            </td>
          </tr>
          {/* Repeat for other events */}
        </tbody>
      </Table>
    </div>
    </div>
  );
};

export default ReviewEvents;
