function Message(message, owner, nickname) {
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