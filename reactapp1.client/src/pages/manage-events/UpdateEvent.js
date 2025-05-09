import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import "../../css/Login.css";
import { getUserId, getUserRole } from './authUtils';

const UpdateEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        eventDate: '',
        ticketPrice: 0,
        ticketsLeft: 0,
        participantsSubmitted: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
    const userId = getUserId(token);
    const userRole = getUserRole(token);
    const organizerName = localStorage.getItem("userName");

    // Fetch event data when component mounts
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`/api/events/${eventId}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Include the token in the request headers
                    }
                });
                setEvent(response.data);
                // Pre-fill form with existing data
                setFormData({
                    title: response.data.title,
                    description: response.data.description,
                    venue: response.data.venue,
                    eventDate: new Date(response.data.eventDate).toISOString().slice(0, 16),
                    ticketPrice: response.data.ticketPrice,
                    ticketsLeft: response.data.ticketsLeft,
                    participantsSubmitted: response.data.participantsSubmitted || 0
                });
            } catch (err) {
                console.error("Error fetching event:", err);
                setError("Failed to load event data");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const requestBody = {
                ...formData,
                organizerName,
                userId, // Include userId if needed
                submitted: true
            };

            await axios.put(`/api/events/${eventId}`, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}` // Include the token in the request headers
                }
            });
            setSuccess("Event updated successfully!");
            setTimeout(() => navigate("/manage-events"), 2000);
        } catch (err) {
            console.error("Update error:", err);
            setError(err.response?.data?.message || "Failed to update event");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !event) {
        return (
            <div className="login-container">
                <Spinner animation="border" />
                <p>Loading event data...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="login-container">
                <Alert variant="danger">Event not found</Alert>
            </div>
        );
    }

    return (
        <div className="login-container">
            <h1>Update Event</h1>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Event Title *</Form.Label>
                    <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Venue *</Form.Label>
                    <Form.Control
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Event Date and Time *</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Ticket Price *</Form.Label>
                    <Form.Control
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Available Tickets *</Form.Label>
                    <Form.Control
                        type="number"
                        name="ticketsLeft"
                        value={formData.ticketsLeft}
                        onChange={handleChange}
                        required
                        min="0"
                        disabled={loading}
                    />
                </Form.Group>

                <div className="d-flex gap-2">
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Event'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/manage-events")}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default UpdateEvent;