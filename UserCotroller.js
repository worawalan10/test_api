var mongoose    = require('mongoose');

//var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var User   = require('../models/user'); // get our mongoose model
var hash = require('../hash');

//exports.getUsers = function(req,res) {
//    User.find ((err,users) => {
//        if(err) throw err;
//        res.json(users);
//    });
// };

exports.getUsers = function(callback,limit) {
    User.find(callback).limit(limit);
};

exports.getUserById = function(uid, callback){
    User.find({id: uid}, callback);
};

exports.getUserByOId = function(req, res) {
    User.findById( req.params._id, (err, user) => {
    if(err) throw err;
    if(user && user.length != 0) // check a user is found
    res.json(user);
    else
    res.status(404).json({ // if not found, return
    success: false, // an error message
    message: 'user not found!'
        });
    });
};

exports.login = function(username, password, callback){
    //User.find({email: username}, callback);
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) throw err;
        if (!user) {
        res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.'
        });
        } else if(user) {
        var passwdData = hash.sha512(req.body.password, user.salt);
        if (user.passwdhash != passwdData.passwordHash) {
            return res.json({
            success: false,
            message: 'Authentication failed. Wrong password.' });
            } else {
            const payload = {
            id: user.id,
            email: user.email,
            admin: user.admin
            };
            var token = jwt.sign(payload, config.secret, {
                expiresIn: 86400 // expires in 24 hours
                });
                return res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
    } // end of else if(user)
}); // end of the callback function
};

exports.signup = function(req,res){
    var salt = hash.genRandomString(16);
    var pwd_data = hash.sha512(req.body.password, salt);
    User.find({}).sort({id: -1}).limit(1).exec( (err, users) => {
        if(err) throw err;
        if(users && users.length != 0) {
        var newUser = new User({
        id: users[0].id + 1, // users is an array of User objects
        name: req.body.name,
        age: parseInt(req.body.age),
        email: req.body.email,
        salt: pwd_data.salt,
        passwdhash: pwd_data.passwordHash,
        admin: req.body.admin?req.body.admin:false
        });
        newUser.save( function(err, user) {
            if(err) {
            return res.json({
            success: false,
            message: 'Unable to add new user!',
            });
            } 
            else {
            return res.json({
            success: true,
            message: 'New user has been created',
            user: {
            name: newUser.name,
            email: newUser.email,
            admin: newUser.admin
            }
        });
    }
});
        }
            else {
                res.json({
                success: false,
                message: 'User cannot be added!'
                });
            }
        });
    };
