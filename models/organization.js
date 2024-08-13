const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const orgSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
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
  industry: {
    type: String,
  },
  companySize: {
    type: String,
  },
  about: {
    type: String,
  },
  website: {
    type: String,
  },
  profile: {
    filename: String,
    path: String,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "organization",
  },
  otp: {
    type: String,
  },
});

orgSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

orgSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Organization", orgSchema);
