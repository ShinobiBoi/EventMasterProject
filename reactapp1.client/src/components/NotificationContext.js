import React, { createContext, useContext, useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, token }) => {
    const [notifications, setNotifications] = useState([]);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        if (!token) return;

        const connect = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:5008/eventHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connect.on("ReceiveUpdate", (message) => {
            // Only store text messages (not file notifications)
            if (!isFileMessage(message)) {
                setNotifications(prev => [...prev, message]);
            }
        });

        connect.start()
            .then(() => {
                setConnection(connect);
            })
            .catch(err => console.error('Connection failed:', err));

        return () => {
            if (connect) {
                connect.stop().catch(err => console.log('Connection stop failed:', err));
            }
        };
    }, [token]);

    const isFileMessage = (msg) => {
        return msg.includes(".pdf") || msg.includes(".doc") || msg.includes(".png");
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);