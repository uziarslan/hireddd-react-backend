const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let format;

    if (file.mimetype.startsWith("image/")) {
      format = ["jpeg", "png", "jpg"];
    } else if (file.mimetype.startsWith("video/")) {
      format = ["mp4", "avi", "mov", "mkv", "webm"];
    } else {
      throw new Error("Invalid file type. Only images and videos are allowed.");
    }

    return {
      folder: "Hireddd React",
      resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
      allowedFormats: format,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
