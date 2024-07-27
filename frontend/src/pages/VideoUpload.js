import React, { useState } from 'react';
import axios from 'axios';

const VideoUpload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [video, setVideo] = useState(null);

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video', video);

        try {
            await axios.post('http://localhost:5000/api/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Video uploaded successfully');
        } catch (error) {
            console.error('Video upload error', error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Upload Video</h1>
            <input 
                type="text" 
                placeholder="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="mb-2 p-2 border"
            />
            <input 
                type="text" 
                placeholder="Description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="mb-2 p-2 border"
            />
            <input 
                type="file" 
                accept="video/*" 
                onChange={(e) => setVideo(e.target.files[0])} 
                className="mb-2 p-2 border"
            />
            <button onClick={handleUpload} className="bg-blue-500 text-white p-2">Upload</button>
        </div>
    );
};

export default VideoUpload;
