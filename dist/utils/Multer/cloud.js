"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFiles = exports.fileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
exports.fileValidation = {
    Image: ["image/jpeg", "image/png", "image/webp"],
    document: ["application/pdf", "application/msword"],
    video: ["video/mp4", "video/x-msvideo", "video/x-ms-wmv"],
    audio: ["audio/mpeg", "audio/mp3", "audio/ogg"]
};
const cloudFiles = ({ validation = [] } = {}) => {
    const storage = multer_1.default.diskStorage({});
    const fileFilter = function (req, file, callback) {
        if (validation.includes(file.mimetype)) {
            return callback(null, true);
        }
        return callback(new Error("In-Valid File Format"), false);
    };
    return (0, multer_1.default)({ fileFilter, storage });
};
exports.cloudFiles = cloudFiles;
