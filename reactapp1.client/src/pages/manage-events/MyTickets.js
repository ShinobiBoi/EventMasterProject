import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import "../../css/ManageEvents.css";
import { Link, useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { getUserId, getUserRole } from './authUtils';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userId = getUserId(token);
    const userRole = getUserRole(token);

    const fetchTickets = async () => {
        if (userRole !== "Attendee") {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`/api/tickets/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setTickets(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load your tickets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole !== "Attendee") {
            navigate("/");
            return;
        }
        fetchTickets();
    }, [userId, userRole, navigate]);

    const handleView = (eventId) => {
        navigate(`/manage-events/events/${eventId}`);
    };

    if (userRole !== "Attendee") {
        return null;
    }

    return (
        <div className="manage-container">
            <div className="manage-events p-5">
                <div className="header d-flex justify-content-between mb-5">
                    <h3 className="text-center">My Tickets</h3>
                </div>

                {loading && (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="p-2" onClose={() => setError("")} dismissible>
                        {error}
                    </Alert>
                )}

                {!loading && !error && tickets.length === 0 && (
                    <Alert variant="info" className="p-2">
                        You haven't purchased any tickets yet. Browse events to get started!
                    </Alert>
                )}

                {!loading && tickets.length > 0 && (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Event Name</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.ticketId}>
                                    <td>{ticket.ticketId}</td>
                                    <td>{ticket.eventTitle}</td>
                                    <td>{ticket.eventDescription}</td>
                                    <td>{new Date(ticket.eventDate).toLocaleDateString()}</td>
                                    <td>{ticket.eventVenue}</td>
                                    <td>{ticket.quantity}</td>
                                    <td>{ticket.totalPrice} EGP</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-info"
                                            onClick={() => handleView(ticket.eventId)}
                                        >
                                            View Event
                                        </button>
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

export default MyTickets;