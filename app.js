var express = require('express');
var expressjwt = require("express-jwt");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('./config.json');
var path = require("path");
var clients = {};
var Message = require("./static/js/Message");

server.listen(config.port || 8080);

//Express code
app.use("/bower", express.static(path.join(__dirname, "bower_components")));
app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/login", function (req, res, next) {
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.post("/login", function (req, res, next) {

});


//app.use('/', expressjwt({secret: "123456789"}));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

//socket.io code
io.on('connection', function (socket) {
    console.log("A user connected");
    socket.emit("chat message", (new Message("You are currently on the main room", "system")));

    socket.broadcast.emit("chat message",
        (new Message("User connected", "system"))
    );

    socket.on("chat message", function (message) {
        message.owner = "other";
        socket.broadcast.emit("chat message", message);
        console.log(message);
    });

    socket.on("disconnect", function () {
        socket.emit("chat message",
            (new Message("User disconnected", "system")).toJson()
        );
        console.log("A user disconnected");
    });
});