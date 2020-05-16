import { User } from '../models';

// @desc    Get coaches (Search)
// @route   GET /api/v1/coaches
// @access  Public
export const getCoaches = async (req, res, next) => {
  const queryCoaches = {
    $and: [
      { 'athlete.type': 'coach' },
      {
        ...req.query.text && ({
          $or: [
            { 'name': { $regex: req.query.text, $options: 'i' } },
            { 'location.city': { $regex: req.query.text, $options: 'i' } },
            { 'location.street': { $regex: req.query.text, $options: 'i' } }
          ]
        })
      },
      {
        ...req.query.gender && ({
          $or: [
            { 'athlete.gender': req.query.gender },
            { 'athlete.gender': { $all: ["male", "female"] } }
          ]
        })
      },
      { ...req.query.position && { 'athlete.position': { $all: req.query.position.split(',') } } }
    ]
  }

  let coaches = await User.find(queryCoaches);

  res.status(200).json({ size: coaches.length, coaches: coaches });
}

// @desc    Get coach
// @route   GET /api/v1/coaches/:id
// @access  Public
export const getCoach = async (req, res, next) => {
  const coach = await User.findById(req.params.id);
  if (!coach) {
    console.log(`Coach not found with id of ${req.params.id}`); res.status(404).json();
  }
  res.status(200).json({ coach });
}
