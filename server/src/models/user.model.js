import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    google_id: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    loginType: {
      type: String,
      enum: ["normal_user", "google_user", "hybrid_user"],
      default: "normal_user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", UserSchema);
export default User;

