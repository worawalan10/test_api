var express = require('express');
var bodyParser = require('body-parser');

var path = require('path');

// var data = require('./users.js') // ไม่ระบุ .js ก็ได้

var bodyParser = require('body-parser'); // handling HTML body
var morgan = require('morgan'); // logging
var mongoose = require('mongoose'); // Mongodb library

var mongojs = require('mongojs');
/* get access to ‘users’ collection in ‘mydb’ database*/
// var db = mongojs('users', ['users']);
var db = mongojs('root:1234@ds031477.mlab.com:31477/users', ['users']);
var config = require('./config'); // global config

function getNextSequence(name) {
   var ret = db.counters.findAndModify(
          {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
}


var app = express(); //create instant waiting for request

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    // res.send('Root URL'); // ignore
    res.render('index', {
        title: "Customer List:",
        users: db.users // js object
    });

});

app.get('/user', (req, res) => {
    res.json(data.users);
});

app.post('/user/add', function (req, res) {
    var newUser = {
        _id: getNextSequence("id"),
        name: req.body.name,
        age: parseInt(req.body.age),
        email: req.body.email
    }
    console.log(newUser);
    data.users.push(newUser);
    res.render('index', { // redirect to ‘/’
        title: 'Customer List',
        users: data.users
    });
});

app.get('/sotus', function (req, res) {
    res.send('Hello from GET World..');
});

app.post('/sotus', function (req, res) {
    res.send('Hello from POST World..');
});

app.listen(3000, function () {
    console.log('Server Started on Port 3000...');
});