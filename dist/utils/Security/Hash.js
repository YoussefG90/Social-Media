"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcryptjs_1 = require("bcryptjs");
const generateHash = async ({ plaintext, salt }) => {
    const saltRounds = salt ? parseInt(salt) : parseInt(process.env.SALT || "12");
    return await (0, bcryptjs_1.hash)(plaintext, saltRounds);
};
exports.generateHash = generateHash;
const compareHash = async ({ plaintext, value }) => {
    return await (0, bcryptjs_1.compare)(plaintext, value);
};
exports.compareHash = compareHash;
