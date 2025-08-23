"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecryption = exports.generateEncryption = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const generateEncryption = ({ plaintext, secrtkey = process.env.ENCRYPTIONKEY }) => {
    return crypto_js_1.default.AES.encrypt(plaintext, secrtkey).toString();
};
exports.generateEncryption = generateEncryption;
const generateDecryption = ({ ciphertext, secrtkey = process.env.ENCRYPTIONKEY }) => {
    return crypto_js_1.default.AES.decrypt(ciphertext, secrtkey).toString(crypto_js_1.default.enc.Utf8);
};
exports.generateDecryption = generateDecryption;
