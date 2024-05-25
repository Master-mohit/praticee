const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/pratice");

const userSchema = mongoose.Schema({
  username: String,
  name: String ,
  email: String,
  password: String,
  pic: String,
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:"user"
  }]
});
userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema)