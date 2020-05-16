import { Session } from '../models';
import ErrorResponse from "../utils/errorResponse";
import mongoose from 'mongoose'

// @desc    Create session
// @route   POST /api/v1/session
// @access  Private (admin, coach)
export const createSession = async (req, res, next) => {
  const { title, location, date, start_time, end_time, price, max_participants } = req.body;
  const coach = req.user && req.user._id
  const timezoneOffset = 0

  let session = { coach, title, location, agenda: { date: date, start: start_time, end: end_time, timezoneOffset }, price, capacity: { max: max_participants } }

  // Parse times (EST = UTC + timezoneOffste)
  session.agenda = {
    date: new Date(...session.agenda.date.split("-"), 0, 0, 0, 0),
    start: new Date(...session.agenda.date.split("-"), ...session.agenda.start.split(":"), 0, 0),
    end: new Date(...session.agenda.date.split("-"), ...session.agenda.end.split(":"), 0, 0),
    timezoneOffset: new Date().getTimezoneOffset()
  }
  session = await Session.create(session);

  if (session) { res.status(201).json({ session }); }
  else { res.status(404).json({ error: "Could not create session with the data provided" }) }
};

// @desc    Get all sessions
// @route   GET /api/v1/sessions or /api/v1/coaches/:id/sessions
// @access  Public
export const getSessions = async (req, res, next) => {

  // get coach_id's sessions
  const id = req.params.id
  if (id) {
    const sessions = await Session.find({ 'coach': id }).populate({ path: 'participants' }).sort('agenda.start').exec();
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  }

  // search sessions
  const querySessions = {
    $and: [
      {
        ...req.query.dateTo ? {
          ...req.query.dateFrom ?
            { "agenda.start": { $gte: req.query.dateFrom, $lte: req.query.dateTo } } :
            { "agenda.start": { $gte: Date.now(), $lte: req.query.dateTo } }
        } : {
            ...req.query.dateFrom ?
              { "agenda.start": { $gte: req.query.dateFrom } } :
              { "agenda.start": { $gte: Date.now() } }
          }
      }
    ]
  }

  let sessions = await Session.find(querySessions);

  const reducer = (acc, crr) => {
    if (!acc[`${crr.coach}`]) acc[`${crr.coach}`] = [];
    acc[`${crr.coach}`] = acc[`${crr.coach}`].concat(crr)
    return acc;
  }

  res.status(200).json({ size: sessions.length, sessions: sessions.reduce(reducer, {}) });

};

// @desc    Get session
// @route   GET /api/v1/session/:id
// @access  Public
export const getSession = async (req, res, next) => {
  const session = await Session.findById(req.params.id).populate({ path: 'coach' }).populate({ path: 'participants' });

  if (!session) {
    return next(new ErrorResponse(`Session not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ session });
};

// @desc    Update session
// @route   PUT /api/v1/session/:id
// @access  Private
export const updateSession = async (req, res, next) => {
  const session = await Session.findByIdAndUpdate(req.params.id, { $push: { participants: req.body.new_participant } })

  if (!session) {
    return next(new ErrorResponse(`Session not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ session });
};

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