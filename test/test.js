// ===========================================================================
// test
// ===========================================================================

const
  assert = require('assert'),
  nconf = require('nconf'),
  util = require('util'),
  async = require('async'),
  Promise = require('bluebird'),
  pixxodb = Promise.promisifyAll(require('../lib/db'));

// everything saved here is stuff to clean up after tests
// users, photos, etc.
const
  users = [];

nconf
  .argv()
  .env()
  .file('../config.json');

before(function(done) {
  var db = nconf.get('db');
  assert(db.host && db.port && db.name);
  var url = util.format("mongodb://%s:%s/%s", db.host, db.port, db.name);

  pixxodb.connectAsync(url).then(function(err, res) {
    if (!err) console.log('connected to ' + url);
    done(err);
  });
});

after(function(done) {
  removeUsers(done);
});

function removeUsers(done) {
  async.eachSeries(
    users,
    function(user, callback) {
      user.remove(callback);
    },
    function(err) {
      done(err);
    }
  );
}

// ===========================================================================
// database tests
// ===========================================================================

describe('database tests', function() {

  it('should not create a user without required properties', function(done) {
    var badusers = [
      // missing email and password
      {
        username: 'testuser'
      },
      // missing username and password
      {
        email: 'testuser@test.com'
      },
      // missing username and email
      {
        password: 'Password1!'
      },
      // missing password
      {
        username: 'testuser',
        email: 'testuser@test.com'
      },
      // missing email
      {
        username: 'testuser',
        password: 'Password1!'
      },
      // missing username
      {
        email: 'testuser@test.com',
        password: 'Password1!'
      }
    ];

    async.each(
      badusers,
      function(bad, callback) {
        var user = new pixxodb.User({
          username: bad.username,
          email: bad.email,
          password: bad.password
        });

        user.save(function(err) {
          if (!err) {
            users.push(user);
            return callback('expected error for invalid user: ' + user.username);
          }
          return callback();
        });
      },
      function(err) {
        done(err);
      }
    );
  });

  it('should not create users with invalid usernames', function(done) {
    var badnames = [
      {
        email: 'testuser@test.com',
        password: 'Password1!'
      },
      {
        username: null,
        email: 'testuser@test.com',
        password: 'Password1!'
      },
      {
        username: '',
        email: 'testuser@test.com',
        password: 'Password1!'
      },
      {
        username: 'testuser@', // only alphanumeric characters and hyphen
        email: 'testuser@test.com',
        password: 'Password1!'
      },
      {
        username: '-testuser', // must lead with alphanumeric
        email: 'testuser@test.com',
        password: 'Password1!'
      },
      {
        username: '1234567890123456789012345678901', // max length 30, actual 31
        email: 'testuser@test.com',
        password: 'Password1!'
      }
    ];

    async.each(
      badnames,
      function(bad, callback) {
        var user = new pixxodb.User({
          username: bad.username,
          email: bad.email,
          password: bad.password
        });

        user.save(function(err) {
          if (!err) {
            users.push(user);
            return callback('expected "Invalid username" for user: ' + user.username);
          }
          return callback();
        });
      },
      function(err) {
        done(err);
      }
    );
  });

  it('should not create users with usernames that only differ in case', function(done) {
    var badnames = [
      {
        username: 'testuser', // only alphanumeric characters and hyphen
        email: 'testuser1@test.com',
        password: 'Password1!'
      },
      {
        username: 'testUser', // must lead with alphanumeric
        email: 'testuser2@test.com',
        password: 'Password1!'
      }
    ];

    var count = 0;

    async.eachSeries(
      badnames,
      function(bad, callback) {
        var user = new pixxodb.User({
          username: bad.username,
          email: bad.email,
          password: bad.password
        });

        user.save(function(err) {
          count++;

          if (count == 1) {
            // should not have an error for 1st user
            if (!err) {
              // make sure to remove
              users.push(user);
            }
            return callback(err);
          }

          if (count == 2) {
            if (err) {
              // the error was expected
              return callback();
            }

            // expected an error for second user
            // make sure to remove
            users.push(user);
            return callback(new Error('expected username already taken error" for user: ' + user.username));
          }
        });
      },
      function(err) {
        removeUsers(function(removeErr) {
          if (err) console.log(removeErr);
          done(err);
        });
      }
    );
  });

  it('should not create users with the same email', function(done) {
    var badusers = [
      {
        username: 'testuser1',
        email: 'testuser@test.com',
        password: 'Password1!'
      },
      {
        username: 'testuser2',
        email: 'testuser@test.com',
        password: 'Password1!'
      }
    ];

    var count = 0;

    async.eachSeries(
      badusers,
      function(bad, callback) {
        var user = new pixxodb.User({
          username: bad.username,
          email: bad.email,
          password: bad.password
        });

        user.save(function(err) {
          count++;

          if (count == 1) {
            // should not have an error for 1st user
            if (!err) {
              // make sure to remove
              users.push(user);
            }
            return callback(err);
          }

          if (count == 2) {
            if (err) {
              // the error was expected
              return callback();
            }

            // expected an error for second user
            // make sure to remove
            users.push(user);
            return callback(new Error('expected email already used error" for user: ' + user.username));
          }
        });
      },
      function(err) {
        removeUsers(function(removeErr) {
          if (err) console.log(removeErr);
          done(err);
        });
      }
    );
  });

  it('should create users with valid usernames', function(done) {
    var badnames = [
      {
        username: 'a',
        email: 'a@test.com',
        password: 'Password1!'
      },
      {
        username: '1',
        email: '1@test.com',
        password: 'Password1!'
      },
      {
        username: 'TestUser-1',
        email: 'TestUser-1@test.com',
        password: 'Password1!'
      },
      {
        username: 'TestUser--1',
        email: 'TestUser--1@test.com',
        password: 'Password1!'
      },
      {
        username: 'Test-User-1-',
        email: 'Test-User-1-@test.com',
        password: 'Password1!'
      }
    ];

    async.eachSeries(
      badnames,
      function(bad, callback) {
        var user = new pixxodb.User({
          username: bad.username,
          email: bad.email,
          password: bad.password
        });

        user.save(function(err) {
          if (!err) {
            users.push(user);
          } else {
            err = new Error(util.format('Error: username=%s, %s', user.username, err.message));
          }
          return callback(err);
        });
      },
      function(err) {
        removeUsers(function(removeErr) {
          if (err) console.log(removeErr);
          done(err);
        });
      }
    );
  });

  // don't delete the user at the end of this test
  // leave user for subsequent tests
  it('should create a new user', function(done) {
    var username = 'testuser';

    var user = new pixxodb.User({
      username: username,
      email: util.format('%s@pixxo.com', username),
      password: 'Password1!'
    });

    user.save(function(err) {
      if (!err) users.push(user);
      done(err);
    });
  });

});


