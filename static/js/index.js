var $chatWindow = jQuery(".chat-window"),
    messageTemplate = Handlebars.compile(jQuery("#message-template").text());

var socket = io.connect("http://localhost:8080", {
    query: "token=" + localStorage.getItem("token")
});

socket.emit("change room", "main");

jQuery(document.forms[0]).on("submit", function (e) {
    var message;
    var messageInput = e.target.message;
    var text = messageInput.value;

    e.preventDefault();
    e.stopPropagation();

    if (text.match(/^\/giphy/)) {
        $.getJSON("http://api.giphy.com/v1/stickers/random?api_key=dc6zaTOxFJmzC&tag=" + giphyEscape(text.split(" ").pop()),
            null,
            function (data) {
                callback("<img src='" + data.data.fixed_width_small_url + "'/>")
            });
    } else {
        callback(text);
    }

    function callback(text) {
        message = new Message(new Handlebars.SafeString(text), "own", localStorage.getItem("nickname"));

        messageInput.value = "";

        addMessage(message);

        socket.emit("chat message",localStorage.getItem('room'), message);
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

    if (room && room !== localStorage.getItem("room")) {
        localStorage.setItem("room", room);
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