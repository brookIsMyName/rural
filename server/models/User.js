// server/models/User.js
import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: true, trim: true,
    },
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
    },
    password: {
      // null for Google OAuth users (they don't set a password)
      type: String, default: null,
    },
    googleId: {
      type: String, default: null,
    },
    avatar: {
      type: String, default: null, // Google profile picture URL
    },
    provider: {
      type: String, enum: ["local", "google"], default: "local",
    },
  },
  {
    timestamps: true,  // adds createdAt, updatedAt automatically
    collection: "UserInfo",  // ← your existing collection name
  }
);

// Hash password before saving (only for local accounts)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain password to hashed one
userSchema.methods.comparePassword = async function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

// Strip sensitive fields when converting to JSON
userSchema.methods.toSafeObject = function () {
  return {
    id:       this._id,
    name:     this.name,
    email:    this.email,
    avatar:   this.avatar,
    provider: this.provider,
  };
};

// Mongoose uses the default connection — we point that at "Health" in the URI
export default mongoose.model("User", userSchema);
