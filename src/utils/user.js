const Users = []

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate Data
    if (!username || !room)
        return {
            error: 'Username and room are required!'
        }

    const existingUser = Users.find((user) => {
        return user.room === room && user.username === username
    })

    //error
    if (existingUser)
        return {
            error: 'Username is in use'
        }

    //store user
    const user = { id, username, room }
    Users.push(user)
    return { user }
}

const removeUser = ((id) => {
    const index = Users.findIndex((user) => user.id === id)

    if (index !== -1)
        return Users.splice(index, 1)[0]
})

const getUser = (id) => {
    return Users.find((user) => user.id === id)
}


const getUsersInRoom = (room) => {
    return Users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}