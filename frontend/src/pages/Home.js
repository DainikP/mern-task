import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [liveStreams, setLiveStreams] = useState([]);

    useEffect(() => {
        // Fetch videos from the backend
        const fetchVideos = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/videos');
                setVideos(res.data);
            } catch (error) {
                console.error('Failed to fetch videos', error);
            }
        };

        // Fetch active users from the backend
        const fetchActiveUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/active');
                setActiveUsers(res.data);
            } catch (error) {
                console.error('Failed to fetch active users', error);
            }
        };

        // Fetch live streams from the backend
        const fetchLiveStreams = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/live-streams');
                setLiveStreams(res.data);
            } catch (error) {
                console.error('Failed to fetch live streams', error);
            }
        };

        fetchVideos();
        fetchActiveUsers();
        fetchLiveStreams();
    }, []);

    const handleVideoClick = (id) => {
        navigate(`/video-player?id=${id}`);
    };

    const handleStreamClick = (streamId) => {
        navigate(`/live-streaming?streamId=${streamId}`);
    };

    // Separate live streams from videos
    const liveStreamCards = liveStreams.map(stream => (
        <div key={stream._id} className="border rounded p-4 cursor-pointer" onClick={() => handleStreamClick(stream._id)}>
            <img src={`http://localhost:5000/${stream.thumbnail}`} alt="Stream Thumbnail" className="w-full h-32 object-cover mb-2"/>
            <h3 className="text-xl">{stream.title}</h3>
            <p>{stream.viewers.length} viewers</p>
        </div>
    ));

    const videoCards = videos.map(video => (
        <div key={video._id} className="border rounded p-4 cursor-pointer" onClick={() => handleVideoClick(video._id)}>
            <img src={`http://localhost:5000/${video.thumbnail}`} alt="Video Thumbnail" className="w-full h-32 object-cover mb-2"/>
            <h3 className="text-xl">{video.title}</h3>
        </div>
    ));

    return (
        <div>
            <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h1 className="text-2xl">My App</h1>
                <nav className="space-x-4">
                    <button onClick={() => navigate('/video-upload')} className="bg-blue-500 px-4 py-2 rounded">Upload Video</button>
                    <button onClick={() => navigate('/live-streaming')} className="bg-green-500 px-4 py-2 rounded">Live Streaming</button>
                    <button onClick={() => navigate('/calling')} className="bg-red-500 px-4 py-2 rounded">Calling</button>
                </nav>
            </header>
            <main>
                <section className="hero bg-gray-100 p-8 text-center">
                    <h2 className="text-3xl mb-4">Welcome to My App</h2>
                    <p className="text-lg">Explore our features and connect with others!</p>
                </section>
                <section className="video-cards p-8">
                    <h2 className="text-2xl mb-4">Live Streams</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {liveStreamCards.length ? liveStreamCards : <p>No live streams available</p>}
                    </div>
                    <h2 className="text-2xl mb-4">Video Feed</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videoCards.length ? videoCards : <p>No videos available</p>}
                    </div>
                </section>
            </main>
            <footer className="bg-gray-800 text-white p-4">
                <h2 className="text-lg mb-2">Active Users</h2>
                <ul className="text-sm space-y-1">
                    {activeUsers.length ? activeUsers.map(user => (
                        <li key={user.id} className="truncate">{user.username}</li>
                    )) : <li>No active users</li>}
                </ul>
            </footer>
        </div>
    );
};

export default Home;
