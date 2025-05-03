import React, { useState, useEffect } from "react";
import EventsCard from "../../components/EventCard";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import axios from "axios";

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("api/events");
                setEvents(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load events.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="home-container p-5">
            {/* Loader */}
            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {/* Errors */}
            {error && (
                <Alert variant="danger" className="p-2">
                    {error}
                </Alert>
            )}

            {/* No Events */}
            {!loading && !error && events.length === 0 && (
                <Alert variant="info" className="p-2">
                    No Events, please try again later!
                </Alert>
            )}

            {/* Filter */}
            <Form className="mb-4">
                <Form.Group className="mb-3 d-flex gap-2 flex-wrap align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Search by Title"
                        className="rounded-0"
                        style={{ maxWidth: "200px" }}
                    />
                    <Form.Control
                        type="text"
                        placeholder="Search by Location"
                        className="rounded-0"
                        style={{ maxWidth: "200px" }}
                    />
                    <Form.Control
                        type="date"
                        className="rounded-0"
                        style={{ maxWidth: "180px" }}
                    />
                    <button className="btn btn-dark rounded-0 px-4">Search</button>
                </Form.Group>
            </Form>

            {/* Events List */}
            <div className="row">
                {events.map((event) => (
                    <div className="col-md-4 card-event-container my-4" key={event.eventid}>
                        <EventsCard
                            title={event.title}
                            organizer={event.organizerName}
                            description={event.description}
                            location={event.venue}
                            date={new Date(event.eventDate).toLocaleDateString()}
                            ticketPrice={event.ticketPrice}
                            ticketsLeft={event.ticketsLeft}
                            participants={event.participantsSubmitted}
                            onRegister={() => console.log("Register", event.eventid)}
                            onSave={() => console.log("Save", event.eventid)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
