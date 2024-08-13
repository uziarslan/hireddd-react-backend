if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
require("./models/talent");
require("./models/organization");
require("./models/chat");
require("./models/message");
const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const Talent = mongoose.model("Talent");
const Organization = mongoose.model("Organization");
const MongoDBStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20");
const bodyParser = require("body-parser");
const authenticationroutes = require("./routes/authentication");
const profileRoutes = require("./routes/profileRoutes");
const chatRoutes = require("./routes/chat");
const messageRoutes = require("./routes/message");
const searchRoutes = require("./routes/searchPage");
const ExpressError = require("./utils/ExpressError");
const cors = require("cors");
const wrapAsync = require("./utils/wrapAsync");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.DOMAIN_FRONTEND,
    methods: ["GET", "POST"],
  },
});

// Varibales
const PORT = 4000;

const mongoURi = process.env.MONGODB_URI;

const secret = "thisisnotagoodsecret";

const store = MongoDBStore.create({
  mongoUrl: mongoURi,
  secret,
  touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
  store,
  secret,
  name: "session",
  resave: false,
  saveUninitialized: false,
};

const corsOptions = {
  origin: process.env.DOMAIN_FRONTEND,
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

// Using the app
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// inititalizing Passport
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_FRONTEND}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Talent.findOne({ googleId: profile.id });
        if (!user) {
          user = new Talent({
            googleId: profile.id,
            fullname: profile.displayName,
            username: profile.emails[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Route handler
app.use("/api/v1", authenticationroutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", chatRoutes);
app.use("/api/v1", messageRoutes);
app.use("/api/v1", searchRoutes);

// SocketIo setup
io.on("connection", (socket) => {
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });
  socket.on("sendMessage", (message) => {
    io.to(message.chatId).emit("receiveMessage", message);
  });
  socket.on("disconnect", () => {});
});

// Logout route for every user
app.get(
  "/logout",
  wrapAsync(async (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.clearCookie("session"); // Adjust cookie name if needed
        return res.status(200).json({ success: "Logged out successfully" });
      });
    });
  })
);

// initializing Mongoose
mongoose
  .connect(mongoURi, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongoose is connected");
  })
  .catch((e) => {
    console.log(e);
  });

// handling the error message
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const { status = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(status).json({ error: err.message });
});

// Listen for the port Number
server.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});
