const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
require("dotenv").config();

const app = express();

const {
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL,
  PORT = 3000,
  SESSION_SECRET = "change_this_secret",
} = process.env;

// print all the env vars
console.log("Environment Variables:");
console.log("AUTH0_CLIENT_ID:", AUTH0_CLIENT_ID);
console.log("AUTH0_CLIENT_SECRET:", AUTH0_CLIENT_SECRET);
console.log("AUTH0_DOMAIN:", AUTH0_DOMAIN);
console.log("AUTH0_CALLBACK_URL:", AUTH0_CALLBACK_URL);
console.log("PORT:", PORT);
console.log("SESSION_SECRET:", SESSION_SECRET);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Environment Variables End");
console.log("===================================");

if (
  !AUTH0_CLIENT_ID ||
  !AUTH0_CLIENT_SECRET ||
  !AUTH0_DOMAIN ||
  !AUTH0_CALLBACK_URL
) {
  throw new Error("Missing required Auth0 environment variables.");
}

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

passport.use(
  new Auth0Strategy(
    {
      domain: AUTH0_DOMAIN, // monk-demo.us.auth0.com
      clientID: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      callbackURL: AUTH0_CALLBACK_URL,
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(
      `<h1>Welcome, ${
        req.user.displayName || req.user.nickname || req.user.id
      }</h1><pre>${JSON.stringify(
        req.user,
        null,
        2
      )}</pre><a href="/logout">Logout</a>`
    );
  } else {
    res.send('<h1>Home</h1><a href="/login">Login</a>');
  }
});

app.get(
  "/login",
  passport.authenticate("auth0", {
    scope: "openid profile email",
  })
);

app.get(
  "/callback",
  passport.authenticate("auth0", {
    failureRedirect: "/",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    const returnTo = encodeURIComponent(req.protocol + "://" + req.get("host"));
    res.redirect(
      `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${returnTo}`
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
