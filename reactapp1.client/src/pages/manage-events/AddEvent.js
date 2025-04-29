import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import "../../css/Login.css";

const AddEvent = () => {


    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);




    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        // Convert FormData to a plain object

        const body = Object.fromEntries(formData.entries());
        const data = {
            ...body,
            submitted: true
        };
        console.log('Form data:', data);



        try {

           
/*            // Debugging logs
            console.log("Submitting event:", data);
            const token = localStorage.getItem('token');
            console.log("Using token:", token);*/

            const apiUrl = process.env.REACT_APP_API_URL || 'https://localhost:5008';
            const response = await fetch(`${apiUrl}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    //'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.text();

            // Check if response is HTML (error case)
            if (responseData.startsWith('<!DOCTYPE html>')) {
                throw new Error("Authentication required or server error");
            }

            // Try to parse JSON
            let result;
            try {
                result = JSON.parse(responseData);
            } catch (e) {
                throw new Error("Invalid server response");
            }

            if (!response.ok) {
                throw new Error(result.message || `Server error: ${response.status}`);
            }

            setSuccess("Event added successfully!");
            // Reset form

        } catch (err) {
            console.error("Submission error:", err);
            setError(err.message || "Failed to add event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <h1>Add New Event Form</h1>

            {error && <Alert variant="danger" className="p-2">{error}</Alert>}
            {success && <Alert variant="success" className="p-2">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Organizer Name *</Form.Label>
                    <Form.Control
                        type="text"
                        name="organizerName"
                        required
                        placeholder="Enter organizer name"
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Event Title *</Form.Label>
                    <Form.Control
                        type="text"
                        name="title"
                        required
                        placeholder="Enter event title"
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        placeholder="Enter event description"
                        rows={4}
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Venue *</Form.Label>
                    <Form.Control
                        type="text"
                        name="venue"
                        required
                        placeholder="Enter venue location"
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Event Date and Time *</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        name="eventDate"
                        required
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Ticket Price *</Form.Label>
                    <Form.Control
                        type="number"
                        name="ticketPrice"
                        required
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Available Tickets *</Form.Label>
                    <Form.Control
                        type="number"
                        name="ticketsLeft"
                        required
                        placeholder="0"
                        min="0"
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Initial Participants Count</Form.Label>
                    <Form.Control
                        type="number"
                        name="participantsSubmitted"
                        placeholder="0"
                        min="0"
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Button
                    className="btn btn-green w-100"
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding Event...' : 'Add New Event'}
                </Button>
            </Form>
            <p className="text-muted mt-2">* indicates required field</p>
        </div>
    );
};

export default AddEvent;