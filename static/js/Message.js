function Message(message, owner, nickname, room) {
    this.message = message;
    this.owner = owner;
    this.nickname = nickname;
}

Message.prototype.toJson = function () {
    return JSON.stringify(this);
};

if (typeof module !== "undefined") {
    module.exports = Message;
}