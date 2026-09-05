import mongoose from "mongoose";
const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
    },
    google_id: {
      type: String,
    },

    password: {
      type: String,
      required: trusted,
    },

    loginType: {
      type: String,
      enum: ["normal_user", "google-_user", "hybrid_user"],
      required: true,
    },
  },

  {
    timestamps: true,
  },
);
const User = mongoose.model("user", UserSchema);
export default User;
