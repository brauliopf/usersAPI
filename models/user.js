const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');  // generate token - https://jwt.io/
const bcrypt = require('bcryptjs');   // encrypt password
import { timestamp } from "./plugins/timestamp"

const UserSchema = new mongoose.Schema({

  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email must be unique"],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"]
  },
  name: {
    type: String,
    required: [true, "name is required"]
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 4,
    select: false // default not to return the password when query the user
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    match: [/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, "Invalid phone number"]
  },
  location: {
    street: String,
    complement: String,
    city: String,
    state: String,
    zipcode: String,
    geo: {
      lat: { type: String },
      lng: { type: String },
      select: false
    }
  },
  athlete: {
    sport: { type: String, enum: ['lacrosse'], required: (this.athlete && this.athlete.type) },
    type: {
      type: String, enum: ['player', 'coach'], validate: [function (val) {
        return (val != "coach" || (this.athlete.coachApplication.submittedAt != null && this.athlete.coachApplication.approvedAt != null) || (this.athlete.coachApplication.submittedAt == this.athlete.coachApplication.approvedAt))
      }, "A coach must be approved by admin and have the approval date registered"]
    },
    coachApplication: {
      submittedAt: { type: Date },
      approvedAt: { type: Date },
      rejectedAt: { type: Date }
    },
    position: {
      type: [String],
      enum: ['F/O', 'GOALIE', 'MID', 'ATT', 'DEF', 'LSM/SSDM'],
      required: (this.athlete && this.athlete.type),
      default: undefined
    },
    rating: {
      rate: { type: Number, min: 0, max: 5 },
      qtyReviews: { type: Number }
    },
    bio: { type: String, maxlength: 400 },
    gender: { type: String, enum: ['male', 'female'], default: undefined },
    college: { type: String },
    team: { type: String },
    experiences: {
      type: [Map],
      default: undefined,
      validate: [(val) => val.reduce((typeChecker, curr) => typeChecker && ["pro", "college", "highSchool"].includes(curr.get("type")), true), `Experience type must be 'pro', 'college' or 'highSchool'.`]
    },
    experienceTime: {
      men: { type: Number },
      women: { type: Number }
    },
    dob: { // '1988-04-20'
      type: Date,
      required: (this.athlete && this.athlete.type === "player")
    },
    sessions: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Session',
      default: undefined
    },
    video: String
  },
  connectedAccounts: {
    google: {
      id: { type: String },
      token: { type: String },
      email: { type: String },
      name: { type: String },
      sub: { type: String }
    }
  },
  picture: {
    type: String
  },
  userConfirmedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
UserSchema.plugin(timestamp);

// executed before save even when payload contains repeated data
UserSchema.pre('save', async function (next) {

  if (!this.isModified('password')) next();

  // if password did change: encrypt password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.pre('save', async function (next) {

  if (!this.isModified('picture')) next();

  // if provided picture on signup, do not use default avatar
  this.picture !== undefined ? next() :
    this.picture = `https://train-my-game.s3.us-east-2.amazonaws.com/${`avatar/default/male/0${Math.floor(Math.random() * Math.floor(4)) + 1}.png`}`;

  next();
});

// match user entered password to hashed password on DB
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// sign JWT and return
UserSchema.methods.getSignedJwtToken = function (expires) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: expires || process.env.JWT_EXPIRE
  });
};

export const User = mongoose.model('User', UserSchema);