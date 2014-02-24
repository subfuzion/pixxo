// ===========================================================================
// exports PhotoStream
// ===========================================================================

const
  mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;

const photoStreamSchema = new mongoose.Schema({
  user: ObjectId,
  timestamp: Date,
  name: String,
  caption: String,
  tags: [ String ],
  permissions: [String]
});

const PhotoStream = mongoose.model('photostream', photoStreamSchema);

