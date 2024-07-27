import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const VideoPlayer = () => {
    const [video, setVideo] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchVideo = async () => {
            const urlParams = new URLSearchParams(location.search);
            const videoId = urlParams.get('id');
            if (videoId) {
                const res = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
                setVideo(res.data);
            }
        };
        fetchVideo();
    }, [location]);

    if (!video) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">{video.title}</h1>
            <video width="100%" controls>
                <source src={`http://localhost:5000/${video.path}`} type="video/mp4" />
            </video>
            <p className="mt-4">{video.description}</p>
        </div>
    );
};

export default VideoPlayer;
