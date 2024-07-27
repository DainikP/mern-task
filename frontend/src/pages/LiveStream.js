import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const LiveStream = () => {
    const [streamId, setStreamId] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [socket, setSocket] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const videoRef = useRef(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);

    useEffect(() => {
        // Initialize WebSocket connection
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('WebSocket connected');
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        // Handle media stream
        if (videoRef.current && streaming) {
            const constraints = {
                video: videoEnabled,
                audio: audioEnabled,
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    videoRef.current.srcObject = stream;
                })
                .catch(error => {
                    console.error('Error accessing media devices.', error);
                });

            return () => {
                // Cleanup when the stream is stopped
                if (videoRef.current && videoRef.current.srcObject) {
                    const tracks = videoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }
            };
        }
    }, [streaming, audioEnabled, videoEnabled]);

    const startStream = () => {
        if (socket && streamId && title && description) {
            console.log('Emitting startStream event with streamId:', streamId);
            socket.emit('startStream', { streamId, title, description });
            setStreaming(true);
        } else {
            console.error('Stream ID, title, and description are required to start the stream.');
        }
    };

    const stopStream = () => {
        if (socket && streamId) {
            console.log('Emitting stopStream event with streamId:', streamId);
            socket.emit('stopStream', streamId);
            setStreaming(false);

            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        } else {
            console.error('Stream ID is required to stop the stream.');
        }
    };

    const toggleAudio = () => {
        if (videoRef.current) {
            const stream = videoRef.current.srcObject;
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => track.enabled = !audioEnabled);
            setAudioEnabled(!audioEnabled);
        }
    };

    const toggleVideo = () => {
        if (videoRef.current) {
            const stream = videoRef.current.srcObject;
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => track.enabled = !videoEnabled);
            setVideoEnabled(!videoEnabled);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Live Stream</h1>
            <input 
                type="text" 
                placeholder="Stream ID" 
                value={streamId} 
                onChange={(e) => setStreamId(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
            />
            {!streaming ? (
                <button onClick={startStream} className="bg-green-500 px-4 py-2 rounded">Start Stream</button>
            ) : (
                <button onClick={stopStream} className="bg-red-500 px-4 py-2 rounded">Stop Stream</button>
            )}
            <div className="controls mt-4">
                <button onClick={toggleAudio} className="bg-blue-500 px-4 py-2 rounded">
                    {audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                </button>
                <button onClick={toggleVideo} className="bg-blue-500 px-4 py-2 rounded ml-2">
                    {videoEnabled ? 'Turn Off Video' : 'Turn On Video'}
                </button>
            </div>
            <div className="stream mt-4">
                <video ref={videoRef} autoPlay muted className="w-full h-auto border rounded">
                    {/* Video stream will be displayed here */}
                </video>
            </div>
        </div>
    );
};

export default LiveStream;
