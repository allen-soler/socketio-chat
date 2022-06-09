const socket = io()

//Elements

const form = document.getElementById('msg')
const messageForm = form.querySelector('input')
const messageFormButton = form.querySelector('button')
const locationBTN = document.getElementById('send-location')
const messages = document.getElementById('messages')
    //template
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-message').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML
    //Query
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageH = newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = messages.offsetHeight

    // Height of message container
    const containerHeight = messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageH <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        message: message.url,
        createdAT: moment(message.createdAT).format('hh:mm:ss'),
        username: message.username
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAT: moment(message.createdAT).format('hh:mm:ss'),
        username: message.username
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    })
    document.getElementById('sidebar').innerHTML = html
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    //disable
    messageFormButton.setAttribute('disabled', 'disabled')

    let msg = e.target.elements.message.value

    socket.emit('userMSG', msg, (error) => {
        //enable 
        messageFormButton.removeAttribute('disabled')
        messageForm.value = ''
        messageForm.focus()
        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

locationBTN.addEventListener('click', () => {
    locationBTN.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        locationBTN.removeAttribute('disabled')
        return alert('Your browser is too old.')
    }
    //disable 
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Your location has been shared !')
            locationBTN.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})