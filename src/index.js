const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateURL } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Define paths for express
const port = process.env.PORT
const pwd = path.join(__dirname, '../public')

//Set up static pwd to server
app.use(express.json())
app.use(express.static(pwd))

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome !', "Admin"))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, user.username))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('userMSG', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            io.to(user.room).emit('message', generateMessage(`Profanity is not allowed ${user.username}!`, "Admin"))
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(msg, user.username))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateURL(`https://google.com/maps?=${coords.latitude},${coords.longitude}`, user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, user.username))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})
server.listen(port, () => {
    console.log(`Server is on port ${port}`)
})