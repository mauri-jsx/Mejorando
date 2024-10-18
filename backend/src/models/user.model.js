import mongoose from "mongoose";
mongoose.set("strictPopulate", false);
const userModel = new mongoose.Schema({
  usernames: { type: String, required: true, trim: true },
  passwords: { type: String, required: true, trim: true },
  emails: { type: String, required: true, trim: true },
  publications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Publications" }],
  profilePicture: {
    _id: { type: String, default: "imagenProyect/afpdiox30acmlfvcskww" },
    url: { type: String, default: "https://res.cloudinary.com/ddwriwzgm/image/upload/v1727374339/imagenProyect/afpdiox30acmlfvcskww.jpg" },
  },
  isApproved: { type: Boolean, default: false },
  isAuthorized: { type: Boolean, default: false },
});

export const user = mongoose.model("User", userModel);
