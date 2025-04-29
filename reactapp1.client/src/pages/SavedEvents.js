import React from 'react';
import "../css/ManageEvents.css";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const SavedEvents = () => {
  // بيانات تجريبية
  const savedEvents = [
    {
      id: 1,
      title: "Tech Festival 2025",
      date: "2025-08-10",
      location: "Cairo",
      description: "A festival for all tech enthusiasts in MENA region."
    },
    {
      id: 2,
      title: "Startup Meetup",
      date: "2025-05-21",
      location: "Alexandria",
      description: "Connecting founders, investors and mentors together."
    }
  ];

  const handleRegister = (id) => {
    alert(`Registered for event with ID: ${id}`);
  };

  const handleRemove = (id) => {
    alert(`Removed event with ID: ${id} from saved list`);
  };

  return (
    <div className="manage-container p-4">
      <h3 className="mb-4 text-center">🎯 Saved Events</h3>

      {savedEvents.length === 0 ? (
        <p className="text-muted text-center">You haven’t saved any events yet.</p>
      ) : (
        <Row xs={1} md={2} className="g-4">
          {savedEvents.map((event) => (
            <Col key={event.id}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title className="text-primary">{event.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {event.date} | {event.location}
                  </Card.Subtitle>
                  <Card.Text>{event.description}</Card.Text>
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button variant="success" size="sm" onClick={() => handleRegister(event.id)}>
                      Register
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleRemove(event.id)}>
                      Remove
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
