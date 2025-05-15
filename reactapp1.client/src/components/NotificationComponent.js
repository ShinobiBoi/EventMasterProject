import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const NotificationComponent = () => {
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/eventHub", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        // Connection event handlers
        connection.onclose((error) => {
            setConnectionStatus("Disconnected");
            console.error("SignalR disconnected:", error);
        });

        connection.onreconnecting((error) => {
            setConnectionStatus("Reconnecting...");
            console.log("SignalR reconnecting:", error);
        });

        connection.onreconnected((connectionId) => {
            setConnectionStatus("Connected");
            console.log("SignalR reconnected:", connectionId);
        });

        // Start connection
        const startConnection = async () => {
            try {
                await connection.start();
                setConnectionStatus("Connected");
                console.log("SignalR connected!");
            } catch (err) {
                setConnectionStatus("Connection failed");
                console.error("SignalR failed to connect:", err);
                // Optional: Add retry logic here
            }
        };

        startConnection();

        // Notification handler
        connection.on("ReceiveNotification", (message) => {
            console.log("Received notification:", message);
            alert("New notification: " + message);
        });

        // Cleanup
        return () => {
            connection.stop()
                .then(() => console.log("SignalR connection stopped"))
                .catch(err => console.error("Error stopping connection:", err));
        };
    }, []);

    return <div>Status: {connectionStatus}</div>;
};

export default NotificationComponent;