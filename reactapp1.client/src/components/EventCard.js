import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "../css/EventCard.css";

const EventsCard = ({
  title,
  organizer,
  description,
  location,
  date,
  ticketPrice,
  ticketsLeft,
  participants,
  onRegister,
  onSave,
}) => {
  return (
    <Card className="shadow rounded-4 overflow-hidden">
      <Card.Img
        className="card-image"
        variant="top"
        src="https://picsum.photos/400/250"
        alt="Event"
      />
      <Card.Body className="d-flex flex-column justify-content-between">
        <Card.Title className="text-center fw-bold fs-4 mb-3">{title}</Card.Title>
        <Card.Text className="mb-3">
          <div><strong>🎤 Organizer:</strong> {organizer}</div>
          <div><strong>📝 Description:</strong> {description}</div>
          <div><strong>📍 Location:</strong> {location}</div>
          <div><strong>📅 Date:</strong> {date}</div>
          <div><strong>💰 Ticket Price:</strong> {ticketPrice} EGP</div>
          <div><strong>🎟️ Tickets Left:</strong> {ticketsLeft}</div>
          <div><strong>👥 Participants:</strong> {participants}</div>
        </Card.Text>

        <div className="d-flex gap-2">
          <Button variant="success" className="w-50" onClick={onRegister}>
            Register Now
          </Button>
          <Button variant="warning" className="w-50" onClick={onSave}>
            Save Event
          </Button>
        </div>
      </Card.Body>
    </Card>

  )};

  export default EventsCard;