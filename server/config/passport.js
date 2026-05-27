// server/config/passport.js
import passport from "passport";
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

// ── Local Strategy (email + password) ────────────────────────────────────────
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(null, false, { message: "No account found with that email." });
      }

      // Block login only if account has NO password at all (pure Google account)
      // If they have both a password AND a googleId, allow email login
      if (!user.password) {
        return done(null, false, { message: "This account uses Google sign-in. Please sign in with Google." });
      }

      const match = await user.comparePassword(password);
      if (!match) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// ── Google Strategy ───────────────────────────────────────────────────────────
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
          const googleId = profile.id;
          const email    = profile.emails?.[0]?.value;
          const avatar   = profile.photos?.[0]?.value || null;
          const name     = profile.displayName;

          // 1. Already linked by googleId
          let user = await User.findOne({ googleId });
          if (user) return done(null, user);

          // 2. Existing email account — link Google to it
          //    BUT preserve the existing provider + password so email login still works
          user = await User.findOne({ email });
          if (user) {
            user.googleId = googleId;
            user.avatar   = avatar;
            // Only update provider to "google" if they have no password
            // If they registered with email+password, keep provider as "local"
            // so both login methods continue to work
            if (!user.password) {
              user.provider = "google";
            }
            await user.save();
            return done(null, user);
          }

          // 3. Brand new user — create with Google
          user = await User.create({
            name,
            email,
            googleId,
            avatar,
            provider: "google",
            password: null,
          });

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
