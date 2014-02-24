// ===========================================================================
// pixxo lib
// ===========================================================================

const
  Promise = require('bluebird');

module.exports = {
  authenticate: authenticate
};

// ===========================================================================
// implementation
// ===========================================================================

function authenticate(credentials, callback) {
  callback(null, { _id: 1, username: 'tony' });
}

