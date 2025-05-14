import { useEffect } from 'react';
import { useSignalR } from '../hooks/useSignalR';

const RealTimeNotifications = ({ onEventUpdate }) => {
    const handleEventUpdate = (updatedEvent) => {
        onEventUpdate(updatedEvent);
    };

    useSignalR('http://localhost:3000/eventHub', {
        'EventApproved': handleEventUpdate,
        'EventUpdated': handleEventUpdate,
        'NewEventCreated': handleEventUpdate,
        'EventDeleted': handleEventUpdate
    });

    return null; // This component doesn't render anything
};

export default RealTimeNotifications;