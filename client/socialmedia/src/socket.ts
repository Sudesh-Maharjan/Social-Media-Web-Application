import {io} from 'socket.io-client';

//make connection on the server for this line io()
const socket = io('http://localhost:9000');
const userId = localStorage.getItem("userId");
console.log("User Id localstorage:", userId)
socket.on('connect', () => {
   console.log('Connected to socket.io server', socket.id);
   socket.emit('storeSocketId', userId);
});

socket.on('disconnect', (reason) => {
   console.log(`Disconnected from socket.io server: ${reason}`);
});

export default socket;