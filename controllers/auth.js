const mongoose = require("mongoose");
const { MailtrapClient } = require("mailtrap");
const jwt = require("jsonwebtoken");
const Talent = mongoose.model("Talent");
const Organization = mongoose.model("Organization");

const TOKEN = process.env.MAILTRAP_API_TOKEN;
const ENDPOINT = process.env.MAILTRAP_END_POINT;
const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Hireddd",
};

const jwt_secret = process.env.JWT_SECRET;

const generateToken = (id) => {
  return jwt.sign({ id }, jwt_secret, {
    expiresIn: "30d",
  });
};

const registerTalent = async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await Talent.findOne({ username });

  if (foundUser) {
    return res
      .status(500)
      .json({ error: "Email already in use. Try differnt one." });
  }

  if (!username) {
    return res.status(500).json({ error: "Email is required." });
  }

  if (!password) {
    return res.status(500).json({ error: "Password is required." });
  }

  const talent = await Talent.create({
    ...req.body,
  });

  res.status(201).json({
    token: generateToken(talent._id),
    success: "Email has been registered",
  });
};

const orgSignup = async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await Organization.findOne({ username });

  if (foundUser) {
    return res
      .status(500)
      .json({ error: "Email already in use. Try different one." });
  }

  if (!username) {
    return res.status(500).json({ error: "Email is required." });
  }
  if (!password) {
    return res.status(500).json({ error: "Password is required." });
  }

  const org = await Organization.create({ ...req.body });

  res.status(201).json({
    token: generateToken(org._id),
    success: "Email has been registered",
  });
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  let user = await Talent.findOne({ username });

  if (!user) {
    user = await Organization.findOne({ username });
  }

  if (!user) {
    return res.status(400).json({ error: "No such user registered" });
  }

  if (user && (await user.matchPassword(password))) {
    if (user instanceof Talent) {
      if (!user.profileCompleted) {
        return res.json({
          token: generateToken(user._id),
          callBack: "/talent/profile",
        });
      } else {
        return res.json({
          token: generateToken(user._id),
          callBack: "/talent/dashboard",
        });
      }
    } else if (user instanceof Organization) {
      if (!user.profileCompleted) {
        return res.json({
          token: generateToken(user._id),
          callBack: "/organization/profile",
        });
      } else {
        return res.json({
          token: generateToken(user._id),
          callBack: "/organization/dashboard",
        });
      }
    }
  } else {
    res.status(401).json({ error: "Incorrect email or password" });
  }
};

const forgotPassword = async (req, res) => {
  const { username } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  let foundUser;
  foundUser = await Talent.findOneAndUpdate(
    { username },
    { $set: { otp } },
    { new: true }
  );

  if (!foundUser) {
    foundUser = await Organization.findOneAndUpdate(
      { username },
      { $set: { otp } },
      { new: true }
    );
  }

  if (!foundUser) {
    return res.status(500).json({ error: "Email not found" });
  }

  client.send({
    from: sender,
    to: [{ email: foundUser.username }],
    template_uuid: "48604504-446f-45e7-bc0b-f4ca17799075",
    template_variables: {
      user: foundUser,
      otp: foundUser.otp,
      link: `${process.env.DOMAIN_FRONTEND}/verify/code?id=${foundUser._id}`,
    },
  });

  return res.status(200).json({
    success: "Password reset email sent successfully",
    id: foundUser._id,
  });
};

const verifyCode = async (req, res) => {
  const { code, userId } = req.body;

  let foundUser;
  foundUser = await Talent.findById(userId);

  if (!foundUser) {
    foundUser = await Organization.findById(userId);
  }

  if (!foundUser) {
    return res.status(500).json({ error: "Email not found" });
  }

  if (foundUser.otp !== code) {
    return res.status(500).json({ error: "Code is incorrect" });
  } else {
    foundUser.otp = "";
    foundUser.save();
    return res
      .status(200)
      .json({ success: "Code is verified", id: foundUser._id });
  }
};

const setNewPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  let foundUser;
  foundUser = await Talent.findById(userId);

  if (!foundUser) {
    foundUser = await Organization.findById(userId);
  }

  if (!foundUser) {
    return res.status(500).json({ error: "Email not found" });
  }

  foundUser.setPassword(newPassword, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Password update failed" });
    }

    await foundUser.save();

    return res.status(200).json({ success: "Password updated successfully" });
  });
};

const getUser = async (req, res) => {
  let user = await Talent.findById(req.user.id).select("-password");

  if (!user) {
    user = await Organization.findById(req.user.id).select("-password");
  }

  if (!user) {
    return res.status(400).json({ error: "Invalid User" });
  }

  res.json(user);
};

module.exports = {
  registerTalent,
  orgSignup,
  handleLogin,
  forgotPassword,
  verifyCode,
  setNewPassword,
  getUser,
};
