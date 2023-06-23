const socket=io()
const input = document.querySelector('.input')
const form =document.querySelector('form')
const locationButton = document.querySelector('#location')
const messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const sidebar = document.querySelector('#sidebar')


const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll =()=>{
  // New message element
  const $newMessage = messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = messages.offsetHeight

  // Height of messages container
  const containerHeight = messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      messages.scrollTop = messages.scrollHeight
  }
}
socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

form.addEventListener('submit',(e)=>{
       e.preventDefault()
       socket.emit('sendMessage',form.message.value.trim(),(err)=>{
        input.focus()
        if(err){
            return console.log(err)
        }
        console.log('message delivered')
       })
   

       form.reset()
})
socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        message:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({room,users})=>{
   const html = Mustache.render(sidebarTemplate,{
    room,
    users
   })
   sidebar.innerHTML = html
})
locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation.getCurrentPosition){
        return alert('Geolocation is not supported by your browser')
    }
    locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{latitude:position.coords.latitude,longitude:position.coords.longitude},(auth)=>{
            locationButton.removeAttribute('disabled')
            console.log(auth)
        })
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})