const express = require("express");
const path = require("path");
const app = express();

const DefaultRouter = require("./routes/default");
const UserRouter = require("./routes/user");
const DailyRouter = require("./routes/daily");
const MygymRouter = require("./routes/mygym");
const CommunityRouter = require("./routes/community");
const MyPageRouter = require("./routes/my-page");
const MyPostRouter = require("./routes/my-post");

const session = require("express-session");
const db = require("./data/database");
const mongodbStore = require("connect-mongodb-session");
const MongoDBStore = mongodbStore(session);

const sessionStore = new MongoDBStore({
  uri: "mongodb://localhost:27017",
  databaseName: "Gym",
  collection: "sessions",
});

app.use(
  session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/", DefaultRouter);
app.use("/", UserRouter);
app.use("/", DailyRouter);
app.use("/", MygymRouter);
app.use("/", CommunityRouter);
app.use("/", MyPageRouter);
app.use("/", MyPostRouter);

app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});

db.connectToDatabase().then(function () {
    app.listen(3000);
});
