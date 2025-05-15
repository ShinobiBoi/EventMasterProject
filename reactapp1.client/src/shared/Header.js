import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import "../css/Header.css";
import { useNavigate } from "react-router-dom";
import {  getUserRole } from '../../src/pages/manage-events/authUtils';

const Header = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
    const role = getUserRole(token);
    const Logout = () => {
        localStorage.removeItem("token")
        navigate("/login");
    };

    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand>
                        <Link className="nav-link" to={"/"}>
                            Event Master
                        </Link>
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Link className="nav-link" to={"/"}>
                            List Events
                        </Link>

                        {/* Unauthenticated Routes */}
                        {!role && (
                            <>
                                <Link className="nav-link" to={"/login"}>
                                    Login
                                </Link>
                                <Link className="nav-link" to={"/register"}>
                                    Register
                                </Link>
                            </>
                        )}

                        {/* Authenticated Routes */}
                        {role && (
                            <>
                                {/* Saved Events - Visible to all authenticated users */}
                                <Link className="nav-link" to={"/manage-events/saved-events"}>
                                    Saved Events
                                </Link>

                                {/* Admin Routes */}
                                {role === "Admin" && (
                                    <>
                                        <Link className="nav-link" to={"/manage-events"}>
                                            Manage Events
                                           
                                        </Link>
                                        <Link className="nav-link" to="/manage-events/requests">
                                            Event Requests
                                        </Link>
                                        <Link className="nav-link" to={"/manage-events/approve-organizer"}>
                                            New Organizers Accounts
                                        </Link>
                                    </>
                                )}

                                {/* Organizer Routes */}
                                {role === "Organizer" && (
                                    <Link className="nav-link" to={"/manage-events"}>
                                        Manage Events
                                    </Link>
                                )}
                                {role === "Attendee" && (
                                    <Link className="nav-link" to={"/manage-events/my-tickets"}>
                                        My Tickets
                                    </Link>
                                )}
                            </>
                        )}
                    </Nav>

                    <Nav className="ms-auto">
                        {/* Logout - Visible to all authenticated users */}
                        {role && <Nav.Link onClick={Logout}>Logout</Nav.Link>}
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
};

export default Header;
