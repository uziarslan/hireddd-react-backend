const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({

    // Job ID
    // Talent ID
    // Status
    // Status change time

    jobId: {    // Use to get org
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Job",
        required: true,
        index: true,
    },
    talentId: {    
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Talent",
        required: true,
        index: true,
    },
    status:{
        type: String,
        enum: ['shortlisted', 'interviewed', 'accepted', 'rejected'],  // enum?? maybe ogr can define its shortlists
        required: true, 
    },
},{ 
    timestamps: true,
});

module.exports = mongoose.model("JobCandidate", candidateSchema);
