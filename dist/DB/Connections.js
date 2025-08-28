"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_1 = __importDefault(require("./models/user"));
const connectDB = async () => {
    try {
        await (0, mongoose_1.connect)(process.env.URI);
        await user_1.default.syncIndexes();
        console.log("Successce To Connect DB ⚡");
    }
    catch (error) {
        console.error("Fail To Connect DB 💀", error.message ?? error);
    }
};
exports.default = connectDB;
