// ===========================================================================
// pixxo db
// ===========================================================================

const
  mongoose = require('mongoose');

module.exports = {
  connect: connect,
  User: require('./user'),
  Photo: require('./photo'),
  PhotoStream: require('./photostream'),
  Comment: require('./comment')
};

// ===========================================================================
// implementation
// ===========================================================================

function connect(uri, callback) {
  mongoose.connect(uri, callback);
}


