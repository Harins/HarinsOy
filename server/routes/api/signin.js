const User = require('../../models/User');
const UserSession = require('../../models/UserSession');
const validator = require("email-validator");

module.exports = (app) => {
  /*
   * Sign up
   */
  app.post('/api/account/signup', (req, res, next) => {
    const {
      body
    } = req;
    console.log('body', body);
    const {
      firstName,
      lastName,
      password
    } = body;

    let {
      email
    } = body;

    if (!firstName) {
      return res.send({
        success: false,
        message: 'Error: First name cannot be blank.'
      });
    }
    if (!lastName) {
      return res.send({
        success: false,
        message: 'Error: Last name cannot be blank.'
      });
    }
    if (!email || !validator.validate(email)) {
      return res.send({
        success: false,
        message: 'Error: Email address cannot be blank or incorrect.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be empty.'
      });
    }
    console.log('here');

    email = email.toLowerCase();

    //Steps:
    //1. Verify email doesn't exist
    //2. Save
    User.find({
      email: email
    }, (err, previousUsers) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      } else if (previousUsers.length > 0) {
        return res.send({
          success: false,
          message: 'Account already exist.'
        });
      }
    });

    //Save the new User
    const newUser = new User();
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;
    newUser.password = newUser.generateHash(password);
    newUser.save((err, user) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Account already exist.'
        });
      }
      return res.send({
        success: true,
        message: 'Signed up'
      });
    });
  });

  /*
   * Sign in
   */
  app.post('/api/account/signin', (req, res, next) => {
    const {
      body
    } = req;
    const {
      password
    } = body;
    let {
      email
    } = body;

    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email address cannot be blank.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be empty.'
      });
    }

    email = email.toLowerCase();

    User.find({
        email: email
      },
      (err, users) => {
        if (err) {
          console.log('err 2:', err);
          return res.send({
            success: false,
            message: 'Error: server error'
          });
        }
        if (users.length != 1) {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });
        }

        const user = users[0];
        if (!user.validPassword(password)) {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });
        }

        //Other user is valid
        const userSession = new UserSession();
        userSession.userId = user._id;
        userSession.save((err, doc) => {
          if (err) {
            console.log('err 3:', err);
            return res.send({
              success: false,
              message: 'Error: server error'
            });
          }
          return res.send({
            success: true,
            message: 'Valid sign in',
            token: doc._id
          });
        });
      });
  });

  /*
   * Verify
   */
  app.get('/api/account/verify', (req, res, next) => {
    //Get the token
    const {
      query
    } = req;
    const {
      token
    } = query;
    // ?token=test

    //Verify the tokken is one of a kind and it's not deleted
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      } else {
        // DO ACTION
        return res.send({
          success: true,
          message: 'Good'
        });
      }
    });
  });

  /*
   * Logout
   */
  app.get('/api/account/logout', (req, res, next) => {
    //Get the token
    const {
      query
    } = req;
    const {
      token
    } = query;
    // ?token=test

    //Verify the tokken is one of a kind and it's not deleted
    UserSession.findOneAndUpdate({
      _id: token,
      isDeleted: false
    }, {
      $set: {
        isDeleted: true
      }
    }, null, (err, sessions) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      return res.send({
        success: true,
        message: 'Good'
      });
    });
  });
};
