const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const {
  talentProfileHandler,
  organizationHandler,
  talentSettings,
  organizationProfileEditHandler,
} = require("../controllers/profile");

const router = express();

// Talent Profile Handler
router.post(
  "/talent/profile",
  protect,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  wrapAsync(talentProfileHandler)
);

// Organization Profile Handler
router.post(
  "/org/profile",
  protect,
  upload.single("profile"),
  wrapAsync(organizationHandler)
);

router.post(
  "/org/profile/edit",
  protect,
  upload.single("profile"),
  wrapAsync(organizationProfileEditHandler)
);


// Talent Profile Settings - Completed By Dylan
router.post(
  "/talent/setting", 
  protect, 
  wrapAsync(async (req, res) => {
    const {
      privateAccount,
      hideLikesAndShortlisted,
      hideBadges,
      hideLocation,
      likedNotification,
      shortlistedNotification,
      availability,
    } = req.body;

    try {
      const userId = req.user.id;
      const Talent = require("../models/talent");
      const updatedTalent = await Talent.findByIdAndUpdate(
        userId,
        {
          privateAccount,
          hideLikesAndShortlisted,
          hideBadges,
          hideLocation,
          likedNotification,
          shortlistedNotification,
          availability,
        },
        { new: true } // Return the updated document
      );

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        talent: updatedTalent,
      });
    } catch (error) {
      console.error("Error updating settings:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to update settings",
        error: error.message,
      });
    }
  })
);

//----------------------------------------------------
//Talent Document Upload *May be same for org* - DYLAN 

router.post(
  "/talent/upload-document/:id",
  wrapAsync(async (req, res) => {

    try {
      const talentId = req.params.id;
      const document = req.body.document; // Base64 string
      const fileName = req.body.fileName; // Original file name


      if (!document) {
        return res
          .status(400)
          .json({ success: false, message: "No document provided" });
      }

      if (!document.startsWith("data:application/pdf;base64,")) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only PDF files are allowed.",
        });
      }

      // Limit the file size to 5MB
      const maxFileSize = 15 * 1024 * 1024; 
      const fileSizeInBytes =
        (document.length * 3) / 4 -
        (document.endsWith("==") ? 2 : document.endsWith("=") ? 1 : 0);

      if (fileSizeInBytes > maxFileSize) {
        return res.status(400).json({
          success: false,
          message: "File size exceeds the limit.",
        });
      }

      // Create a document object
      const documentObject = {
        fileType: "application/pdf",
        fileName: fileName || `document-${Date.now()}.pdf`,
        fileData: document,
      };

      // Update the Talent document in MongoDB
      const Talent = require("../models/talent");
      const updatedTalent = await Talent.findByIdAndUpdate(
        talentId,
        { $push: { documents: documentObject } }, // Add the document object to the array
        { new: true }
      );

      // Success response
      res.status(200).json({
        success: true,
        message: "Document uploaded successfully",
        talent: updatedTalent,
      });
    } catch (error) {
      // Catch and handle unexpected errors
      console.error("Error uploading document:", error.message);
      res.status(500).json({
        success: false,
        message: "Please try again later.",
        error: error.message,
      });
    }
  })
);

//Delete Document -- DYLAN
router.delete(
  "/talent/delete-document/:talentId/:docId",
  wrapAsync(async (req, res) => {
    const { talentId, docId } = req.params;

    try {
     
      const Talent = require("../models/talent");
      const updatedTalent = await Talent.findByIdAndUpdate(
        talentId,
        { $pull: { documents: { _id: docId } } },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Document deleted successfully",
        talent: updatedTalent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete document",
        error: error.message,
      });
    }
  })
);

//Edit Contact Informaiton
router.put(
  "/talent/update-contact-details/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params; // Extract User ID
    const { phone, email } = req.body; // Extract phone and email

    try {
      const Talent = require("../models/talent"); // Ensure the model is imported
      const updatedTalent = await Talent.findByIdAndUpdate(
        id,
        { phone, username: email },
        { new: true } // Return the updated document
      );

      res.status(200).json({
        success: true,
        message: "Contact details updated successfully",
        talent: updatedTalent,
      });
    } catch (error) {
      console.error("Error updating contact details:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to update contact details",
        error: error.message,
      });
    }
  })
);

// Update summary and skills -- MONTE
// Summary
router.put(
  "/talent/edit-about/:talentId",
  wrapAsync(async (req, res) => {

    try {
      const talentId = req.params.talentId;
      const updatedSummary = req.body.about; 

      // Not allowing overwrite to null
      if (!updatedSummary) {
        return res.status(400).json({ 
            success: false, 
            message: "Can't leave summary empty" 
          });
      }

      // Limiting the length of the summary 
      const maxSummarySize = 5000;  // 5000 characters?
      if (updatedSummary.length > maxSummarySize) {
        return res.status(400).json({
          success: false,
          message: "This exceeds the character limit",
        });
      }

      // Update the Talent document in MongoDB
      const Talent = require("../models/talent");
      const updatedTalent = await Talent.findByIdAndUpdate(
        talentId,
        { about: updatedSummary }, // Set the talent summary
        { new: true }
      );

      // Success response
      res.status(200).json({
        success: true,
        message: "Summary successfully updated",
        talent: updatedTalent,
      });
    } catch (error) {
      // Catch and handle unexpected errors
      console.error("Error updating summary:", error.message);
      res.status(500).json({
        success: false,
        message: "Please try again later.",
        error: error.message,
      });
    }
  })
);

// Skills - This also handles delete
router.put(
  "/talent/edit-skills/:talentId",
  wrapAsync(async (req, res) => {

    try {
      const talentId = req.params.talentId;
      const updatedSkill = req.body.rawSkills; 
      // Get skill array, remove trailing spaces, filter out nulls
      const skillItems = updatedSkill.split(',').map(skill => skill.trim()).filter(skill => skill);

      if (!updatedSkill) {
        return res
          .status(400)
          .json({ success: false, message: "Can't leave skills empty" });
      }

      // Limit the number of skills
      const maxSkillSize = 50;  // 50 skill?
      if (skillItems.length > maxSkillSize) {
        return res.status(400).json({
          success: false,
          message: "This exceeds the skill count limit",
        });
      }

      // Update the Talent document in MongoDB
      const Talent = require("../models/talent");
      const updatedTalent = await Talent.findByIdAndUpdate(
        talentId,
        { $set: { skills: skillItems } }, // Set the skills to new skill array
        { new: true }
      );

      // Success response
      res.status(200).json({
        success: true,
        message: "Summary successfully updated",
        talent: updatedTalent,
      });
    } catch (error) {
      // Catch and handle unexpected errors
      console.error("Error updating summary:", error.message);
      res.status(500).json({
        success: false,
        message: "Please try again later.",
        error: error.message,
      });
    }
  })
);







//-----------------------------------------------------------------------


module.exports = router;



