const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')

const mongoose = require('mongoose')

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

//DB connection
mongoose.connect('mongodb://localhost/chat-database')
    .then(db => {
        console.log('db is connected');
    })
    .catch(err => {
        console.log(err);
    })

//Config
app.set("port", process.env.PORT || 4000);

require('./sockets')(io);



//Static files
app.use(express.static(path.join(__dirname, 'public')));

//Start
server.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});