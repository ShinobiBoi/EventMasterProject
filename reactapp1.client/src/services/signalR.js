import * as signalR from '@microsoft/signalr';

export const startConnection = async (eventId) => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:5008/eventhub")
        .build();

    await connection.start();
    await connection.invoke("JoinEvent", eventId.toString());
    
    return connection;
};