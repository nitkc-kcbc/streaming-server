const express = require("express");
const app = express();
const passport = require("./auth");
const session = require("express-session");
const flash = require("connect-flash");
const archiver = require("archiver");
const fs = require("fs");

// default streams
let streams = require("./db/streams.json");
// default users
let users = require("./db/users.json");

// 認証の有効化設定
let isActiveAuth = true;

let adminData = {
  activeTabNo: 0,
  message: "",
  msgStatus: "success",
  streams: streams,
  users: users,
  isActiveAuth: isActiveAuth
}

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
  if (!isActiveAuth || req.isAuthenticated()) {
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

// 配信状況の取得
function checkStreamingStatus() {
  for (let i in streams) {
    if (fs.existsSync(`./hls/${streams[i].streamkey}.m3u8`)) {
      streams[i].ok = true;
    } else {
      streams[i].ok = false;
    }
  }
}

function countAdmins() {
  let cnt = 0;
  for (let i in users) {
    if (users[i].grant == "admin") {
      cnt++;
    }
  }
  return cnt;
}

function getUserGrant(req) {
  if (!isActiveAuth && req.user === undefined) {
    return "viewer";
  }
  return req.user.grant;
}

function getStreamIndex(key) {
  return streams.findIndex(v => v.streamkey == key);
}

// 静的ファイル群(./public/)をマウント
app.use(express.static("public"));

// "/login"へアクセスがあったら`login.ejs`を表示
app.get("/login", (req, res) => {
  res.render("login.ejs", {
    message: req.flash("auth_error")
  });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect(302, "/login");
});

// "/"にアクセスされたら認証状況を取得し，未認証なら"/login"へリダイレクト，認証済みなら"/"へ
app.get("/", authMiddleware, (req, res) => {
  checkStreamingStatus();
  res.render("streams.ejs", {
    streams: streams,
    grant: getUserGrant(req)
  });
});

app.get("/watch", authMiddleware, (req, res) => {
  console.log(req.query.v);
  res.render("watch.ejs", {
    streams: streams,
    streamNo: getStreamIndex(req.query.v),
    grant: getUserGrant(req)
  });
});

app.get("/admin", adminAuthMiddleware, (req, res) => {
  adminData.activeTabNo = 0;
  adminData.message = "";
  adminData.msgStatus = "success";
  res.render("admin.ejs", adminData);
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
    if (streams.find((v) => v.streamkey == req.body.name)) {
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  }
);

app.post(
  "/create_stream",
  adminAuthMiddleware,
  (req, res, next) => {
    if (streams.find((v) => v.streamkey == req.body.streamkey)) {
      adminData.message = "既に登録されているストリームキーです。";
      adminData.msgStatus = "danger";
    } else {
      streams.push({
        title: req.body.title,
        description: req.body.description,
        streamkey: req.body.streamkey
      });
      adminData.message = "ストリームを追加しました。";
      adminData.msgStatus = "success";
    }
    adminData.activeTabNo = 0;
    res.render("admin.ejs", adminData);
  }
);

app.post(
  "/change_stream",
  adminAuthMiddleware,
  (req, res, next) => {
    let index = getStreamIndex(req.body.streamkey);
    if (index == -1) {
      adminData.message = "存在しないストリームキーです。";
      adminData.msgStatus = "danger";
    } else {
      streams[index].title = req.body.title;
      streams[index].description = req.body.description;
      adminData.message = "ストリームを変更しました。";
      adminData.msgStatus = "success";
    }
    adminData.activeTabNo = 0;
    res.render("admin.ejs", adminData);
  }
);

app.post(
  "/delete_stream",
  adminAuthMiddleware,
  (req, res, next) => {
    let keys = JSON.parse(req.body.streamkeys);
    for (let i in keys) {
      let index = getStreamIndex(keys[i]);
      if (index != -1) {
        streams.splice(index, 1);
      }
    }
    adminData.message = "ストリームを削除しました。";
    adminData.msgStatus = "success";
    adminData.activeTabNo = 0;
    res.render("admin.ejs", adminData);
  }
);

app.post(
  "/create_user",
  adminAuthMiddleware,
  (req, res, next) => {
    if (users.find((v) => v.username == req.body.username)) {
      adminData.message = "既に登録されているユーザーです。";
      adminData.msgStatus = "danger";
    } else {
      users.push({
        username: req.body.username,
        password: req.body.password,
        grant: req.body.grant
      });
      adminData.message = "ユーザーを追加しました。";
      adminData.msgStatus = "success";
    }
    adminData.activeTabNo = 1;
    res.render("admin.ejs", adminData);
  }
);

app.post(
  "/change_user",
  adminAuthMiddleware,
  (req, res, next) => {
    let index = users.findIndex((v) => v.username == req.body.username);
    if (index == -1) {
      adminData.message = "存在しないユーザーです。";
      adminData.msgStatus = "danger";
    } else {
      if (countAdmins() == 1 && req.body.grant != "admin") {
        adminData.message = "最低1人は管理者である必要があります。";
        adminData.msgStatus = "danger";
      } else {
        users[index].password = req.body.password;
        users[index].grant = req.body.grant;
        adminData.message = "ユーザーを変更しました。";
        adminData.msgStatus = "success";
      }
    }
    adminData.activeTabNo = 1;
    res.render("admin.ejs", adminData);
  }
);

app.post(
  "/delete_user",
  adminAuthMiddleware,
  (req, res, next) => {
    let delUsers = JSON.parse(req.body.users);
    adminData.message = "ユーザーを削除しました。";
    adminData.msgStatus = "success";
    for (let i in delUsers) {
      let index = users.findIndex((v) => v.username == delUsers[i]);
      if (index != -1) {
        if (delUsers[i] == req.user.username) {
          adminData.message = "自分自身を削除することはできません。";
          adminData.msgStatus = "danger";
        } else {
          users.splice(index, 1);
        }
      }
    }
    adminData.activeTabNo = 1;
    res.render("admin.ejs", adminData);
  }
);

app.post(
  "/activate_auth",
  adminAuthMiddleware,
  (req, res, next) => {
    isActiveAuth = req.body.is_active == "on";
    let st = Number(isActiveAuth);
    adminData.message = "認証を" + (st ? "有" : "無") + "効化しました。";
    adminData.msgStatus = "success";
    adminData.isActiveAuth = isActiveAuth;
    adminData.activeTabNo = 2;
    res.render("admin.ejs", adminData);
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
          adminData.message = "HLSファイルの削除に失敗しました。";
          adminData.msgStatus = "danger";
          adminData.activeTabNo = 2;
          res.render("admin.ejs", adminData);
        }
      });
    }),
    adminData.message = "HLSファイルを削除しました。";
    adminData.msgStatus = "success";
    adminData.activeTabNo = 2;
    res.render("admin.ejs", adminData);
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