const generateMessage = (username, text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username: username
    }
}

const generateLocationMessage = (username, url) => {
        return {
            url,
            createdAt: new Date().getTime(),
            username: username
        }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}