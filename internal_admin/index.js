const http = require('http');

const server = http.createServer((req, res) => {
    res.end('<h1>List of all confidential information...</h1>');
});

server.listen(3001, () => {
    console.log("hidden admin panel was started at port 3001");
})