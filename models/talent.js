const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const talentSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  profile: {
    filename: String,
    path: String,
  },
  username: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  location: {
    type: String,
  },
  skills: [
    {
      type: String,
    },
  ],
  about: {
    type: String,
  },
  video: {
    filename: String,
    path: String,
    fileType: String,
    newVideo: {
      type: Boolean,
      default: false,
    },
  },
  phone: {
    type: String,
  },
  portfolios: [
    {
      icon: String,
      href: String,
    },
  ],
  documents: [
    {
      href: String,
    },
  ],
  socialMediaLinks: [
    {
      icon: String,
      href: String,
    },
  ],
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  displayLanguage: {
    type: String,
    default: "english",
  },
  privateAccount: {
    type: Boolean,
    default: false,
  },
  hideLikesAndShortlisted: {
    type: Boolean,
    default: false,
  },
  hideBadges: {
    type: Boolean,
    default: false,
  },
  hideLocation: {
    type: Boolean,
    default: false,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  trending: {
    type: Boolean,
    default: false,
  },
  likedNotification: {
    type: Boolean,
    default: false,
  },
  shortlistedNotification: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "talent",
  },
  otp: {
    type: String,
  },
});

talentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

talentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Talent", talentSchema);
