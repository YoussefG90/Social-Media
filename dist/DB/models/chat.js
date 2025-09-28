"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    content: { type: String, minlength: 2, maxlength: 500000, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true
});
const chatSchema = new mongoose_1.Schema({
    group: { type: String },
    group_image: { secure_url: { type: String }, public_id: { type: String } },
    particpants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    roomId: { type: String, required: function () { return this.roomId; } },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [messageSchema],
}, {
    timestamps: true,
});
exports.ChatModel = mongoose_1.models.chat || (0, mongoose_1.model)("chat", chatSchema);
