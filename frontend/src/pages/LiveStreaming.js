import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Fetch video data from the backend
        const fetchVideos = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/videos');
                setVideos(res.data);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, []);

    const handlePlay = (video) => {
        setCurrentVideo(video);
        setIsPlaying(true);
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Home Page</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                    <div key={video._id} className="border rounded-lg p-4">
                        <h2 className="text-xl mb-2">{video.title}</h2>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => handlePlay(video)}
                        >
                            Play
                        </button>
                    </div>
                ))}
            </div>
            {currentVideo && (
                <div className="p-4 mt-4 border rounded-lg">
                    <h2 className="text-xl mb-2">{currentVideo.title}</h2>
                    <video
                        id="video-player"
                        width="100%"
                        controls
                        autoPlay={isPlaying}
                        muted={isMuted}
                    >
                        <source src={`http://localhost:5000/uploads/${currentVideo.path}`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="mt-2">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                            onClick={() => setIsPlaying(true)}
                            disabled={isPlaying}
                        >
                            Play
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                            onClick={handlePause}
                            disabled={!isPlaying}
                        >
                            Pause
                        </button>
                        <button
                            className={`bg-${isMuted ? 'gray' : 'yellow'}-500 text-white px-4 py-2 rounded`}
                            onClick={handleMute}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
