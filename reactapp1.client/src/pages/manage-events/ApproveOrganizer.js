import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import "../../css/ManageEvents.css";

const ApproveOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const fetchPendingOrganizers = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/user/pending-organizers", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrganizers(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load pending organizers.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`/api/user/approve-organizer/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Organizer approved.");
            fetchPendingOrganizers();
        } catch (err) {
            console.error(err);
            alert("Failed to approve organizer.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject (delete) this organizer?")) return;

        try {
            await axios.delete(`/api/user/delete-user/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Organizer rejected and deleted.");
            fetchPendingOrganizers();
        } catch (err) {
            console.error(err);
            alert("Failed to reject organizer.");
        }
    };

    useEffect(() => {
        fetchPendingOrganizers();
    }, []);

    return (
        <div className="manage-container">
            <div className="manage-events p-5">
                <div className="header d-flex justify-content-between mb-4">
                    <h3 className="text-center">New Organizer Accounts</h3>
                </div>

                {loading ? (
                    <div className="text-center my-4">
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : organizers.length === 0 ? (
                    <Alert variant="info">No pending organizer requests.</Alert>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizers.map((org) => (
                                <tr key={org.userId}>
                                    <td>{org.userId}</td>
                                    <td>{org.fullName}</td>
                                    <td>{org.email}</td>
                                    <td>
                                        <Button
                                            className="btn-sm btn-success me-2"
                                            onClick={() => handleApprove(org.userId)}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            className="btn-sm btn-danger"
                                            onClick={() => handleReject(org.userId)}
                                        >
                                            Reject
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default ApproveOrganizers;
