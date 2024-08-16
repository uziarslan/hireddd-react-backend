const mongoose = require("mongoose");
const Talent = mongoose.model("Talent");
const Organization = mongoose.model("Organization");
const { uploader } = require("cloudinary").v2;

// Function to upload video to Cloudinary
const uploadVideo = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      console.error("Upload Video Error: URL is missing");
      return reject(new Error("Invalid file upload: URL is missing"));
    }

    // Upload the video from URL to Cloudinary
    uploader.upload(
      url,
      { resource_type: "video", folder: "Hireddd React" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
  });
};

const talentProfileHandler = async (req, res) => {
  const { skills, firstName, lastName, location, about } = req.body;
  const { profile, video } = req.files;

  const { id } = req.user;

  // Check for required fields
  if (!firstName)
    return res.status(400).json({ error: "First name is required" });
  if (!lastName)
    return res.status(400).json({ error: "Last name is required" });
  if (!location) return res.status(400).json({ error: "Location is required" });
  if (!about) return res.status(400).json({ error: "About is required" });
  if (!skills) return res.status(400).json({ error: "Skills are required" });

  const skillsList = skills.split(",").map((s) => s.trim());

  const updatedUser = {
    firstName,
    lastName,
    location,
    about,
    skills: skillsList,
    profileCompleted: true,
  };

  // Handle profile image if uploaded
  if (profile) {
    const profileFile = profile[0];

    // Remove the old profile image from Cloudinary
    if (req.user.profile && req.user.profile.filename) {
      await uploader.destroy(req.user.profile.filename);
    }

    updatedUser.profile = {
      filename: profileFile.filename,
      path: profileFile.path,
    };
  }

  // Handle video if uploaded
  if (video) {
    const videoFile = video[0];

    // Remove the old video from Cloudinary
    if (req.user.video && req.user.video.filename) {
      await uploader.destroy(req.user.video.filename, {
        resource_type: "video",
      });
    }

    try {
      // If videoFile.path is a Cloudinary URL, use it directly
      const videoUrl = videoFile.path.startsWith("http")
        ? videoFile.path // If it's already a URL, use it directly
        : await uploadVideo(videoFile.path); // Otherwise, upload it

      updatedUser.video = {
        filename: videoFile.filename,
        path: videoUrl,
        fileType: videoFile.mimetype,
        newVideo: true,
      };
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error uploading video to Cloudinary" });
    }
  }

  // Update the user's profile in the database
  const talent = await Talent.findByIdAndUpdate(id, updatedUser, { new: true });

  if (!talent) {
    return res.status(404).json({ error: "Talent not found" });
  }

  res.status(200).json({ success: "Profile updated successfully" });
};

const organizationHandler = async (req, res) => {
  const { firstName, lastName, location, about, industry } = req.body;
  const { id } = req.user;

  if (!firstName) {
    return res.status(400).json({ error: "First name is required" });
  }
  if (!lastName) {
    return res.status(400).json({ error: "Last name is required" });
  }
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }
  if (!about) {
    return res.status(400).json({ error: "About is required" });
  }
  if (!industry) {
    return res.status(400).json({ error: "Skills are required" });
  }

  const updatedOrg = {
    firstName,
    lastName,
    location,
    about,
    industry,
    profileCompleted: true,
  };

  if (!req.user.profile.path) {
    if (!req.file) {
      return res.status(400).json({ error: "Profile Image is required." });
    }
  }

  if (req.file) {
    if (req.user.profile && req.user.profile.filename) {
      await uploader.destroy(req.user.profile.filename);
    }
    updatedOrg.profile = {
      filename: req.file.filename,
      path: req.file.path,
    };
  }

  const org = await Organization.findByIdAndUpdate(id, updatedOrg, {
    new: true,
  });

  if (!org) {
    return res.status(404).json({ error: "Orgnization profile not found" });
  }

  return res.status(200).json({ success: "Profile updated successfully" });
};

const talentSettings = async (req, res) => {
  const { id } = req.user;
  await Talent.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    { new: true }
  );
};

module.exports = {
  talentProfileHandler,
  organizationHandler,
  talentSettings,
};
