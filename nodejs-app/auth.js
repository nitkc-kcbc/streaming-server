const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const users = require("./db/users").Users;

// 認証方法の定義
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      password: "password",
      passReqToCallback: true
    },
    (req, username, password, done) => {
      const target = users.find((user) => user.username == username)
      if (target && target.password == password) {
        return done(null, true);
      } else {
        req.flash("auth_error", "ユーザー名かパスワードが間違っています。");
        return done(null, false);
      }
    }
  )
);

// ユーザ情報をセッションに保存する
passport.serializeUser((user, done) => {
  done(null, {username: user.username, grant: user.grant});
});

// ユーザ情報を返す
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
