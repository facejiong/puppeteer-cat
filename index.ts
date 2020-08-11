import http from 'http';
import startServer from './server';

const port = Number(process.env.PORT) || 31303;

const server = http.createServer();

server.listen(port, '0.0.0.0');
server.on('listening', function() {
  startServer();
});
