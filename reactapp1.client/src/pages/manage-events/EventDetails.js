// src/pages/EventDetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "../../css/EventDetails.css";
import { getUserId, getUserRole } from './authUtils';
import EventHub from "../../components/EventHub";

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ticketCount, setTicketCount] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [ticketsLeft, setTicketsLeft] = useState(0);
    const [isRegistering, setIsRegistering] = useState(false);


    const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
    const userId = getUserId(token);
    const userRole = getUserRole(token);

    const fetchEvent = async () => {
        try {
            const res = await axios.get(`/api/events/${id}`);
            setEvent(res.data);
            setTotalPrice(res.data.ticketPrice);
            setTicketsLeft(res.data.ticketsLeft);
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
            setTotalPrice(ticketCount * event.ticketPrice);
        }
    }, [ticketCount, event]);

    useEffect(() => {

    }, []);

    const handleRegister = async () => {
        if (!token || !userId) {
            alert("Please login to register for events");
            return;
        }

        setIsRegistering(true);
        try {
            const ticketResponse = await fetch(`/api/tickets/${userId}/${event.eventid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    numberOfTickets: ticketCount,
                    totalPrice: totalPrice
                })
            });

            if (!ticketResponse.ok) throw new Error("Failed to register ticket");

            for (let i = 0; i < ticketCount; i++) {
                const eventResponse = await fetch(`/api/events/register/${event.eventid}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!eventResponse.ok) throw new Error("Failed to update event registration");
            }

            alert(`Successfully registered for ${ticketCount} ticket(s)!`);
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
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Registering...</span>
                        </>
                    ) : (
                        "Register Now"
                    )}
                </Button>
            );
        } else {
            return null;
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger" className="p-3">{error}</Alert>;
    if (!event) return null;

    const showEventHub = userRole === "Organizer" && userId === event.userId;
    const showEventHubforAttendee = userRole === "Attendee";

    return (
        <div className="container p-5">
            <div className="row">
                {/* Event Details Card */}
                <div className="col-md-6">
                    <div className="card shadow-lg p-4 mb-4">
                        <h2 className="mb-3 text-center event-title">{event.title}</h2>
                        <p className="event-organizer"><strong>Organizer:</strong> {event.organizerName}</p>
                        <p className="event-description"><strong>Description:</strong> {event.description}</p>
                        <p className="event-date"><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                        <p className="event-hour"><strong>Time:</strong> {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="event-location"><strong>Location:</strong> {event.venue, userRole}</p>
                        <p className="event-ticket-price"><strong>Ticket Price:</strong> {event.ticketPrice} EGP</p>
                        <p className="event-tickets-left"><strong>Tickets Left:</strong> {event.ticketsLeft}</p>
                        <p className="event-participants"><strong>Participants:</strong> {event.participantsSubmitted}</p>

                        {userRole === "Attendee" && (
                            <>
                                <Form.Group controlId="ticketCount">
                                    <Form.Label>Select Number of Tickets: </Form.Label>
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

                {/* Event Attachments & Real-time Updates (Only for Organizer of this event) */}
                {showEventHub && (
                    <div className="col-md-6">
                        <div className="card shadow-lg p-4">
                            <EventHub eventId={id} token={token} role={userRole} />
                        </div>
                    </div>
                )}
                {showEventHubforAttendee && (
                    <div className="col-md-6">
                        <div className="card shadow-lg p-4">
                            <EventHub eventId={id} token={token} role={userRole} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetails;
