import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import axios from 'axios';
import { getUserRole } from '../pages/manage-events/authUtils';

const EventAttachments = ({ eventId }) => {
    const [attachments, setAttachments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [connection, setConnection] = useState(null);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    const token = localStorage.getItem("token");
    const userRole = getUserRole(token);

    useEffect(() => {
        // Initialize SignalR connection
        const newConnection = new HubConnectionBuilder()
            .withUrl('/eventHub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                console.log('Connected to SignalR');
                newConnection.invoke('JoinEventGroup', eventId);
            })
            .catch(err => {
                console.error('SignalR Connection Error:', err);
                setError('Failed to connect to real-time updates');
            });

        newConnection.on('NewAttachment', (fileName) => {
            setNotifications(prev => [...prev, `New attachment uploaded: ${fileName}`]);
            fetchAttachments();
        });

        newConnection.on('EventUpdate', (message) => {
            setNotifications(prev => [...prev, `Event update: ${message}`]);
        });

        return () => {
            newConnection.stop();
        };
    }, [eventId]);

    useEffect(() => {
        fetchAttachments();
    }, [eventId]);

    const fetchAttachments = async () => {
        try {
            const response = await axios.get(`/api/events/${eventId}/attachments`);
            setAttachments(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching attachments:', error);
            setError('Failed to load attachments');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                event.target.value = null;
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post(`/api/events/${eventId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            setSelectedFile(null);
            fetchAttachments();
            setNotifications(prev => [...prev, `Successfully uploaded ${selectedFile.name}`]);
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSendUpdate = async () => {
        const message = prompt('Enter your update message:');
        if (!message) return;

        try {
            await axios.post(`/api/events/${eventId}/update`, message, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setNotifications(prev => [...prev, `Update sent: ${message}`]);
        } catch (error) {
            console.error('Error sending update:', error);
            setError('Failed to send update. Please make sure you are authorized.');
        }
    };

    const handleDownload = async (url, fileName) => {
        try {
            const response = await axios.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            setError('Failed to download file. Please try again.');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Event Attachments</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                <div className="max-h-40 overflow-y-auto">
                    {notifications.map((notification, index) => (
                        <div key={index} className="bg-blue-100 p-2 mb-2 rounded">
                            {notification}
                        </div>
                    ))}
                </div>
            </div>

            {(userRole === 'Admin' || userRole === 'Organizer') && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Upload Attachment</h3>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="border p-2 rounded"
                            disabled={uploading}
                        />
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                            onClick={handleSendUpdate}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Send Update
                        </button>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold mb-2">Available Attachments</h3>
                <div className="grid gap-2">
                    {attachments.length === 0 ? (
                        <p className="text-gray-500">No attachments available</p>
                    ) : (
                        attachments.map((attachment, index) => (
                            <div key={index} className="border p-2 rounded flex justify-between items-center">
                                <span>{attachment.fileName}</span>
                                <button
                                    onClick={() => handleDownload(attachment.url, attachment.fileName)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                >
                                    Download
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventAttachments;
