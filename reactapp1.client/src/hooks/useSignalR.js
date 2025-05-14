import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export const useSignalR = (url, events) => {
    const connectionRef = useRef(null);

    useEffect(() => {
        const startConnection = async () => {
            try {
                const connection = new signalR.HubConnectionBuilder()
                    .withUrl(url)
                    .withAutomaticReconnect()
                    .build();

                // Add event handlers
                Object.entries(events).forEach(([eventName, handler]) => {
                    connection.on(eventName, handler);
                });

                await connection.start();
                console.log('SignalR Connected');
                connectionRef.current = connection;
            } catch (err) {
                console.error('SignalR Connection Error:', err);
            }
        };

        startConnection();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, [url, events]);

    return connectionRef.current;
};