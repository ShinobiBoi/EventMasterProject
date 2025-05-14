import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "../css/EventCard.css";
import { useNavigate } from "react-router-dom";

const EventsCard = ({
    eventId,
    title,
    organizer,
    description,
    location,
    date,
    ticketPrice,
    ticketsLeft,
    participantsSubmitted,
    onRegister,
    onSave,
    userId,
    isApproved
}) => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole");

    const handleViewEvent = () => {
        navigate(`/manage-events/events/${eventId}`);
    };

    const renderRegistserButton = () => {
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
                    onClick={onRegister}
                >
                    Register Now
                </Button>
            );
        } else {
            return null;
        }
    };

    const renderSaveButton = () => {
        if (userRole) {
            return (
                <Button
                    variant="outline-warning"
                    className={"w-50 fw-semibold"}
                    onClick={onSave}
                >
                    Save Event
                </Button>
            );
        }
        return null;
    };

    return (
        <Card className="shadow rounded-4 p-4 border-0">
            <Card.Body className="d-flex flex-column gap-4">
                {/* Event Title and Status */}
                <div className="text-center">
                    <h3 className="fw-bold mb-1">{title}</h3>
                    <small className="text-muted">Organized by {organizer}</small>
                    <div className="status-indicator mt-2">
                        <span className={`status-dot ${isApproved ? 'approved' : 'pending'}`} />
                        {isApproved ? 'Approved' : 'Pending Approval'}
                    </div>
                </div>

                {/* Event Details */}
                <div className="px-2">
                    <div className="d-flex flex-wrap justify-content-between mt-3">
                        <div className="mb-2" style={{ minWidth: "45%" }}>
                            <strong>📍 Location:</strong><br />
                            <span className="text-secondary">{location}</span>
                        </div>
                        <div className="mb-2" style={{ minWidth: "45%" }}>
                            <strong>📅 Date:</strong><br />
                            <span className="text-secondary">{date}</span>
                        </div>
                        <div className="mb-2" style={{ minWidth: "45%" }}>
                            <strong>💰 Ticket Price:</strong><br />
                            <span className="text-secondary">{ticketPrice} EGP</span>
                        </div>
                        <div className="mb-2" style={{ minWidth: "45%" }}>
                            <strong>🎟️ Tickets Left:</strong><br />
                            <span className="text-secondary">{ticketsLeft}</span>
                        </div>
                    </div>
                </div>

                {/* Real-time Updates Section */}
                <div className="ticket-info">
                    <div className="d-flex justify-content-between">
                        <span>Participants: {participantsSubmitted}</span>
                        <span className={`availability ${ticketsLeft < 5 ? 'text-danger' : 'text-success'}`}>
                            {ticketsLeft < 5 ? 'Almost Gone!' : 'Available'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3">
                    {renderRegistserButton()}
                    {renderSaveButton()}
                    <Button
                        variant="info"
                        className="w-50 fw-semibold"
                        onClick={handleViewEvent}
                    >
                        View Event
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default EventsCard;