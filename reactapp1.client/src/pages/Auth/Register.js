import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import "../../css/Login.css";

const Signup = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        const isAttendee = data.role === "participant";

        const body = {
            fullName: data.name,
            email: data.email,
            passwordHash: data.password,
            role: isAttendee ? "Attendee" : "Organizer",
            isApproved: isAttendee, // true for Attendee, false for Organizer
            refreshToken: "", // set initially to empty string
            refreshTokenExpiryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        try {
            const response = await fetch("api/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Registration failed.");
            }

            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="login-container d-flex justify-content-center align-items-center" style={{ marginTop: "100px" }}>
            <Card style={{ width: "30rem" }} className="p-4 shadow">
                <Card.Body>
                    <h2 className="text-center mb-4">Register</h2>

                    {error && <Alert variant="danger" className="p-2">{error}</Alert>}
                    {success && <Alert variant="success" className="p-2">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name *</Form.Label>
                            <Form.Control type="text" name="name" required placeholder="Enter your full name" disabled={isSubmitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control type="email" name="email" required placeholder="Enter your email" disabled={isSubmitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password *</Form.Label>
                            <Form.Control type="password" name="password" required placeholder="Enter your password" disabled={isSubmitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password *</Form.Label>
                            <Form.Control type="password" name="confirmPassword" required placeholder="Confirm your password" disabled={isSubmitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Role *</Form.Label>
                            <Form.Select name="role" defaultValue="participant" required disabled={isSubmitting}>
                                <option value="participant">Participant</option>
                                <option value="organizer">Event Organizer</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Only visible if "organizer" is selected (controlled by JavaScript or React logic) */}
                        <Form.Group className="mb-3">
                            <Form.Label>Organization Name</Form.Label>
                            <Form.Control type="text" name="organizationName" placeholder="Enter organization name" disabled={isSubmitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control type="text" name="address" placeholder="Enter address" disabled={isSubmitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phone (Optional)</Form.Label>
                            <Form.Control type="text" name="phone" placeholder="Enter phone number" disabled={isSubmitting} />
                        </Form.Group>

                        <Button className="btn btn-dark w-100" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Registering..." : "Sign Up"}
                        </Button>

                        <p className="text-center mt-4">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary fw-bold">Login here</Link>
                        </p>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Signup;
