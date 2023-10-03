const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    date:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
})

const Event = mongoose.model("Event", eventSchema);

exports.Event = Event;