// ===========================================================================
// pixxo db
// ===========================================================================

const
  mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;

// ===========================================================================
// implementation
// ===========================================================================

function connect(uri, callback) {
  mongoose.connect(uri, callback);
}

// ===========================================================================
// schema
// ===========================================================================


const photoSchema = new mongoose.Schema({
  user: ObjectId,
  stream: ObjectId,
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

const Photo = mongoose.model('photo', photoSchema);

const photoStreamSchema = new mongoose.Schema({
  user: ObjectId,
  timestamp: Date,
  name: String,
  caption: String,
  tags: [ String ],
  permissions: [String]
});

const PhotoStream = mongoose.model('photostream', photoStreamSchema);

const commentSchema = new mongoose.Schema({
  photo: ObjectId,
  comment: String,
  comments: [ { comment: mongoose.Schema.Types.Mixed }]
});

const Comment = mongoose.model('comment', commentSchema);






module.exports = {
  connect: connect,
  User: require('./user'),
  Photo: Photo,
  PhotoStream: PhotoStream,
  Comment: Comment
};

