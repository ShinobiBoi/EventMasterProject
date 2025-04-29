import React from "react";
import Table from "react-bootstrap/Table";
import { Button } from "react-bootstrap";
import "../../css/ManageEvents.css"; 

const ApproveOrganizers = () => {
  return (
    <div className="manage-container">
    <div className="manage-events p-5">
      <div className="header d-flex justify-content-between mb-4">
        <h3 className="text-center">New organizer Accounts</h3>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>id</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>

            <tr >
              <td>1</td>
              <td>organizer name</td>
              <td>Example@gamil.com</td>
              <td>
                <Button className="btn-sm btn-success me-2">Accept</Button>
                <Button className="btn-sm btn-danger">Reject</Button>
              </td>
            </tr>
        </tbody>
      </Table>
    </div>
    </div>
  );
};

export default ApproveOrganizers;
