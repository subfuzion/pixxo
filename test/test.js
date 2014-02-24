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

  /*
  pixxodb.connectAsync(url).then(function() {
    console.log('connected to ' + url);
    done();
  }).catch(function(err) {
    done(err);
  });
  */

  pixxodb.connect(url, function(err) {
    if (!err) console.log('connected to ' + url);
    done(err);
  })
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

  describe('user tests', function() {
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
  });

  describe('photo tests', function() {
    var username = 'testuser';
    var user;
    var photos = [];

    before(function(done) {
      user = new pixxodb.User({
        username: username,
        email: util.format('%s@pixxo.com', username),
        password: 'Password1!'
      });

      user.save(function(err) {
        if (!err) users.push(user);
        done(err);
      });
    });

    it('should not save a photo without a user id', function(done) {
      var photo = new pixxodb.Photo;

      photo.save(function(err) {
        assert(err);
        done();
      });
    });

    it('should save a photo', function(done) {
      var photo = new pixxodb.Photo({
        user_id: user._id
      });

      photo.save(function(err) {
        photos.push(photo);
        done(err);
      });
    });

    it('should delete all the user photos when deleting a user', function(done) {
      /* promises don't actually make things more readable ...
      var $user = Promise.promisifyAll(user);
      var $Photo = Promise.promisifyAll(pixxodb.Photo);

      $user.removeAsync().then(function() {
        $Photo.findOneAsync({ _id: photos[0]._id }).then(function(photo) {
          assert(!photo);
          done();
        }).catch(function(err) {
          done(err);
        });
      }).catch(function(err) {
        done(err);
      });
      */

      user.remove(function(err) {
        if (err) return done(err);

        pixxodb.Photo.findOne({ _id: photos[0]._id }, function(err, photo) {
          assert(!photo);
          done(err);
        });
      });
    });

  });
});


