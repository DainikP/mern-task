import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import VideoUpload from './pages/VideoUpload';
import VideoPlayer from './pages/VideoPlayer';
import Login from './pages/Login';
import Register from './pages/Register';
import Calling from './pages/Calling';
import LiveStream from './pages/LiveStream';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<PrivateRoute element={Home} />} />
                    <Route path="/video-upload" element={<PrivateRoute element={VideoUpload} />} />
                    <Route path="/video-player" element={<PrivateRoute element={VideoPlayer} />} />
                    <Route path="/calling" element={<PrivateRoute element={Calling} />} />
                    <Route path="/live-streaming" element={<PrivateRoute element={LiveStream} />} />
                    <Route path="/" element={<Navigate to="/register" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
