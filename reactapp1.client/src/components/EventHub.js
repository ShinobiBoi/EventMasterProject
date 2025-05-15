import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';

const EventHub = ({ token, eventId, role }) => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [textMessage, setTextMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const connect = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:5008/eventHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connect.on("ReceiveUpdate", (message) => {
            setMessages(prev => [...prev, message]);
        });

        connect.start()
            .then(() => {
                setConnection(connect);
                return connect.invoke("JoinEventGroup", eventId);
            })
            .catch(err => console.error('Connection failed:', err));

        return () => {
            if (connect) {
                connect.invoke("LeaveEventGroup", eventId)
                    .catch(err => console.log('Leave group failed:', err))
                    .finally(() => {
                        connect.stop().catch(err => console.log('Connection stop failed:', err));
                    });
            }
        };
    }, [eventId, token]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select a file");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            await axios.post(`/api/events/upload/${eventId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            setSelectedFile(null);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('File upload failed');
        }
    };

    const handleSendMessage = async () => {
        if (!textMessage.trim()) return;
        if (!connection) return;

        setIsSending(true);
        try {
            await connection.invoke("SendTextMessage", eventId, textMessage);
            setTextMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await axios.get(`/api/events/download/${eventId}/${filename}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('File download failed');
        }
    };

    const isFileMessage = (msg) => {
        return msg.includes(".pdf") || msg.includes(".doc") || msg.includes(".docx") || msg.includes(".png") || msg.includes(".jpg") || msg.includes(".jpeg");
    };

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold mb-4">Event Notifications</h2>

            {role === 'Organizer' && (
                <div className="space-y-4 mb-6">
                    {/* Text Message Section */}
                    <div className="flex flex-col space-y-2">
                        <label className="font-medium">Send Text Notification</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={textMessage}
                                onChange={(e) => setTextMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isSending || !textMessage.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {isSending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="flex flex-col space-y-2">
                        <label className="font-medium">Upload File</label>
                        <div className="flex space-x-2">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="flex-1 p-2 border rounded"
                            />
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Upload & Notify
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages List */}
            <div className="mt-4">
                <h3 className="font-medium mb-2">Notifications</h3>
                {messages.length === 0 ? (
                    <p className="text-gray-500">No notifications yet</p>
                ) : (
                    <ul className="space-y-2">
                        {messages.map((msg, idx) => (
                            <li key={idx} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span>{msg}</span>
                                    {isFileMessage(msg) && (
                                        <button
                                            onClick={() => handleDownload(msg.split(" ")[0])}
                                            className="ml-4 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                        >
                                            Download
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EventHub;