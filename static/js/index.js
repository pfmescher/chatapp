var $chatWindow = jQuery(".chat-window"),
    messageTemplate = Handlebars.compile(jQuery("#message-template").text());

var socket = io.connect("http://localhost:8080", {
    query: "token=" + localStorage.getItem("token")
});

jQuery(document.forms[0]).on("submit", function (e) {
    var message;
    var messageInput = e.target.message;
    var text = messageInput.value;

    e.preventDefault();
    e.stopPropagation();

    if (text.indexOf("/giphy") !== -1) {
        text = "<img src='" + text.split(" ").pop() + "' height='150'/>";
    }
    message = new Message(new Handlebars.SafeString(text), "own", localStorage.getItem("nickname"));

    messageInput.value = "";

    addMessage(message);

    socket.emit("chat message",localStorage.getItem('room'), message);
});

socket.on("chat message", function (m) {
    if (typeof m.message == "string") {
        m = new Message(m.message, m.owner, m.nickname, m.room);
    } else if (typeof m.message == "object") {
        m = new Message(new Handlebars.SafeString(m.message.string), m.owner, m.nickname, m.room);
    }

    if (m.room && m.room !== localStorage.getItem("room")) {
        localStorage.setItem("room", m.room);
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