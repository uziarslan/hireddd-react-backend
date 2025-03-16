const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");
const Talent = require("../models/talent");
const { storage, cloudinary, deleteVideo } = require("../cloudinary");
const upload = multer({ storage });
const {
  talentProfileHandler,
  organizationHandler,
  talentSettings,
  organizationProfileEditHandler,
} = require("../controllers/profile");

const router = express();

router.put(
  "/talent/edit-portfolio/:talentId",
  protect,
  wrapAsync(async (req, res) => {
    const { talentId } = req.params;
    const { portfolios } = req.body; // Updated to match the new structure

    try {
      const updatedTalent = await Talent.findByIdAndUpdate(
        talentId,
        { portfolios },
        { new: true } // Return the updated document
      );

      if (!updatedTalent) {
        return res.status(404).json({
          success: false,
          message: "Talent not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Portfolio section updated successfully",
        talent: updatedTalent,
      });
    } catch (error) {
      console.error("Error updating portfolio section:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to update portfolio section",
        error: error.message,
      });
    }
  })
);
// -- AYUSHI
// Update Portfolio Links
router.put(
  "/talent/edit-portfolio/:talentId",
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
        message: "Portfolio section updated successfully",
        talent: updatedTalent,
      });
    } catch (error) {
      console.error("Error updating portfolio section:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to update portfolio section",
        error: error.message,
      });
    }
  })
);

router.put(
  "/talent/update-profile/:id",
  protect,
  upload.single("profile"), 
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!req.file || !req.file.path) {
      console.error("No file uploaded");  // Log error
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
      const talent = await Talent.findById(id);
      if (!talent) {
        console.error("Talent not found"); // Log error
        return res.status(404).json({ success: false, message: "Talent not found" });
      }

      // Log uploaded file details
      console.log("File received:", req.file);

      // Update database with new profile picture
      const updatedTalent = await Talent.findByIdAndUpdate(
        id,
        { "profile.path": req.file.path },
        { new: true }
      );

      console.log("Profile picture updated successfully"); // Log success
      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        profileUrl: req.file.path,
      });

    } catch (error) {
      console.error("Error updating profile picture:", error); // Log error
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  })
);


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
    const talentId = req.params.id;
    const document = req.body.document; // Base64 string
    const fileName = req.body.fileName; // Original file name

    if (!document) {
      throw new Error("No document provided.");
    }

    if (!document.startsWith("data:application/pdf;base64,")) {
      const error = new Error("Invalid file type. Only PDF files are allowed.");
      error.statusCode = 400;
      throw error;
    }

    // Limit the file size to 15MB
    const maxFileSize = 15 * 1024 * 1024;
    const fileSizeInBytes =
      (document.length * 3) / 4 - (document.endsWith("==") ? 2 : document.endsWith("=") ? 1 : 0);

    if (fileSizeInBytes > maxFileSize) {
      const error = new Error("File size exceeds the limit.");
      error.statusCode = 400;
      throw error;
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
      { $push: { documents: documentObject } },
      { new: true }
    );

    // Success response
    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      talent: updatedTalent,
    });
  })
);


//Delete Document -- DYLAN
router.delete(
  "/talent/delete-document/:talentId/:docId",
  wrapAsync(async (req, res) => {
    const { talentId, docId } = req.params;

    const Talent = require("../models/talent");
    const updatedTalent = await Talent.findByIdAndUpdate(
      talentId,
      { $pull: { documents: { _id: docId } } },
      { new: true }
    );

    if (!updatedTalent) {
      const error = new Error("Talent not found or document does not exist.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      talent: updatedTalent,
    });
  })
);


//Upload resume - Dylan
router.put(
  "/talent/upload-resume/:id",
  upload.single("video"), // 
  wrapAsync(async (req, res) => {
    const talentId = req.params.id;

    if (!req.file || !req.file.path) {
      throw new Error("No video uploaded.");
    }

    const Talent = require("../models/talent");
    const talent = await Talent.findById(talentId);

    if (!talent) {
      throw new Error("Talent not found.");
    }

    //  Delete old video from Cloudinary if it exists**
    if (talent.video && talent.video.path) {
      try {
        const oldVideoUrl = talent.video.path;
        const publicId = oldVideoUrl.split("/").pop().split(".")[0];
    
        console.log("Deleting old resume video with Public ID:", publicId);
        
        await deleteVideo(publicId); 
        console.log("Old resume video deleted successfully");
      } catch (err) {
        console.error("Failed to delete old resume video:", err);
      }
    }
     

    // Save new video URL in the database*
    const updatedTalent = await Talent.findByIdAndUpdate(
      talentId,
      {
        "video.filename": req.file.filename,
        "video.path": req.file.path, 
        "video.fileType": req.file.mimetype,
        "video.newVideo": true,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Resume video uploaded successfully.",
      videoUrl: req.file.path,
    });
  })
);



//Edit Contact Information - Dylan
router.put(
  "/talent/update-contact-details/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params; // Extract User ID
    const { phone, email } = req.body; // Extract phone and email

    const Talent = require("../models/talent"); // Ensure the model is imported
    const updatedTalent = await Talent.findByIdAndUpdate(
      id,
      { phone, username: email },
      { new: true }
    );

    if (!updatedTalent) {
      const error = new Error("Talent not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Contact details updated successfully",
      talent: updatedTalent,
    });
  })
);
// Summary, industry, website, location, company size
router.put(
  "/edit-profile/:userId",
  wrapAsync(async (req, res) => {

    try {
      const userId = req.params.userId;
      const updatedData = req.body.data; 
      const userType = req.body.userType; // 'talent' or 'organization'
      const dataField = req.body.dataField; // Industry, website, location, summary ...
      console.log(req.body)

      // Define max length for each dataField
      const maxLengths = {
        about: 5000,       
        industry: 255,      
        website: 255,       
        hq: 255,
        companySize: 27, 
      };

      // Ensure the right data field for the user type and right usertype
      if (userType === 'organization') {
        const validOrgFields = ['industry', 'website', 'location', 'about', "companySize"]; 
        if (dataField && !validOrgFields.includes(dataField)) {
          return res.status(400).json({
            success: false,
            message: `Invalid field ${dataField} for organization`,
          });
        }
      } else if (userType === 'talent') {
        const validTalentFields = ['about']; 
        if (dataField && !validTalentFields.includes(dataField)) {
          return res.status(400).json({
            success: false,
            message: `Invalid field ${dataField} for talent`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid user type",
        });
      }

      // Not allowing overwrite to null
      if (!updatedData) {
        return res.status(400).json({ 
            success: false, 
            message: `Can't leave ${dataField} empty`
          });
      }

      // Limiting the length of the summary 
      const maxDataSize = maxLengths[dataField] ?? 1000;  // 250 characters?
      if (updatedData.length > maxDataSize) {
        return res.status(400).json({
          success: false,
          message: `This exceeds the character limit of ${maxDataSize}`,
        });
      }

      let updatedUser;
      // Creating data dictionary for the selected datafields
      const updateField = {};
      updateField[dataField] = updatedData;

      // Determine user type and update accordingly
      if (userType === 'talent') {
        const Talent = require("../models/talent");
        updatedUser = await Talent.findByIdAndUpdate(
          userId,
          updateField,
          { new: true }
        );
      } else if (userType === 'organization') {
        const Organization = require("../models/organization");
        updatedUser = await Organization.findByIdAndUpdate(
          userId,
          updateField,
          { new: true }
        );
      } 

      // Success response
      res.status(200).json({
        success: true,
        message: `${dataField} successfully updated`,
        user: updatedUser,
      });

    } catch (error) {
      // Catch and handle unexpected errors
      console.error(`Error updating ${dataField}:`, error.message);
      res.status(500).json({
        success: false,
        message: "Please try again later.",
        error: error.message,
      });
    }
  })
);

// Update Skills - This also handles delete -- MONTE
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