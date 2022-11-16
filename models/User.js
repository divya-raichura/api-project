const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
});

userSchema.pre("save", async function () {
  // console.log(this);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // console.log("in presave");
});

userSchema.methods.createToken = function () {
  return sign({ userId: this._id, name: this.name }, process.env.SECRET_TOKEN, {
    expiresIn: "30d",
  });
};

userSchema.methods.comparePassword = async function (password) {
  const check = await bcrypt.compare(password, this.password);
  return check;
};

module.exports = mongoose.model("User", userSchema);
