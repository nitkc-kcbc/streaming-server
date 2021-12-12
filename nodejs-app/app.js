const express = require("express");
const app = express();
const passport = require("./auth");
const session = require("express-session");
const flash = require("connect-flash");
const archiver = require("archiver");
const fs = require("fs");

// default streamkey
let streamkey = "kcbc";

// 認証の有効化設定
let is_active_auth = true;
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
  if (!is_active_auth || req.isAuthenticated()) {
    next();
  } else {
    res.redirect(302, "/login");
  }
};
const adminAuthMiddleware = (req, res, next) => {
  if (req.isAuthenticated() && req.user.grant == "admin") {
    next();
  } else {
    req.flash("auth_error", "管理者権限がありません。");
    res.redirect(302, "/login");
  }
};

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
  res.cookie("streamkey", streamkey);
  res.render("main.ejs");
});

app.get("/admin", adminAuthMiddleware, (req, res) => {
  res.render("admin.ejs", {
    message: "",
    streamkey: streamkey,
    is_active_auth: is_active_auth
  });
});

// 認証フォームの受信
app.post(
  "/confirm",
  (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true
    })(req, res, next);
  }
);

// 配信開始通知の受信&ストリームキーの認証
app.post(
  "/live/on_publish",
  (req, res, next) => {
    if (req.body.name == streamkey) {
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  }
)

app.post(
  "/change_streamkey",
  adminAuthMiddleware,
  (req, res, next) => {
    streamkey = req.body.streamkey;
    res.render("admin.ejs", {
      message: "ストリームキーを変更しました。",
      streamkey: streamkey,
      is_active_auth: is_active_auth
    });
  }
);

app.post(
  "/activate_auth",
  adminAuthMiddleware,
  (req, res, next) => {
    is_active_auth = req.body.is_active == "on";
    let st = Number(is_active_auth);
    res.render("admin.ejs", {
      message: `認証を${["無","有"][st]}効化しました。`,
      streamkey: streamkey,
      is_active_auth: is_active_auth
    });
  }
);

app.post(
  "/download_hls",
  adminAuthMiddleware,
  (req, res, next) => {
    // zip形式で圧縮
    const archive = archiver('zip', {
      zlib: { level: 9 } // 圧縮レベル
    });
    // レスポンスに圧縮結果を出力
    archive.pipe(res);
    // 圧縮対象のファイルを指定
    archive.glob('hls/*');
    // 圧縮実行
    archive.finalize();
  }
);

app.post(
  "/delete_hls",
  adminAuthMiddleware,
  (req, res, next) => {
    fs.readdirSync('./hls').forEach(file => {
      fs.unlinkSync(`./hls/${file}`, (err) => {
        if (err) {
          res.render("admin.ejs", {
            message: "HLSファイルの削除に失敗しました。",
            streamkey: streamkey,
            is_active_auth: is_active_auth
          });
        }
      });
    }),
    res.render("admin.ejs", {
      message: "HLSファイルを削除しました。",
      streamkey: streamkey,
      is_active_auth: is_active_auth
    });
  }
);

// hlsを認証付きでマウント
app.use("/hls",
  authMiddleware,
  express.static("hls")
);

// 3000番で待ち受け
app.listen(3000, () => {
  console.log(`Express server listening.`);
});