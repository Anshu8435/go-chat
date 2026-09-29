import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
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
      default: null,
    },
    password: {
      type: String,
      required: function () {
        return !this.google_id && this.loginType === "normal_user";
      },
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

const User = mongoose.models.User || mongoose.models.user || mongoose.model("User", UserSchema);
export default User;


