const generateMessage = (text, username) => {
    return {
        username,
        text,
        createdAT: new Date().getTime()
    }
}

const generateURL = (url, username) => {
    return {
        username,
        url,
        createdAT: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateURL
}