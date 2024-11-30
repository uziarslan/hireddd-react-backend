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

// Talent Profile Settings
router.post("/talent/setting", protect, wrapAsync(talentSettings));



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



//-----------------------------------------------------------------------


module.exports = router;



