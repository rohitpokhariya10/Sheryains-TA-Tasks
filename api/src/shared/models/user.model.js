import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const mediaSchema = new mongoose.Schema(
  {
    fileId: { type: String },
    url: { type: String },
    thumbnailUrl: { type: String },
    name: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Unique @handle used for user search.
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    about: { type: String, default: "Hey there! I am using chotuApp." },
    avatar: {
      type: mediaSchema,
      default: {},
    },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index to power fuzzy user search on name/username.
userSchema.index({ name: "text", username: "text" });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
