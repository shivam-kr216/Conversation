const users = [];

//addUser, removeUser, getUser, getUsers

const addUser = ({ id, username, room }) => {
    //Cleaning data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }
    //check exixting user
    const existingUSer = users.find((user) => {
        return user.room === room && user.username === username
    })
    //Validate username
    if(existingUSer){
        return{
            error: 'Username is in use!'
        }
    }

    const user = { id, username, room };
    users.push(user);
    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index != -1){
        return users.splice(index,1)[0];
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })
    return user;
}

const getUsersInRoom = (room) => {
    const userDetails = users.filter((user) => {
        return user.room === room
    })
    return userDetails;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}