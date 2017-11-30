const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = {
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'UPDATE'],
    credentials: true
};
const uuidv4 = require('uuid/v4');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lab10', { useMongoClient: true });
mongoose.Promise = global.Promise;

const User = require('./user.js').model;
const Task = require('./task.js').model;

const port = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        res.status(400).send({
            errorCode: 'PARSE_ERROR',
            message: 'Arguments could not be parsed, make sure request is valid.'
        });
    } else {
        res.status(500).send('Something broke server-side.', error);
    }
});

app.get('/', function(req, res) {
    res.send('Welcome to Lab 4 API.');
});

app.post('/users', function(req, res) {
    const user = new User({
        id: uuidv4()
    });

    user.save(function(err) {
        if (!err) {
            res.status(200).send(user.toDTO());
        } else {
            res.status(500).send(err);
        }
    });
});

app.get('/:userId/tasks', function(req, res) {
    const userId = req.params.userId;

    ensureUserExist(userId, res, function() {
        Task.find({user: userId}, function (err, tasks) {
            if (!err) {
                res.status(200).send(JSON.stringify({'tasks': tasks.map(t => t.toDTO())}));
            } else {
                res.status(500).send(err);
            }
        });
    });
});

app.post('/:userId/tasks', function(req, res) {
    const userId = req.params.userId;

    ensureUserExist(userId, res, function() {
        ensureValidTask(req.body, res, function() {

            const task = {id: uuidv4(), name: req.body.name, user: userId};
            const dbTask = new Task(task);

            dbTask.save(function(err, dbTask) {
                if (!err) {
                    res.status(200).send(dbTask.toDTO());
                } else {
                    res.status(500).send(err);
                }
            });
        });
    });

});

app.put('/:userId/tasks/:taskId', function(req, res) {
    const taskId = req.params.taskId;
    const userId = req.params.userId;

    ensureUserExist(userId, res, function() {
        ensureValidTask(req.body, res, function() {
            Task.find({id: taskId}, function (err, tasks) {
                if (!err && tasks.length === 1) {
                    tasks[0].name = req.body.name;
                    tasks[0].save(function(err, task) {
                        if (!err) {
                            res.status(200).send(task.toDTO());
                        } else {
                            res.status(500).send(err);
                        }
                    })
                } else {
                    res.status(500).send(err);
                }
            });
        });
    });
});

app.delete('/:userId/tasks/:taskId', function(req, res) {
    const taskId = req.params.taskId;
    const userId = req.params.userId;

    ensureUserExist(userId, res, function() {
        Task.deleteOne({id: taskId}, function (err) {
            if (!err) {
                res.sendStatus(204);
            } else {
                res.status(500).send(err);
            }
        });
    });
});

app.listen(port, function() {
    console.log('Server listening.')
});

function ensureValidTask(task, res, callback) {
    if (task.name === undefined || task.name === '') {
        return res.status(400).send('Task definition is invalid.');
    }

    callback();
}

function ensureUserExist(userId, res, callback) {
    User.find({id: userId}, function (err, users) {
        if (!err) {
            if (users) {
                callback();
            } else {
                res.status(400).send('User with id \'' + userId + '\' doesn\'t exist.');
            }
        } else {
           res.status(500).send(err);
        }
    });
}