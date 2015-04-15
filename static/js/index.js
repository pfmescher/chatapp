var $chatWindow = jQuery(".chat-window"),
    messageTemplate = Handlebars.compile(jQuery("#message-template").text());

var socket = io.connect("http://localhost:8080", {
    query: "token=" + sessionStorage.getItem("token") + "&nickame=" + sessionStorage.getItem("nickname")
});

socket.on("error", function(error) {
    if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
        location.pathname = "/login";
    }
});

socket.emit("change room", "main");

jQuery(document.forms[0]).on("submit", function (e) {
    var message;
    var messageInput = e.target.message;
    var text = messageInput.value;
    var match;

    e.preventDefault();
    e.stopPropagation();

    if (match = text.match(/\/giphy ([\w\d ]+)/)) {
        $.getJSON("http://api.giphy.com/v1/stickers/random?api_key=dc6zaTOxFJmzC&tag=" + giphyEscape(match[1]),
            null,
            function (data) {
                if (data.data.fixed_width_small_url) {
                    callback(new Message(new Handlebars.SafeString("<img src='" + data.data.fixed_height_small_url + 
                        "' height='" + data.data.fixed_height_small_height + "'/>"), "own", sessionStorage.getItem("nickname")));
                } else {
                    addMessage(new Message("No image found for keyword " + match[1], "system"));
                }
            });
    } else {
        callback(new Message(text, "own", sessionStorage.getItem("nickname")));
    }

    function callback(message) {

        messageInput.value = "";
        addMessage(message);
        socket.emit("chat message", sessionStorage.getItem('room'), message);
    }
});

function giphyEscape(text) {
    return encodeURIComponent(jQuery.trim(text).replace(" ", "-"));
}

socket.on("chat message", function (room, m) {
    if (typeof m.message == "string") {
        m = new Message(m.message, m.owner, m.nickname);
    } else if (typeof m.message == "object") {
        m = new Message(new Handlebars.SafeString(m.message.string), m.owner, m.nickname);
    }

    if (room && room !== sessionStorage.getItem("room")) {
        sessionStorage.setItem("room", room);
    }
    addMessage(m);
});

function addMessage(message) {
    if (!message.nickname) {
        message.nickname = message.owner[0].toUpperCase() + message.owner.substring(1);
    }
    var messageElem = jQuery(messageTemplate(message));

    $chatWindow.append(messageElem);
    $chatWindow.scrollTop($chatWindow.position().top + messageElem.position().top);
}

function changeRoom(room) {
    $chatWindow.html("");
    socket.emit("change room", room);
}