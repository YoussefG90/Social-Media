"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = require("path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, path_1.resolve)("./config/.env.development") });
const Connections_1 = __importDefault(require("./DB/Connections"));
const modules_1 = require("./modules");
const error_response_1 = require("./utils/Response/error.response");
const chat_1 = require("./modules/chat");
const bootstrap = () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 5000;
    app.use(express_1.default.json(), (0, cors_1.default)(), (0, helmet_1.default)());
    (0, Connections_1.default)();
    app.use("/post", modules_1.postRouter);
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.userRouter);
    app.use("/chat", chat_1.chatRouter);
    app.get("/", (req, res) => {
        res.json({ message: `Wellcome To ${process.env.APP_NAME} App 🤍` });
    });
    app.use("{/*dummy}", (req, res) => {
        res.status(404).json({ message: "Error 404 Page Not Found 💀" });
    });
    app.use(error_response_1.globalErrorHandling);
    const httpServer = app.listen(port, () => {
        console.log(`Server is Running On Port :: ${port} ✔`);
    });
    (0, modules_1.initializeIo)(httpServer);
};
exports.default = bootstrap;
