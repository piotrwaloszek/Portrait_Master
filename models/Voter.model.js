const mongoose = require('mongoose');

const voterShema = new mongoose.Schema({
    user: {type: String, required: true},
    votes: [{type: String, required: true}]
});

module.exports = mongoose.models.Voter || mongoose.model('Voter', voterShema);