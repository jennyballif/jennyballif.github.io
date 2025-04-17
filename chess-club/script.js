// frontend/script.js

// Connect to the backend server
// Make sure this URL matches where your backend is running
// Use 'http://localhost:3000' for local testing
// Later, change this to your Render backend URL for deployment
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// --- More client-side handlers will go here ---

// Example: Listening for an event from the server
// socket.on('some_event', (data) => {
//     console.log('Received data:', data);
//     // Update the UI based on data
// });

// Example: Sending an event to the server
// function sendSomething() {
//     const dataToSend = { message: "Hello from client!" };
//     socket.emit('client_event', dataToSend);
//     console.log('Sent data:', dataToSend);
// }