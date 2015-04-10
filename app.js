var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('./config.json');
var path = require("path");
var clients = {};

function Message(message, owner, nickname) {
    this.message = message;
    this.owner = owner;
    this.nickname = nickname;
}

Message.prototype.toJson = function () {
    return JSON.stringify(this);
};

server.listen(8080);

app.use("/bower", express.static(path.join(__dirname, "bower_components")));
app.use("/static", express.static(path.join(__dirname, "static")));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function (socket) {
    console.log("A user connected");
    socket.emit("chat message", (new Message("You are currently on the main room", "system", "System")));

    socket.emit("chat message",
        (new Message("User connected", "system", "system"))
    );

    socket.on("chat message", function (message) {
        message.owner = "other";
        socket.broadcast.emit("chat message", message);
    });

    socket.on("disconnect", function () {
        socket.emit("chat message",
            (new Message("User disconnected", "system", "system")).toJson()
        );
        console.log("A user disconnected");
    });
});
