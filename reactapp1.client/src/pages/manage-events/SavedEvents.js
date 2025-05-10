import React, { useEffect, useState } from 'react';
import "../../css/ManageEvents.css";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { getUserId, getUserRole } from './authUtils';

const SavedEvents = () => {
    const [savedEvents, setSavedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [registering, setRegistering] = useState(false);
    const [removing, setRemoving] = useState(false);

    const token = localStorage.getItem("token");
    const userId = getUserId(token);
    const userRole = getUserRole(token);

    useEffect(() => {
        const fetchSavedEvents = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`/api/savedevents/user/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(response.status === 404
                        ? "No saved events found"
                        : "Failed to fetch saved events");
                }

                const data = await response.json();
                setSavedEvents(data || []);

            } catch (err) {
                console.error("Error fetching saved events:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchSavedEvents();
        }
    }, [userId, token]);

    const handleRegister = async (eventid) => {
        if (!userId) {
            alert("Please login to register for events");
            return;
        }

        setRegistering(true);
        try {
            // Create ticket
            const ticketResponse = await fetch(`/api/tickets/${userId}/${eventid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!ticketResponse.ok) {
                throw new Error("Failed to create ticket");
            }

            // Update event registration
            const eventResponse = await fetch(`/api/events/register/${eventid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!eventResponse.ok) {
                throw new Error("Failed to update event registration");
            }

            // Refresh saved events to show updated ticket count
            const updatedResponse = await fetch(`/api/savedevents/user/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const updatedData = await updatedResponse.json();
            setSavedEvents(updatedData || []);

            alert("Successfully registered for the event!");

        } catch (error) {
            console.error("Registration error:", error);
            alert(error.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleRemove = async (eventId) => {
        setRemoving(true);
        try {
            const response = await fetch(`/api/savedevents/${userId}/${eventId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to remove event");
            }

            setSavedEvents(prev => prev.filter(event => event.eventId !== eventId));
            alert("Event removed from your saved list");

        } catch (error) {
            console.error("Error removing event:", error);
            alert(error.message);
        } finally {
            setRemoving(false);
        }
    };

    const renderRegisterButton = (event) => {
        if (!userRole) return null;

        if (event.ticketsLeft <= 0) {
            return (
                <Button variant="danger" size="sm" disabled>
                    Sold Out
                </Button>
            );
        }

        if (userRole === "Attendee") {
            return (
                <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleRegister(event.eventid)}
                    disabled={registering}
                >
                    {registering ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Registering...
                        </>
                    ) : (
                        "Register Now"
                    )}
                </Button>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="manage-container p-4">
                <h3 className="mb-4 text-center">🎯 Saved Events</h3>
                <Alert variant={error === "No saved events found" ? "info" : "danger"} className="text-center">
                    {error === "No saved events found"
                        ? "You haven't saved any events yet."
                        : error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="manage-container p-4">
            <h3 className="mb-4 text-center">🎯 Saved Events</h3>

            {savedEvents.length === 0 ? (
                <Alert variant="info" className="text-center">
                    You haven't saved any events yet.
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {savedEvents.map((savedEvent) => (
                        <Col key={savedEvent.savedEventId}>
                            <Card className="shadow-sm h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-primary">{savedEvent.event.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        Organized by: {savedEvent.event.organizerName}
                                    </Card.Subtitle>

                                    <div className="mb-3">
                                        <p className="mb-1"><strong>📅 Date:</strong> {new Date(savedEvent.event.eventDate).toLocaleString()}</p>
                                        <p className="mb-1"><strong>📍 Location:</strong> {savedEvent.event.venue}</p>
                                        <p className="mb-1"><strong>💰 Price:</strong> {savedEvent.event.ticketPrice} EGP</p>
                                        <p className="mb-1"><strong>🎟️ Tickets Left:</strong> {savedEvent.event.ticketsLeft}</p>
                                        <p className="mb-1"><strong>👥 Participants:</strong> {savedEvent.event.participantsSubmitted}</p>
                                    </div>

                                    <Card.Text className="flex-grow-1">
                                        <strong>Description:</strong> {savedEvent.event.description}
                                    </Card.Text>

                                    <div className="d-flex justify-content-end gap-2 mt-3">
                                        {renderRegisterButton(savedEvent.event)}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemove(savedEvent.eventId)}
                                            disabled={removing}
                                        >
                                            {removing ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Removing...
                                                </>
                                            ) : (
                                                "Remove"
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default SavedEvents;