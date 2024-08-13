const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Talent = mongoose.model("Talent");
const Organization = mongoose.model("Organization");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = await Talent.findById(decoded.id).select("-password");

      if (!user) {
        user = await Organization.findById(decoded.id).select("-password");
      }

      if (!user) {
        return res.status(401).json({ error: "User not found, unauthorized" });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
