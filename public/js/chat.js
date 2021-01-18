//socket receive the data whatever coming from server
//socket helps us in receiving and sending events from client and server
const socket = io();

//socket.on('countUpdated', (count) => {
//    console.log('Updated Count!', count); 
//})

//Server (emit) ----> client (receive) ----> ackwnoledgement ----> server

//client (emit) ----> server (receive) ----> ackwnoledgement ----> client

//Elements
const $messageForm  = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationmessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    //height of last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight  = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight
    
    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scroll
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationMessage', (url) => {
    //console.log(url);
    const html =  Mustache.render(locationmessageTemplate, {
        //we can use shorthand syntax also by writing only url
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a'),
        username: url.username
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({ room, users }) => {
    //console.log(room);
    //console.log(users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.on('message', (message) => {
    //console.log(message);
    //mustache will take dynamic message and render into browser
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

$messageForm.addEventListener('submit', (e) => {
    //console.log('Clicked')
    e.preventDefault();
    //Disable submit button
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value;
    //Third argument is for acknowledgment from the server
    //which will be sent by the browser
    socket.emit('sendMessage', message, (error) => {
        //console.log(ack);
        //Enable submit button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        //console.log('Delivered');
    });
})

$sendLocationButton.addEventListener('click', () => {
    //navigator.geolocation us used to check weather browser is supporting 
    //location api or not
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by yourb browser');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    //position contains the info we want to share
    navigator.geolocation.getCurrentPosition((position) =>{
            //console.log(position)
            const {latitude, longitude} = position.coords;
            //console.log('Latitude: ', latitude);
            //console.log('Latitude: ', longitude);
            socket.emit('sendLocation', {
                latitude,
                longitude
            }, () => {
                //console.log('Location Shared!');
                $sendLocationButton.removeAttribute('disabled');
            })
            
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});