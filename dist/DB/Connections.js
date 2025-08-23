"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        if (!process.env.URI) {
            throw new Error("URI is not defined");
        }
        const uri = process.env.URI;
        await mongoose_1.default.connect(uri);
        console.log("Successce To Connect DB ⚡");
    }
    catch (error) {
        console.error("Fail To Connect DB 💀", error.message ?? error);
    }
};
exports.default = connectDB;
