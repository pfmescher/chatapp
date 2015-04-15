var express = require('express');
var expressjwt = require("express-jwt");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('./config.json');
var path = require("path");
var clients = {};
var rooms = {
    main: []
};
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

app.post("/login", bodyparser.urlencoded({extended: false}), function (req, res) {
    res.send(JSON.stringify({
        token: jwt.sign({"nickname": req.body.nickname}, config.secret, {expiresInMinutes: 720}),
        nickname: req.body.nickname
    }));
});

app.post("/register", bodyparser.urlencoded({extended: false}), function (req, res) {

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
    var userAdded = false;
    socket.room = "main";

    socket.emit("chat message", new Message("To join a new room type /join " +
    "<roomname>. To insert a gif type /giphy <keyword>", "system"));

    socket.on("add user", function (nickname) {
        socket.nickname = nickname;
        if (!userAdded && !clients[nickname]) {
            clients[nickname] = socket.id;
            rooms[socket.room].push(nickname);
            userAdded = true;
        }
    });

    socket.to(socket.room).broadcast.emit("chat message", (new Message("User connected", "system")));

    socket.on("chat message", function (message) {
        //set owner to "other" for styling purposes
        message.owner = "other";

        //broadcast message to the room i'm on
        socket.to(socket.room).emit("chat message", message);
    });

    socket.on("change room", function (room) {

        //remove myself from the previous room
        socket.leave(socket.room);
        rooms[socket.room] = rooms[socket.room].filter(function (nickname) {
            return nickname !== socket.nickname;
        });

        //join new room
        socket.join(room);
        socket.room = room;
        if (!rooms[socket.room]) {
            rooms[socket.room] = [];
        }
        rooms[socket.room].push(socket.nickname);

        //notify the client
        socket.emit("chat message", new Message("You are now on the " + room + " room", "system"));
        socket.emit("room changed", room, rooms[socket.room]);

        //notify the OTHER clients
        socket.to(socket.room).emit("room changed", room, rooms[socket.room]);
    });

    socket.on("disconnect", function () {
        //clean up
        delete clients[socket.nickname];
        rooms[socket.room] = rooms[socket.room].filter(function (nickname) {
            return nickname !== socket.nickname;
        });

        //notify clients
        socket.to(socket.room).emit("chat message",
            new Message("User disconnected", "system")
        );
    });
});