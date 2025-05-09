// src/pages/EventDetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await axios.get(`/api/events/${id}`);
                setEvent(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load event.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loading) return <div className="text-center p-5"><Spinner /></div>;
    if (error) return <Alert variant="danger" className="p-3">{error}</Alert>;
    if (!event) return null;

    return (
        <div className="container p-5 d-flex justify-content-center">
            <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "600px" }}>
                <h2 className="mb-3 text-center">{event.title}</h2>
                <p><strong>Organizer:</strong> {event.organizerName}</p>
                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.venue}</p>
                <p><strong>Ticket Price:</strong> {event.ticketPrice} EGP</p>
                <p><strong>Tickets Left:</strong> {event.ticketsLeft}</p>
                <p><strong>Participants:</strong> {event.participantsSubmitted}</p>
            </div>
        </div>
    );
};

export default EventDetails;
