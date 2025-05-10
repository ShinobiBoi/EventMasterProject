import React, { useState, useEffect } from "react";
import EventsCard from "../../components/EventCard";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import axios from "axios";
import { getUserId } from '../manage-events/authUtils';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);

    const [filterLocation, setFilterLocation] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [searchTitle, setSearchTitle] = useState("");

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

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRegister = async (event) => {
        const token = localStorage.getItem("token");
        const userId = getUserId(token);

        try {
            const ticketResponse = await fetch(`/api/tickets/${userId}/${event.eventid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    numberOfTickets: 1,  // Fixed to 1 ticket
                    totalPrice: event.ticketPrice  // Total price equals event price
                })
            });

            if (!ticketResponse.ok) {
                throw new Error("Failed to register for event");
            }

            const eventResponse = await fetch(`/api/events/register/${event.eventid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ticketCount: 1  // Registering 1 ticket
                })
            });

            if (!eventResponse.ok) {
                throw new Error("Failed to update event registration");
            }

            alert("Successfully registered for the event!");
            fetchEvents();
        } catch (error) {
            alert("Registration error: " + error.message);
        }
    };
    const handleSaveEvent = async (eventId) => {
        const token = localStorage.getItem("token");
        const userId = getUserId(token);

        if (!userId) {
            alert("Please login to save events");
            return;
        }

        setSaveLoading(true);
        try {
            const response = await fetch(`/api/savedevents/${userId}/${eventId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save event");
            }

            alert("Event saved successfully!");
        } catch (error) {
            console.error("Error saving event:", error);
            alert(error.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const locationOptions = [
        "Alexandria", "Aswan", "Assiut", "Beheira", "Beni Suef", "Cairo", "Dakahlia",
        "Damietta", "Fayoum", "Gharbia", "Giza", "Ismailia", "Kafr el-Sheikh", "Matrouh",
        "Minya", "Menofia", "New Valley", "North Sinai", "Port Said", "Qualyubia", "Qena",
        "Red Sea", "Al-Sharqia", "Soha", "South Sinai", "Suez", "Luxor"
    ];

    // Filtered event list based on location, date, and title search
    const filteredEvents = events.filter(event => {
        const matchesLocation = !filterLocation || event.venue === filterLocation;
        const matchesDate = !filterDate || new Date(event.eventDate).toISOString().slice(0, 10) === filterDate;
        const matchesTitle = !searchTitle || event.title.toLowerCase().includes(searchTitle.toLowerCase());
        return matchesLocation && matchesDate && matchesTitle;
    });

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

            {/* Error */}
            {error && (
                <Alert variant="danger" className="p-2">
                    {error}
                </Alert>
            )}

            {/* No Events */}
            {!loading && !error && filteredEvents.length === 0 && (
                <Alert variant="info" className="p-2">
                    No events found matching your filters.
                </Alert>
            )}

            {/* Filter Section */}
            <Form className="mb-4">
                <Form.Group className="mb-3 d-flex gap-3 flex-wrap align-items-end">
                    <div>
                        <Form.Label className="mb-1">Search Title:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter event title"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            style={{ minWidth: "200px" }}
                        />
                    </div>

                    <div>
                        <Form.Label className="mb-1">Filter by Location:</Form.Label>
                        <Form.Select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            style={{ minWidth: "200px" }}
                        >
                            <option value="">All Locations</option>
                            {locationOptions.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <div>
                        <Form.Label className="mb-1">Filter by Date:</Form.Label>
                        <Form.Control
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{ maxWidth: "200px" }}
                        />
                    </div>
                </Form.Group>
            </Form>

            {/* Events List */}
            <div className="row">
                {filteredEvents.map((event) => (
                    <div className="col-md-4 card-event-container my-4" key={event.eventid}>
                        <EventsCard
                            eventId={event.eventid}
                            title={event.title}
                            organizer={event.organizerName}
                            description={event.description}
                            location={event.venue}
                            date={new Date(event.eventDate).toLocaleDateString()}
                            ticketPrice={event.ticketPrice}
                            ticketsLeft={event.ticketsLeft}
                            participantsSubmitted={event.participantsSubmitted}
                            userId={event.userId}
                            onRegister={() => handleRegister(event)}
                            onSave={() => handleSaveEvent(event.eventid)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
