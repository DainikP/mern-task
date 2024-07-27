import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your server URL

const Calling = () => {
    const [incomingCall, setIncomingCall] = useState(null);
    const [callType, setCallType] = useState(null);
    const [receiverId, setReceiverId] = useState('');
    const [userId] = useState('userId'); // Replace with actual user ID

    useEffect(() => {
        // Listen for incoming calls
        socket.on('incomingCall', ({ callerId, callType }) => {
            setIncomingCall({ callerId, callType });
        });

        // Listen for call acceptance or rejection
        socket.on('callAccepted', ({ receiverId, callType }) => {
            setCallType(callType);
            setIncomingCall(null); // Clear incoming call
            // Initialize call setup here
        });

        socket.on('callRejected', ({ receiverId }) => {
            alert('Call rejected by the user');
            setIncomingCall(null);
        });

        socket.on('callEnded', ({ receiverId }) => {
            alert('Call ended');
            setCallType(null);
            setIncomingCall(null);
        });

        return () => {
            socket.off('incomingCall');
            socket.off('callAccepted');
            socket.off('callRejected');
            socket.off('callEnded');
        };
    }, []);

    const handleCallInitiation = (type) => {
        if (receiverId) {
            socket.emit('initiateCall', { callerId: userId, receiverId, callType: type });
        } else {
            alert('Please enter a valid user ID');
        }
    };

    const handleAcceptCall = () => {
        if (incomingCall) {
            socket.emit('acceptCall', { callerId: incomingCall.callerId, receiverId: userId, callType: incomingCall.callType });
            setCallType(incomingCall.callType);
            setIncomingCall(null); // Clear incoming call
        }
    };

    const handleRejectCall = () => {
        if (incomingCall) {
            socket.emit('rejectCall', { callerId: incomingCall.callerId, receiverId: userId });
            setIncomingCall(null); // Clear incoming call
        }
    };

    const handleEndCall = () => {
        if (callType) {
            socket.emit('endCall', { callerId: userId, receiverId });
            setCallType(null); // Clear call type
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Calling Options</h1>

            <div className="mb-4">
                <label className="block text-lg mb-2">Receiver User ID:</label>
                <input
                    type="text"
                    className="border p-2 rounded w-full"
                    placeholder="Enter user ID"
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                />
            </div>

            <div className="space-y-4 mb-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => handleCallInitiation('video')}
                >
                    Start Video Call
                </button>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => handleCallInitiation('voice')}
                >
                    Start Voice Call
                </button>
            </div>

            {/* Incoming Call Handling */}
            {incomingCall && (
                <div className="mt-4 p-4 border border-gray-300 rounded">
                    <h2 className="text-lg mb-2">
                        Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call from {incomingCall.callerId}
                    </h2>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                        onClick={handleAcceptCall}
                    >
                        Accept
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={handleRejectCall}
                    >
                        Reject
                    </button>
                </div>
            )}

            {/* Active Call Handling */}
            {callType && (
                <div className="mt-4 p-4 border border-gray-300 rounded">
                    <h2 className="text-lg mb-2">
                        {callType === 'video' ? 'Video' : 'Voice'} Call In Progress
                    </h2>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={handleEndCall}
                    >
                        End Call
                    </button>
                </div>
            )}
        </div>
    );
};

export default Calling;
