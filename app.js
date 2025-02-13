const path = require("path");

const express = require("express");
const expressSession = require("express-session");

const createSessionConfig = require("./config/session");
const db = require("./data/database");

const DefaultRouter = require("./routes/default.routes");
const UserRouter = require("./routes/auth.routes");
const CommunityRouter = require("./routes/community.routes");
const MyPageRouter = require("./routes/my-page.routes");
const MyPostRouter = require("./routes/my-post.routes");
const ShopRouter = require("./routes/shop.routes");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 📌 세션 로그인
const sessionConfig = createSessionConfig();
app.use(expressSession(sessionConfig));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// 📌 토스 결제 
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
app.use("/", UserRouter);
app.use("/", CommunityRouter);
app.use("/", MyPostRouter);
app.use("/", ShopRouter);
app.use("/", MyPageRouter);
app.use("/", DefaultRouter);

db.connectToDatabase().then(function () {
  console.log(`http://localhost:${3000} 으로 샘플 앱이 실행되었습니다.`)
  app.listen(3000);
});