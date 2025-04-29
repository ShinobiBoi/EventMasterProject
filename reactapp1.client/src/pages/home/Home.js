import React, { useState, useEffect } from "react";
import EventsCard from "../../components/EventCard";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

const Home = () => {
  return (
    <div className="home-container p-5">
      {/* Loader  */}

      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>

      {/* LIST Events  */}

      <>
        {/* Filter  */}
        <Form>
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

        {/* LIST Events  */}
        <div className="row ">
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
          <div className="col-4 card-event-container my-4">
            <EventsCard />
          </div>
        </div>
      </>

      {/* ERRORS HANDLING  */}

      <Alert variant="danger" className="p-2">
        this is simple alert
      </Alert>

      <Alert variant="info" className="p-2">
        No Events, please try again later !
      </Alert>
    </div>
  );
};

export default Home;
