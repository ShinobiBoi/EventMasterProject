// src/pages/EventDetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "../../css/EventDetails.css"; // Create this CSS file for custom styles
import { getUserId, getUserRole } from './authUtils';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ticketCount, setTicketCount] = useState(1); // Default to 1 ticket
    const [totalPrice, setTotalPrice] = useState(0); // Total price based on ticket count
    const [userRole, setUserRole] = useState(""); // User role
    const [ticketsLeft, setTicketsLeft] = useState(0); // Tickets left
    const [isRegistering, setIsRegistering] = useState(false); // Loading state for registration

    const fetchEvent = async () => {
        try {
            const res = await axios.get(`/api/events/${id}`);
            setEvent(res.data);
            setTotalPrice(res.data.ticketPrice); // Set initial total price
            setTicketsLeft(res.data.ticketsLeft); // Set tickets left
        } catch (err) {
            console.error(err);
            setError("Failed to load event.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    useEffect(() => {
        if (event) {
            setTotalPrice(ticketCount * event.ticketPrice); // Update total price when ticket count changes
        }
    }, [ticketCount, event]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = getUserRole(token);
        setUserRole(role); // Set user role from token
    }, []);

    const handleRegister = async () => {
        const token = localStorage.getItem("token");
        const userId = getUserId(token);

        if (!token || !userId) {
            alert("Please login to register for events");
            return;
        }

        setIsRegistering(true);
        try {

                // Register ticket
                const ticketResponse = await fetch(`/api/tickets/${userId}/${event.eventid}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        numberOfTickets: ticketCount, // Fixed to 1 ticket
                        totalPrice: totalPrice // Total price equals event price
                    })
                });

                if (!ticketResponse.ok) {
                    throw new Error("Failed to register ticket");
                }

          // Register for each ticket
            for (let i = 0; i < ticketCount; i++) {
                // Update event registration with the total number of tickets
                const eventResponse = await fetch(`/api/events/register/${event.eventid}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!eventResponse.ok) {
                    throw new Error("Failed to update event registration");
                }
            }
            alert(`Successfully registered for ${ticketCount} ticket(s)!`);

            // Refresh event data
            await fetchEvent();

        } catch (error) {
            alert("Registration error: " + error.message);
        } finally {
            setIsRegistering(false);
        }
    };

    const renderRegisterButton = () => {
        if (ticketsLeft <= 0 && userRole === "Attendee") {
            return (
                <Button variant="danger" className="w-50 fw-semibold" disabled>
                    Sold Out
                </Button>
            );
        } else if (userRole === "Attendee") {
            return (
                <Button
                    variant="success"
                    className="w-50 fw-semibold"
                    onClick={handleRegister}
                    disabled={isRegistering}
                >
                    {isRegistering ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className="ms-2">Registering...</span>
                        </>
                    ) : (
                        "Register Now"
                    )}
                </Button>
            );
        } else {
            return null; // No button for other roles
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger" className="p-3">{error}</Alert>;
    if (!event) return null;

    return (
        <div className="container p-5 d-flex justify-content-center">
            <div className="card shadow-lg p-4 w-100 " style={{ maxWidth: "600px" }}>
                <h2 className="mb-3 text-center event-title">{event.title}</h2>
                <p className="event-organizer"><strong>Organizer:</strong> {event.organizerName}</p>
                <p className="event-description"><strong>Description:</strong> {event.description}</p>
                <p className="event-date"><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                <p className="event-hour"><strong>Time:</strong> {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="event-location"><strong>Location:</strong> {event.venue}</p>
                <p className="event-ticket-price"><strong>Ticket Price:</strong> {event.ticketPrice} EGP</p>
                <p className="event-tickets-left"><strong>Tickets Left:</strong> {event.ticketsLeft}</p>
                <p className="event-participants"><strong>Participants:</strong> {event.participantsSubmitted}</p>
                {userRole === "Attendee" && (
                    <>
                        <Form.Group controlId="ticketCount">
                            <Form.Label>Select Number of Tickets:</Form.Label>
                            <Form.Control
                                as="select"
                                value={ticketCount}
                                onChange={(e) => setTicketCount(Number(e.target.value))}
                                disabled={event.ticketsLeft <= 0}
                            >
                                {[...Array(event.ticketsLeft).keys()].map(i => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <p className="total-price"><strong>Total Price:</strong> {totalPrice} EGP</p>
                    </>
                )}
                {renderRegisterButton()}
            </div>
        </div>
    );
};

export default EventDetails;