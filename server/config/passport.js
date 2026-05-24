// server/config/passport.js
import passport        from "passport";
import { Strategy as LocalStrategy }  from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

// ── Serialize / Deserialize ───────────────────────────────────────────────────
passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ── Local Strategy ────────────────────────────────────────────────────────────
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user)                      return done(null, false, { message: "No account found with that email." });
      if (user.provider === "google") return done(null, false, { message: "Please sign in with Google." });
      const match = await user.comparePassword(password);
      if (!match)                     return done(null, false, { message: "Incorrect password." });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// ── Google Strategy — wrapped in a function so it only runs AFTER dotenv ──────
export function initGoogleStrategy() {
  const clientID     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL  = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  if (!clientID || !clientSecret) {
    console.warn("⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing — Google login disabled.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });
            if (user) {
              user.googleId = profile.id;
              user.avatar   = profile.photos?.[0]?.value || null;
              user.provider = "google";
              await user.save();
            } else {
              user = await User.create({
                name:     profile.displayName,
                email:    profile.emails?.[0]?.value,
                googleId: profile.id,
                avatar:   profile.photos?.[0]?.value || null,
                provider: "google",
                password: null,
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  console.log("✅ Google OAuth strategy registered");
}

export default passport;
