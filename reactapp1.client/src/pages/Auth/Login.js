import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import { Link, useNavigate } from "react-router-dom";
import "../../css/Login.css";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            // First check if the response is JSON
            const contentType = response.headers.get("content-type");
            let errorMessage = "Login failed";

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();

                if (response.ok) {
                    const { accessToken, refreshToken, role, userId, fullName } = data;

                    if (!accessToken) {
                        throw new Error("No token returned from server.");
                    }

                    localStorage.setItem("token", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
                    localStorage.setItem("userRole", role);
                    localStorage.setItem("userId", userId);
                    localStorage.setItem("userName", fullName);

                    navigate("/dashboard");
                    return;
                } else {
                    errorMessage = data.message || data.error || JSON.stringify(data);
                }
            } else {
                // Handle non-JSON responses (like plain text)
                errorMessage = await response.text();
            }

            throw new Error(errorMessage);
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-container d-flex justify-content-center align-items-center" style={{ marginTop: "100px" }}>
            <Card style={{ width: '28rem' }} className="p-4 shadow">
                <Card.Body>
                    <h2 className="text-center mb-4">Login</h2>

                    {error && <Alert variant="danger" className="p-2">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                            />
                        </Form.Group>

                        <Button className="btn btn-dark w-100" type="submit">
                            Login
                        </Button>

                        <div className="text-center mt-2">
                            <Link to="/forgot-password" className="text-primary">
                                Forgot Password?
                            </Link>
                        </div>
                    </Form>

                    <p className="text-center mt-4">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary fw-bold">
                            Sign Up here
                        </Link>
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Login;
