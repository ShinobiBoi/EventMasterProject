import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import "../../css/ManageEvents.css";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from './authUtils';

const ReviewEvents = () => {

    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (!authToken || !isAdmin()) {
            setError("Unauthorized access");
            setLoading(false);
            return;
        }
        fetchUnsubmittedEvents();
    }, [authToken]);

    const isAdmin = () => {
        const role = getUserRole(authToken);
        return role === "Admin";
    };

    const fetchUnsubmittedEvents = async () => {
        try {
            const response = await fetch("/api/events/unsubmitted", {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch events");

            const data = await response.json();
            setEvents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const approveEvent = async (eventId) => {
        try {
            const response = await fetch(`/api/events/approve/${eventId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to approve event");

            setSuccess("Event approved successfully");
            setError(null);
            fetchUnsubmittedEvents();
        } catch (err) {
            setError(err.message);
            setSuccess(null);
        }
    };

    const rejectEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to reject this event?")) return;

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });

            if (!response.ok) throw new Error("Failed to reject event");

            setSuccess("Event rejected successfully");
            setError(null);
            fetchUnsubmittedEvents();
        } catch (err) {
            setError(err.message);
            setSuccess(null);
        }
    };

    const handleView = async (eventId) => {
        navigate(`/manage-events/events/${eventId}`);
    };

    if (!authToken || !isAdmin()) {
        return (
            <div className="manage-container">
                <Alert variant="danger">Unauthorized access</Alert>
            </div>
        );
    }

    if (loading) {
        return <div className="manage-container">Loading...</div>;
    }

    return (
        <div className="manage-container">
            <div className="manage-events p-5">
                <div className="header d-flex justify-content-between mb-5">
                    <h3 className="text-center">Review Pending Events</h3>
                </div>

                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                        {success}
                    </Alert>
                )}

                {events.length === 0 ? (
                    <Alert variant="info">No pending events to review</Alert>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Event Name</th>
                                <th>Description</th>
                                <th>Organizer</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.eventid}>
                                    <td>{event.eventid}</td>
                                    <td>{event.title}</td>
                                    <td>{event.description}</td>
                                    <td>{event.organizerName}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="mx-1"
                                            onClick={() => approveEvent(event.eventid)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="mx-1"
                                            onClick={() => rejectEvent(event.eventid)}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            className="mx-1"
                                            onClick={() => handleView(event.eventid)}
                                        >
                                            View
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

export default ReviewEvents;
