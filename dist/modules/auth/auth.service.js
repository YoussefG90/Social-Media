"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateotp = void 0;
const user_1 = __importDefault(require("../../DB/models/user"));
const error_response_1 = require("../../utils/Response/error.response");
const nanoid_1 = require("nanoid");
const Hash_1 = require("../../utils/Security/Hash");
const Encryption_1 = require("../../utils/Security/Encryption");
const DBservices = __importStar(require("../../DB/DBservices"));
const email_1 = require("../../utils/Events/email");
const Token_1 = require("../../utils/Security/Token/Token");
exports.generateotp = (0, nanoid_1.customAlphabet)('0123456789', 6);
class AuthenticationService {
    constructor() { }
    signup = async (req, res) => {
        const otp = (0, exports.generateotp)();
        const { firstName, lastName, email, password, phone, gender, age } = req.body;
        const checkuser = await DBservices.findOne({ model: user_1.default, filter: { email } });
        if (checkuser) {
            throw new error_response_1.conflict("Email Exist", 409);
        }
        const hashPassword = await (0, Hash_1.generateHash)({ plaintext: password });
        const encryptOTP = await (0, Hash_1.generateHash)({ plaintext: otp });
        const encryptePhone = await (0, Encryption_1.generateEncryption)({ plaintext: phone });
        const user = await DBservices.create({ model: user_1.default, data: { firstName, lastName, email,
                password: hashPassword, phone: encryptePhone, age, gender, emailOTP: encryptOTP,
                emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000) } });
        email_1.emailEvent.emit("Confirm Email", { to: email, otp });
        res.status(201).json({ message: "Account Created Check Your Email To Verify", user });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await DBservices.findOne({ model: user_1.default, filter: { email, deletedAt: { $exists: false } } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        const checkOtp = await DBservices.findOne({ model: user_1.default, filter: { confirmEmail: true } });
        if (!checkOtp) {
            throw new error_response_1.BadRequest("Email Not Confirmed");
        }
        const checkpassword = await (0, Hash_1.compareHash)({ plaintext: password, value: user.password });
        if (!checkpassword) {
            throw new error_response_1.BadRequest("InVaild Login Data");
        }
        const Tokens = await (0, Token_1.generateNewTokens)({ user });
        return res.status(200).json({ message: "Done", Tokens });
    };
}
exports.default = new AuthenticationService();
