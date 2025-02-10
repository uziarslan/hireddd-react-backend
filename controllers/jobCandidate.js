// EGBAIYELO
const mongoose = require("mongoose");
const Job = mongoose.model("Job");
const JobCandidate = mongoose.model("JobCandidate");
const Talent = mongoose.model("Talent");
const Organization = mongoose.model("Organization");

//-- JOBS --
// Creates jobs
const createJob = async (req, res) => {
    try {
        const { orgId, title, description, responsibilities, skills, locations, salary, jobtype, expiry } = req.body;
        
        const newJob = new Job({
            orgId,
            title,  
            description,
            responsibilities,
            skills,
            locations,
            salary,
            jobtype,
            expiry
        });
  
        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating job" });
    }
};

// Get job by the job id
const getJobById = async (req, res) => {
    try {
        // It populates the job with org info too
        const job = await Job.findById(req.params.id).populate("orgId");
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching job" });
    }
};
  
// Get Jobs by an org
const getJobsbyOrgID = async (req, res) => {
    try {
        const jobs = await Job.find({ orgId: req.params.orgId });
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching jobs" });
    }
};

// Update parameters of a job
const updateJob = async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.status(200).json(updatedJob);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating job" });
    }
};

// If ever needed
// const deleteJob = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const deletedJob = await Job.findByIdAndDelete(id);

//         // Paired logic - Delete all associated job candidates
//         await JobCandidate.deleteMany({ jobId: id });

//         res.status(200).json({ success: "Job and associated candidates deleted" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error deleting job" });
//     }
// };



//-- Candidates --

//-- Candidates --
//
const createCandidate = async (req, res) => {
    try {
        const { jobId, talentId, status } = req.body;

        // Check if the candidate already exists for this job
        const existingCandidate = await JobCandidate.findOne({ jobId, talentId });

        if (existingCandidate) {
            return res.status(400).json({ error: "Candidate already shortlisted for this job" });
        }

        const newJobCandidate = new JobCandidate({
            jobId,
            talentId,
            status,
            update: Date.now(),
        });

        const savedJobCandidate = await newJobCandidate.save();
        res.status(201).json(savedJobCandidate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error shortlisting candidate" });
    }
};

const updateCandidateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const updatedJobCandidate = await JobCandidate.findByIdAndUpdate(
            req.params.id,
            { status, update: Date.now() },
            { new: true }
        );

        if (!updatedJobCandidate) {
            return res.status(404).json({ error: "Job candidate not found" });
        }

        res.status(200).json(updatedJobCandidate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating candidate status" });
    }
};

const updateCandidateStatusByJobTalent = async (req, res) => {
    try {
        const { jobId, talentId } = req.params;
        const { status } = req.body;

        const jobCandidate = await JobCandidate.findOneAndUpdate(
            { jobId, talentId },
            { status, update: Date.now() },
            { new: true }
        );

        // if (!jobCandidate) {
        //     return res.status(404).json({ error: "Candidate for this job not found" });
        // }

        res.status(200).json(jobCandidate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating candidate status" });
    }
};

const getCandidatesForJob = async (req, res) => {
    try {
        const candidates = await JobCandidate.find({ jobId: req.params.jobId }).populate("talentId");
        res.status(200).json(candidates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching candidates" });
    }
};

const getJobsForTalent = async (req, res) => {
    try {
        const jobs = await JobCandidate.find({ talentId: req.params.talentId }).populate({
            path: "jobId",  
            populate: {
              path: "orgId",  
              model: "Organization"  
            }
          });
        console.log(jobs)
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching jobs for talent" });
    }
};

// const deleteCandidate = async (req, res) => {
//     try {
//         const { jobId, talentId } = req.params;

//         const deletedCandidate = await JobCandidate.findOneAndDelete({ jobId, talentId });

//         res.status(200).json({ success: "Candidate removed from job" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error deleting candidate" });
//     }
// };



module.exports = {
    createJob,
    getJobById, 
    getJobsbyOrgID, 
    updateJob,
    // deleteJob,
    createCandidate,
    updateCandidateStatus,
    updateCandidateStatusByJobTalent,
    getCandidatesForJob,
    getJobsForTalent,
    // deleteCandidate,
};