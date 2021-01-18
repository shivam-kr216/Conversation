const express = require('express');
const path = require('path')
const socketio = require('socket.io');
const http = require('http');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

//Note: WebSocket are used for chat application
const app = express();
//If we don't write the below line express library will do it for implicitly
const server = http.createServer(app);
//
const io = socketio(server);

const port = process.env.PORT || 3000;
//console.log(__dirname);
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath))

//server (emit) ----> client (receive) ----> countUpdated
//client (emit) ----> server (receive) ----> increment

//let count = 0;

//Whenever a new connection come this will execute
//socket contains all the data of a new connection
io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    //socket.emit is used to send event to self
    //emit is used to send event
    //Second argument will be available for callback function
    //socket.emit('countUpdated', count);
    //socket.on('increment', () => {
    //    ++count;
        //It will emit the event for a particular connection
        //socket.emit('countUpdated', count);
        //io will emit the event for every connection
    //    io.emit('countUpdated', count);
    //})

    //socket.emit('message', generateMessage('Welcome!'));

    //when we broadcast the event we send the message to all in the connection except the 
    //latest who joined
    //socket.broadcast.emit('message', generateMessage('A new user has joined'));

    socket.on('join', ({username, room}, callback) => {
        //console.log(username, room);
        const {error, user} = addUser({id: socket.id, username, room});

        if(error) {
            return callback(error);
        }

        //Socket.join is used to join the chatroom which user want
        socket.join(user.room); 
        //io.to.emit is used to send the message to everyone in a particular room
        //socket.broadcast.to.emit is used to send the message to everyone
        //except self in a particular room
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback(); 
    })

    socket.on('sendMessage', (message, callback) => {
        //console.log(message);
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        //console.log(user)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, 'https://google.com/maps?q='+coords.latitude+','+coords.longitude));
        callback();
    })

    //Built-in event
    //when user leaves the browser
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });

})

server.listen(port, ()=>{
    console.log('Connected');
})