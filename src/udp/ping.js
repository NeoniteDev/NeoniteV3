const udp = require('dgram');
const server = udp.createSocket('udp4');

server.on('error', function (error) {
    console.error('Error: ' + error);
});

server.on('message', function (msg, { port, address}) {
    server.send(msg, port, address);
});

server.bind(22222);