import {io} from 'socket.io-client';

//make connection on the server for this line io()
const socket = io('http://localhost:9000');
socket.on('connect', () => {
   console.log('Connected to socket.io server');
});

socket.on('disconnect', (reason) => {
   console.log(`Disconnected from socket.io server: ${reason}`);
});

socket.on('connect_error', (error) => {
   console.error('Socket connection error:', error.message);
});
export default socket;