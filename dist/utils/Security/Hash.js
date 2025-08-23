"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateHash = async ({ plaintext, salt }) => {
    const saltRounds = salt ? parseInt(salt) : parseInt(process.env.SALT || "12");
    return bcryptjs_1.default.hashSync(plaintext, saltRounds);
};
exports.generateHash = generateHash;
const compareHash = async ({ plaintext, value }) => {
    return bcryptjs_1.default.compareSync(plaintext, value);
};
exports.compareHash = compareHash;
