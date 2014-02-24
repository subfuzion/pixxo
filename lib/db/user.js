// ===========================================================================
// exports User
// ===========================================================================

const
  mongoose = require('mongoose'),
  async = require('async'),
  Photo = require('./photo');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  lusername: { type: String, index: true, select: false },
  password: { type: String, required: true },
  email: { type: String, required: true, index: true, lowercase: true},
  name: {
    first: { type: String, trim: true },
    last: { type: String, trim: true}
  },
  location: {
    city: String,
    state: String
  },
  photo: {
    url: String,
    thumburl: String
  },
  joinDate: Date,
  lastLogin: Date,
  counts: {
    photos: Number,
    streams: Number,
    followers: Number,
    following: Number
  }
});

const User = module.exports = mongoose.model('user', userSchema);

// =============================================================================
// middleware
// =============================================================================

userSchema.pre('save', function(next) {
  this.lusername = this.username.toLowerCase();

  var self = this;
  async.parallel([
    function(callback) {
      User.findOne({ lusername: self.lusername }, function(err, user) {
        if (user) err = new Error('username not available');
        callback(err);
      });
    },
    function(callback) {
      User.findOne({ email: self.email}, function(err, user) {
        if (user) err = new Error('email already in use');
        callback(err);
      });
    }
  ], function(err) {
    next(err);
  });
});

userSchema.pre('remove', function(next) {
  Photo.find({user_id: this._id}, function(err, photos) {
    async.each(
      photos,
      function(photo, callback) {
        photo.remove(callback);
      },
      function(err) {
        next(err);
      }
    );
  });
});

// =============================================================================
// Validations
// =============================================================================

User.schema.path('username').validate(function(value) {
  return /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,29}$/.test(value);
}, 'Invalid username');

User.schema.path('password').validate(function(value) {
  return /(?=^.{8,20}$)(?=.*\d)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(value);
}, 'Invalid password');

User.schema.path('email').validate(function(value) {
  return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(value);
}, 'Invalid email');

