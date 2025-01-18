const express = require("express");
const path = require("path");
const app = express();

const DefaultRouter = require("./routes/default.routes");
const UserRouter = require("./routes/auth.routes");
const CommunityRouter = require("./routes/community.routes");
const MyPageRouter = require("./routes/my-page.routes");
const MyPostRouter = require("./routes/my-post.routes");
const ShopRouter = require("./routes/shop.routes");

const session = require("express-session");
const db = require("./data/database");
const mongodbStore = require("connect-mongodb-session");
const MongoDBStore = mongodbStore(session);

const sessionStore = new MongoDBStore({
  uri: "mongodb+srv://thdgywns2300:oF4luy5LHKI7Cah3@gym.4vl2x.mongodb.net/Gym?retryWrites=true&w=majority&appName=Gym",
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
app.use("/", CommunityRouter);
app.use("/", MyPageRouter);
app.use("/", MyPostRouter);
app.use("/", ShopRouter);

app.use((req, res) => {
  res.status(404).render("errors/404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500");
});

db.connectToDatabase().then(function () {
    app.listen(3000);
});
