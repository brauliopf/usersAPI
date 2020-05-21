import { User } from '../models';
import jwt from 'jsonwebtoken';
import ErrorResponse from "../utils/errorResponse"

// @desc    User login
// @route   POST /api/v1/users/login {email, password} || {token}
// @access  Public
export const login = async (req, res, next) => {
  const { email, password, token } = req.body
  let user = {}

  if (!token && !(email && password)) console.log("Request error");

  if (token) {
    // if local token, get user and refresh token
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET); // decrypt user_id using stored secret
      user = await User.findById(decoded.id)
    } catch (err) {
      console.log(token)
    }
  }
  else {
    user = await User.findOne({ email: email }).select('+password')
    if (!user) { return res.status(404).json({ error: "USER_NOT_FOUND" }); }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) { return res.status(404).json({ error: "INVALID_CREDENTIALS" }); }
  }

  sendTokenReponse(user, 200, res);
}

// @desc    Create a user
// @route   POST /api/v1/users {email, password}
// @access  Public
export const createUser = async (req, res, next) => {
  const { name, email, password, gender, position, experience, dob, picture } = req.body
  const user = await User.create({
    name, email, password, picture,
    "athlete.gender": gender,
    "athlete.experienceTime.player": experience,
    "athlete.dob": dob,
    "athlete.position": position,
    "athlete.experience.player": experience
  }).catch(err => res.status(400).json({ error: "DUPLICATED_EMAIL" }))
  sendTokenReponse(user, 201, res)
}

// @desc    Update a user
// req.params: URL params (usually ID) | res.body: JSON object (must sete header)
// @route   PUT /api/v1/users/:id
// @access  Private
export const updateUser = async (req, res, next) => {
  const oldUser = await User.findById(req.user.id)
  const user = mapParams(oldUser, req.body)

  if (!user) throw new ErrorResponse(`User not found with id of ${req.user.id}`, 404);
  user.save()

  res.status(200).json({ user });
}

// @desc    Get users public info (name, picture)
// @route   POST /api/v1/users
// @access  Public
export const getUsersPublicProfile = async (req, res, next) => {
  User.find({ "_id": { $in: req.body.users } }, "name picture")
    .then(users => res.status(200).json(convertArrayToObject(users, "_id")))
}

// @desc    Create new coach and submit for approval
// @route   POST /api/v1/users/coach-apply
// @access  Public
export const coachApplication = async (req, res, next) => {
  let user = {}

  // logged in
  if (req.user) {
    const oldUser = await User.findById(req.user.id);
    user = mapParams(oldUser, req.body);
    user.athlete.coachApplication = { submittedAt: Date.now() };
    user.save();
    return sendTokenReponse(user, 200, res);
  }

  // not logged in
  else {
    const temp = await User.findOne({ email: req.body.email }).select('+password')

    // user exists
    if (temp) {
      const isMatch = await temp.matchPassword(req.body.password);
      if (!isMatch) { return res.status(404).json({ error: "INVALID_CREDENTIALS" }); }
      // matched! edit user
      user = mapParams(temp, req.body)
      user.athlete.coachApplication = { submittedAt: Date.now() }
      user.save()
      return sendTokenReponse(user, 200, res);
    }

    // user does not exist
    user = mapParams({}, req.body)
    user.athlete.coachApplication = { submittedAt: Date.now() }
    return User.create(user)
      .then(u => sendTokenReponse(u, 201, res))
      .catch(err => res.status(400).json)
  }

}

// @desc    Get applicants to coach
// @route   GET /api/v1/users/coach-applicants
// @access  Private (admin)
export const coachApplicants = async (req, res, next) => {
  User.find({
    $and: [
      { "role": "user" },
      { "athlete.coachApplication.submittedAt": { $ne: null } },
      { "athlete.coachApplication.approvedAt": { $eq: null } },
      { "athlete.coachApplication.rejectedAt": { $eq: null } }
    ]
  })
    .then(users => res.status(200).json(users))
}

export const replyCoachApplicant = async (req, res, next) => {
  const oldUser = await User.findById(req.params.id)
  const user = mapParams(oldUser, req.body)

  if (!user) throw new ErrorResponse(`User not found with id of ${req.params.id}`, 404);
  user.save()

  res.status(200).json({ user });
}

// *** Auxiliar
// Convert array to object
const convertArrayToObject = (arr, key) => {
  return arr.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item
    }
  }, {})
}

// Generate token and send response with token
const sendTokenReponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  // Set link to new user on response header
  res.set('path', `/api/v1/users/${user._id}`)

  // Send new user data on response body
  res
    .status(statusCode)
    .json({
      token: token,
      user: user
    });

};

// Get data input to update user
const mapParams = (oldUser, data) => {

  let user = oldUser
  for (let [key, value] of Object.entries(data)) {
    if (["name", "email", "location", "password", "phone", "picture"].includes(key)) { user[key] = value }

    // athlete attributes
    else if (key === "experiences") {
      if (!user.athlete || !user.athlete.experience) user.athlete.experience = {}
      user.athlete.experience.experiences = value
    }
    else if (key === "menLacrosse" || key === "womenLacrosse") {
      if (!user.athlete || !user.athlete.experience) user.athlete.experience = {}
      if (key[0] === "m") user.athlete.experience["coach_men"] = value
      else user.athlete.experience["coach_women"] = value
    }

    else if (key === "applicationDecision") {
      if (value) {
        user.athlete.coachApplication.approvedAt = Date.now();
        user.athlete.type = "coach";
      }
      else {
        user.athlete.coachApplication.rejectedAt = Date.now();
      }
    }

    else {
      if (!user.athlete) user.athlete = {}
      else user.athlete[key] = value
    }
  }

  return user;

}