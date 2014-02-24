// ===========================================================================
// exports Photo
// ===========================================================================

const
  mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;

const sizes = [ 'normal', 'thumb' ];

const photoSchema = new mongoose.Schema({
  user_id: { type: ObjectId, required: true },
  photostream: ObjectId,
  timestamp: { type: Date, require: true, default: Date },
  caption: String,
  location: String, // todo: coords, etc.
  tags: [String],
  urls: [
    {
      size: { type: String, enum: sizes, required: true },
      url: { type: String, required: true }
    }
  ],
  counts: {
    likes: Number,
    comments: Number
  },
  permissions: [String]
});

const Photo = module.exports = mongoose.model('photo', photoSchema);


