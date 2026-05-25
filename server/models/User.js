// server/models/User.js — add location field to schema
import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    avatar:   { type: String, default: null },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    location: {
      lat:       { type: Number, default: null },
      lng:       { type: Number, default: null },
      city:      { type: String, default: null },
      region:    { type: String, default: null },
      country:   { type: String, default: null },
      source:    { type: String, default: null }, // "gps" | "ip"
      updatedAt: { type: Date,   default: null },
    },
  },
  { timestamps: true, collection: "UserInfo" }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id:       this._id,
    name:     this.name,
    email:    this.email,
    avatar:   this.avatar,
    provider: this.provider,
    location: this.location,
  };
};

export default mongoose.model("User", userSchema);
