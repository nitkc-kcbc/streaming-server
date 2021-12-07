const express = require("express");
const app = express();
const passport = require("./auth");
const session = require("express-session");
const flash = require("connect-flash");
const fs = require("fs");
const http = require("http");
const https = require("https");

const HTTP_PORT = process.env.HTTP_PORT;
const HTTPS_PORT = process.env.HTTPS_PORT;
const options = {
  port: HTTPS_PORT,
  key: fs.readFileSync(process.env.RSA_KEY),
  cert: fs.readFileSync(process.env.RSA_CRT),
  minVersion: "TLSv1.2",
  maxVersion: "TLSv1.3"
};

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// セッション確認
const authMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect(302, "/login");
  }
}

// 静的ファイル群(./public/)をマウント
app.use(express.static("public"));

// "/login"へアクセスがあったら`login.ejs`を表示
app.get("/login", (req, res) => {
  res.render("login.ejs", {
    message: req.flash("auth_error")
  });
});

// "/"にアクセスされたら認証状況を取得し，未認証なら"/login"へリダイレクト，認証済みなら"/"へ
app.get("/", authMiddleware, (req, res) => {
  res.render("main.ejs");
});

// 認証フォームの受信
app.post(
  "/confirm",
  (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true
      // failureFlash: "ユーザー名かパスワードが間違っています。",
    })(req, res, next);
  }
);

// hlsを認証付きでマウント
app.use("/hls",
  authMiddleware,
  express.static("hls")
);

// ${HTTPS_PORT}番で待ち受け
https.createServer(options, app).listen(HTTPS_PORT, () => {
  console.log(`Express server listening on port ${HTTPS_PORT}[HTTPS].`);
});

// HTTP接続をHTTPSへリダイレクト
http.createServer(
  express().all("*", (req, res) => {
    res.redirect(`https://${req.hostname}${req.url}`);
  })
).listen(HTTP_PORT);