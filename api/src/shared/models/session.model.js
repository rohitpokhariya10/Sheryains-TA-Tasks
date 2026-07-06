import mongoose from "mongoose";

/**
 * A refresh-token session. One document per active login (device).
 * Enables refresh-token rotation and remote logout.
 */
const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Hashed refresh token so a DB leak can't be used to mint sessions.
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — Mongo removes the session automatically once it expires.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model("Session", sessionSchema);
