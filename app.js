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
      maxAge: 12 * 60 * 60 * 1000,
      httpOnly: true,
    },
  }),
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// 토스 결제 
(async () => {
  const { default: got } = await import("got");

  app.post("/confirm", async (req, res) => {
    const { paymentKey, orderId, amount } = req.body;

    const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
    const encryptedSecretKey =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    try {
      const response = await got.post("https://api.tosspayments.com/v1/payments/confirm", {
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
        json: { orderId, amount, paymentKey },
        responseType: "json",
      });

      console.log(response.body);
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      console.log(error.response.body);
      res.status(error.response.statusCode).json(error.response.body);
    }
  });
})();


app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", UserRouter);
app.use("/", CommunityRouter);
app.use("/", MyPageRouter);
app.use("/", MyPostRouter);
app.use("/", ShopRouter);
app.use("/", DefaultRouter);

db.connectToDatabase().then(function () {
  console.log(`http://localhost:${3000} 으로 샘플 앱이 실행되었습니다.`)
  app.listen(3000);
});