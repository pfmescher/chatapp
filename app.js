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
var bodyparser = require("body-parser");

server.listen(process.env.PORT || config.port);

//Express code
app.use("/bower", express.static(path.join(__dirname, "bower_components")));
app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/login", function (req, res, next) {
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.post("/login", bodyparser.urlencoded({extended: false}), function (req, res, next) {
    res.send(JSON.stringify({
        token: jwt.sign({"nickname": req.body.nickname}, config.secret, {expiresInMinutes: 720}),
        nickname: req.body.nickname
    }));
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.use(expressjwt({secret: config.secret}));

app.use(function (err, req, res, next) {
    if (err && err.name === "UnauthorizedError") {
        res.redirect("/login");
    } else {
        next();
    }
});


//socket.io code
io.use(socketioJwt.authorize({
    secret: config.secret,
    handshake: true
}));


io.on('connection', function (socket) {
    console.log("A user connected");

    clients.push(socket.id);

    socket.to("main").broadcast.emit("chat message", "main",
        (new Message("User connected", "system"))
    );

    socket.on("chat message", function (room, message) {
        message.owner = "other";
        socket.to(room).emit("chat message", room, message);
    });

    socket.on("change room", function (room) {
        socket.join(room);
        socket.emit("chat message", room,
            (new Message("You are now on the " + room + " room", "system")));
    });

    socket.on("disconnect", function () {
        socket.emit("chat message",
            (new Message("User disconnected", "system")).toJson()
        );
        console.log("A user disconnected");
    });
});