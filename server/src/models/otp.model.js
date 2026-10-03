import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["login", "forgot-password"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document automatically removed by MongoDB after 10 minutes
    },
  },
  {
    timestamps: true,
  }
);

const Otp = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
export default Otp;

