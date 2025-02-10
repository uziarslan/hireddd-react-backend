// Add job - org
// update jobs?? - org
// Get jobs - org
// Get job through status - talent
// Add candidate - org
// Change candidate status - when doing keep for a while or email candidtae that they rejected? - org

const express = require("express");
const router = express.Router();
const jobCandidateController = require("../controllers/jobCandidate");
const wrapAsync = require("../utils/wrapAsync");
const { protect } = require("../middlewares/authMiddleware");

// Job Routes
const job_subroute = "/jobs";

router.post(`${job_subroute}`, wrapAsync(jobCandidateController.createJob));
router.get(`${job_subroute}/org/:orgId`, wrapAsync(jobCandidateController.getJobsbyOrgID));
router.get(`${job_subroute}/:id`, wrapAsync(jobCandidateController.getJobById));
router.put(`${job_subroute}/:id`, wrapAsync(jobCandidateController.updateJob)); 
// Maybe we dont use this so jobs can be referenced after expiry
// router.delete(`${job_subroute}/:id`, wrapAsync(jobCandidateController.deleteJob));



// Job Candidate Routes
const candidate_subroute = "/jobCandidates";

router.post(`${candidate_subroute}`, wrapAsync(jobCandidateController.createCandidate));
router.put(`${candidate_subroute}/:id`, wrapAsync(jobCandidateController.updateCandidateStatus));
router.put(`${candidate_subroute}/job/:jobId/talent/:talentId`, wrapAsync(jobCandidateController.updateCandidateStatusByJobTalent));
router.get(`${candidate_subroute}/job/:jobId`, wrapAsync(jobCandidateController.getCandidatesForJob));
router.get(`${candidate_subroute}/talent/:talentId`, wrapAsync(jobCandidateController.getJobsForTalent));
// router.delete(`${candidate_subroute}/job/:jobId/talent/:talentId`, jobCandidateController.deleteCandidate);

module.exports = router;
