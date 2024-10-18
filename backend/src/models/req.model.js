import mongoose from "mongoose";
mongoose.set("strictPopulate", false);
const reqModel = new mongoose.Schema({
  user: { type: String, require: true },
  email: { type: String, require: true },
  descriptions: { type: String, require: true },
  idUser: { type: String, require: true },
});

const request = mongoose.model("Request", reqModel);
export default request;
