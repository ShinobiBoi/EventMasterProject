import React, { useEffect, useState } from 'react';
import "../../css/ManageEvents.css";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { getUserId, getUserRole } from './authUtils';
import { useNavigate } from 'react-router-dom';

const SavedEvents = () => {
    const [savedEvents, setSavedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removing, setRemoving] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userId = getUserId(token);
    const userRole = getUserRole(token);

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
            // Transform the data to only include the required fields
            const simplifiedEvents = data.map(event => ({
                eventid: event.eventid,
                title: event.title,
                description: event.description,
                eventDate: event.eventDate,
                venue: event.venue
            }));
            setSavedEvents(simplifiedEvents || []);
        } catch (err) {
            console.error("Error fetching saved events:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchSavedEvents();
        }
    }, [userId, token]);

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

            alert("Event removed from your saved list");
            await fetchSavedEvents();

        } catch (error) {
            console.error("Error removing event:", error);
            alert(error.message);
        } finally {
            setRemoving(false);
        }
    };

    const handleView = (eventId) => {
        navigate(`/manage-events/events/${eventId}`);
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
                    {savedEvents.map((event) => (
                        <Col key={event.eventid}>
                            <Card className="shadow-sm h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-primary">{event.title}</Card.Title>
                                    <Card.Text>
                                        <strong>Description:</strong> {event.description}
                                    </Card.Text>
                                    <div className="mb-3">
                                        <p className="mb-1"><strong>📅 Date:</strong> {new Date(event.eventDate).toLocaleString()}</p>
                                        <p className="mb-1"><strong>📍 Location:</strong> {event.venue}</p>
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-3">
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => handleView(event.eventid)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemove(event.eventid)}
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