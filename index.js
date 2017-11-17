var express = require('express');
var app = express();
var path = require('path');

var bodyParser = require('body-parser'); // handling HTML body
var morgan = require('morgan'); // logging
var mongoose = require('mongoose'); // Mongodb library

var mongojs = require('mongojs');
var db = mongojs('root:1234@ds031477.mlab.com:31477/users', ['users']);
var config = require('./config'); // global config

var port = process.env.PORT || config.port; // load port config
var hostname = config.hostname; // load hostname config
mongoose.connect(config.database); // setup mongoose
// use body parser so we can get info from POST and/or URL params

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));
/* setup view engine and directory */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function getNextSequence(name) {
    var ret = db.counter.findAndModify({
        query: {
            _id: name
        },
        update: {
            $inc: {
                seq: 1
            }
        },
        new: true,
        upsert: true
    });

    return ret.seq;
}

app.get('/', (req, res) => {

    db.users.find(function (err, docs) {
        if (err) {
            console.error(err);
            res.json({
                status: false
            });
        }
        res.render('index', {
            title: "Customer List:",
            users: docs // js object
        });
    });

});

app.get('/user', (req, res) => {
    db.users.find(function (err, docs) {
        if (err) {
            console.error(err);
            res.json({
                status: false
            });
        }
        res.json(docs);
    });
});

app.get('/user/:id', (req, res) => {
    var id = parseInt(req.params.id);
    db.users.findOne({
        id: id
    }, function (err, doc) {
        if (doc) {
            /* if found, return the document */
            res.json(doc);
        } else {
            /* if not, return custom error object */
            res.json({
                status: false
            });
        }
    });
});


app.post('/user', function (req, res) {
    db.users.count(function (err, num) {
        if (num != 0) {
            db.users.find().sort({
                id: -1
            }).limit(1).toArray(function (err1, num1) {
                db.users.insert({
                    "id": num1[0]['id'] + 1,
                    "name": req.body.name,
                    "age": parseInt(req.body.age),
                    "email": req.body.email
                }, function (err3, num3) {
                    db.users.find().toArray(function (err4, results) {
                        if (results.length == 0) {
                            res.json({
                                status: false
                            })
                        } else {
                            res.json(results);
                        }

                    });
                });

            });
        } else {
            db.users.insert({
                "id": 1,
                "name": req.body.name,
                "age": parseInt(req.body.age),
                "email": req.body.email
            }, function (err5, num5) {
                db.users.find().toArray(function (err2, results) {
                    if (results.length == 0) {
                        res.json({
                            status: false
                        })
                    } else {
                        res.render('index', {
                            title: "Customer List:",
                            users: results
                        });
                    }

                });
            });

        }
    });

});

app.put('/user/:id', (req, res) => {
    var editUser={
        id:parseInt(req.params.id),
        name:req.body.name,
        age:parseInt(req.body.age),
        email:req.body.email
    }
    db.users.update({"id":editUser.id},
    {
    "id":editUser.id,
    "name":editUser.name,
    "age":editUser.age,
    "email":editUser.email
});       
        db.users.find({ "id": editUser.id }).toArray(function (err, results) {
            if(results.length==0){
                res.json({status: false})
            }
            else{
                res.json({results});
            }
        });

});

app.delete('/user/:id', function (req, res) {
        db.users.remove({ id: req.params.id }, function (err, user) {
        if (err) {
            res.json({status: false})
        }else{
            res.json({status: "User are deleted!"});
        }
        
    });
});
           
app.listen(port, hostname, () => {
    console.log('Simple API started at http://localhost:' + port);
});