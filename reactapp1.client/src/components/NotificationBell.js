import React, { useState } from 'react';
import { useNotifications } from './NotificationContext';

const NotificationBell = () => {
    const { notifications, clearNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-200 relative"
            >
                🔔
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50">
                    <div className="p-2 border-b flex justify-between items-center">
                        <span className="font-bold">Notifications</span>
                        <button
                            onClick={clearNotifications}
                            className="text-xs text-blue-500"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-gray-500 text-center">No new notifications</div>
                        ) : (
                            notifications.map((msg, idx) => (
                                <div key={idx} className="p-3 border-b hover:bg-gray-50">
                                    {msg}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;