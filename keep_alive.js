const express = require('express');
const server = express();

server.all('/', (req, res) => {
  res.send('Bot đang hoạt động!');
});

function keepAlive() {
  server.listen(3000, () => {
    console.log("Server đã hoạt động!");
  });
}

module.exports = keepAlive;
