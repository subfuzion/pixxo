// ===========================================================================
// exports Comment
// ===========================================================================

const
  mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;

const commentSchema = new mongoose.Schema({
  photo: ObjectId,
  comment: String,
  comments: [ { comment: mongoose.Schema.Types.Mixed }]
});

const Comment = mongoose.model('comment', commentSchema);

