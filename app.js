var express = require('express');
var expressjwt = require("express-jwt");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('./config.json');
var path = require("path");
var clients = [];
var Message = require("./static/js/Message");
var jwt = require("jsonwebtoken");
var socketioJwt = require("socketio-jwt");

server.listen(config.port || 8080, "0.0.0.0");

//Express code
app.use("/bower", express.static(path.join(__dirname, "bower_components")));
app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/login", function (req, res, next) {
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.post("/login", function (req, res, next) {
    res.send(JSON.stringify({
        token: jwt.sign({"nickname": req.body.nickname}, config.secret, {expiresInMinutes: 720})
    }));
});

//app.use(expressjwt({secret: config.secret}));

app.use(function (err, req, res, next) {
    if (err && err.name === "UnauthorizedError") {
        req.redirect("/login");
    } else {
        next();
    }
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

//socket.io code
/*
io.use(socketioJwt.authorize({
    secret: config.secret,
    handshake: true
}));
*/

io.on('connection', function (socket) {
    console.log("A user connected");
    clients.push(socket.id);
    socket.join("main");
    socket.in("main").emit("chat message", (new Message("You are currently on the main room", "system", undefined)));

    socket.to("main").broadcast.emit("chat message",
        (new Message("User connected", "system"))
    );

    socket.on("chat message", function (room, message) {
        message.owner = "other";
        socket.broadcast.to(room).emit("chat message", message);
    });

    socket.on("change room", function (room) {
        socket.join(room);
        socket.to(room).emit("You are now on the " + room + " room");
    });

    socket.on("disconnect", function () {
        socket.emit("chat message",
            (new Message("User disconnected", "system")).toJson()
        );
        console.log("A user disconnected");
    });
});