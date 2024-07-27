const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');
const streamRoutes = require('./routes/streams');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define or get Stream model
const StreamSchema = new mongoose.Schema({
    streamId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    viewers: [String],
});

const Stream = mongoose.models.Stream || mongoose.model('Stream', StreamSchema);

// Define or get Video model
const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    path: { type: String, required: true },
    thumbnail: { type: String }
});

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

// Define or get Call model
const CallSchema = new mongoose.Schema({
    callId: { type: String, required: true },
    callerId: { type: String, required: true },
    receiverId: { type: String, required: true },
    callType: { type: String, enum: ['video', 'voice'], required: true },
    status: { type: String, enum: ['pending', 'active', 'ended'], default: 'pending' },
});

const Call = mongoose.models.Call || mongoose.model('Call', CallSchema);

// Live Stream Management
const liveStreams = {};

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('startStream', async ({ streamId, title, description }) => {
        console.log('Received startStream event with streamId:', streamId);
        liveStreams[streamId] = { viewers: [], title, description };
        io.emit('streamStarted', { streamId, title, description });

        try {
            await Stream.create({ streamId, title, description, status: 'active' });
        } catch (err) {
            console.error('Error creating stream:', err);
        }
    });

    socket.on('stopStream', async (streamId) => {
        console.log('Received stopStream event with streamId:', streamId);
        delete liveStreams[streamId];
        io.emit('streamStopped', streamId);

        try {
            await Stream.findOneAndUpdate({ streamId }, { status: 'inactive' });
        } catch (err) {
            console.error('Error updating stream status:', err);
        }
    });

    socket.on('joinStream', (streamId) => {
        if (liveStreams[streamId]) {
            liveStreams[streamId].viewers.push(socket.id);
            io.emit('updateViewers', { streamId, viewers: liveStreams[streamId].viewers });
        }
    });

    socket.on('leaveStream', (streamId) => {
        if (liveStreams[streamId]) {
            liveStreams[streamId].viewers = liveStreams[streamId].viewers.filter(id => id !== socket.id);
            if (liveStreams[streamId].viewers.length === 0) {
                delete liveStreams[streamId];
            }
            io.emit('updateViewers', { streamId, viewers: liveStreams[streamId].viewers });
        }
    });

    socket.on('newVideo', async (video) => {
        io.emit('videoUploaded', video);

        try {
            await Video.create(video);
        } catch (err) {
            console.error('Error creating video:', err);
        }
    });

    socket.on('initiateCall', async ({ callerId, receiverId, callType }) => {
        try {
            const callId = new mongoose.Types.ObjectId().toString();
            io.to(receiverId).emit('incomingCall', { callerId, callType, callId });

            await Call.create({ callId, callerId, receiverId, callType });
        } catch (err) {
            console.error('Error initiating call:', err);
        }
    });

    socket.on('acceptCall', async ({ callId }) => {
        try {
            await Call.findByIdAndUpdate(callId, { status: 'active' });
            const call = await Call.findById(callId);
            io.to(call.callerId).emit('callAccepted', { receiverId: call.receiverId, callType: call.callType });
        } catch (err) {
            console.error('Error accepting call:', err);
        }
    });

    socket.on('rejectCall', async ({ callId }) => {
        try {
            await Call.findByIdAndUpdate(callId, { status: 'ended' });
            const call = await Call.findById(callId);
            io.to(call.callerId).emit('callRejected', { receiverId: call.receiverId });
        } catch (err) {
            console.error('Error rejecting call:', err);
        }
    });

    socket.on('endCall', async ({ callId }) => {
        try {
            await Call.findByIdAndUpdate(callId, { status: 'ended' });
            const call = await Call.findById(callId);
            io.to(call.callerId).emit('callEnded', { receiverId: call.receiverId });
            io.to(call.receiverId).emit('callEnded', { callerId: call.callerId });
        } catch (err) {
            console.error('Error ending call:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        for (let streamId in liveStreams) {
            liveStreams[streamId].viewers = liveStreams[streamId].viewers.filter(id => id !== socket.id);
            if (liveStreams[streamId].viewers.length === 0) {
                delete liveStreams[streamId];
            }
        }
        io.emit('updateViewers', liveStreams);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/live-streams', streamRoutes);

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
