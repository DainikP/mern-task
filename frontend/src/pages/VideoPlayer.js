import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const VideoPlayer = () => {
    const [video, setVideo] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const videoId = query.get('id');

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                console.log(`Fetching video with ID: ${videoId}`);
                const res = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
                console.log('API Response:', res.data);
                setVideo(res.data);
            } catch (error) {
                console.error('Error fetching video', error);
                setError('Failed to fetch video. Please try again later.');
            }
        };

        if (videoId) {
            fetchVideo();
        } else {
            setError('Invalid video ID.');
        }
    }, [videoId]);

    if (error) {
        return <div className="p-4">{error}</div>;
    }

    if (!video) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">{video.title}</h1>
            <video width="100%" controls>
                <source src={`http://localhost:5000/uploads/${video.path}`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <p className="mt-4">{video.description}</p>
        </div>
    );
};

export default VideoPlayer;
