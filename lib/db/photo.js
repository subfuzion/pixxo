// ===========================================================================
// exports Photo
// ===========================================================================

const
  mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;

const photoSchema = new mongoose.Schema({
  user: ObjectId,
  photostream: ObjectId,
  timestamp: Date,
  caption: String,
  location: String, // todo: coords, etc.
  tags: [String],
  urls: [String],
  counts: {
    likes: Number,
    comments: Number
  },
  permissions: [String]
});

const Photo = module.exports = mongoose.model('photo', photoSchema);


