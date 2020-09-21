const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
	coach: {
		type: [mongoose.Schema.ObjectId],
		ref: 'User',
		default: undefined
	},
	session: {
		type: [mongoose.Schema.ObjectID],
		ref: 'Session',
		default: undefined
	},
	message: {
		type: String,
		required: true
	},
	rating: { type: Number, min: 0, max: 5 }
});

export const Review = mongoose.model('Review', ReviewSchema)