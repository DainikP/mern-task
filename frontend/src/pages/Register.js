import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/register', { username, password });
            navigate('/login');
        } catch (error) {
            console.error('Registration error', error);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="p-6 bg-white rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl mb-4">Register</h2>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="mb-2 p-2 border w-full"
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="mb-4 p-2 border w-full"
                />
                <button onClick={handleRegister} className="bg-blue-500 text-white px-4 py-2 rounded w-full">Register</button>

                <p className="mt-4 text-center">Already have an account? <a href="/login" className="text-blue-500">Login</a></p>
            </div>
        </div>
    );
};

export default Register;
