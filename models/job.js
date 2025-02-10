const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({

    // Company ID req
    // Title
    // Description string req
    // Responsibilities string req
    // skills string list
    // locations 
    // salary 
    // jobtype
    // date created
    // expiry

    orgId: {    // Use to get name, logo etc
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Organization",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true, 
    },
    responsibilities:[{
        type: String,
    }],
    skills:[{
        type: String,
    }],
    locations: [{
        type: String,
    }],
    salary: {
        type: String,
    },
    jobtype:{
        type: [String],  
        enum: ['permanent', 'temp', 'remote', 'internship'],  // I'd assume data like permanent, temp, remote, internship, etc
    },
    created:{
        type: Date,
        required: true,
        default: Date.now,  
    },
    expiry:{
        type: Date,
    },
});

module.exports = mongoose.model("Job", jobSchema);
