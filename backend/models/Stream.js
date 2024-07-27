const mongoose = require('mongoose');

const StreamSchema = new mongoose.Schema({
    streamId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    viewers: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Stream', StreamSchema);
