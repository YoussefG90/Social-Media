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
exports.generateNewTokens = exports.decodedToken = exports.getSignature = exports.verfiyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DBservices = __importStar(require("../../../DB/DBservices"));
const Token_Types_1 = require("./Token.Types");
const user_1 = __importStar(require("../../../DB/models/user"));
const error_response_1 = require("../../Response/error.response");
const generateToken = ({ payload = {}, signature = process.env.ACCESS_TOKEN_USER_SECRET, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) } }) => {
    return jsonwebtoken_1.default.sign(payload, signature, options);
};
exports.generateToken = generateToken;
const generateRefreshToken = ({ payload = {}, signature = process.env.REFRESH_TOKEN_USER_SECRET, options = { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION) } }) => {
    return jsonwebtoken_1.default.sign(payload, signature, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verfiyToken = ({ token, signature }) => {
    if (!signature)
        throw new error_response_1.BadRequest("Signature is required");
    const decoded = jsonwebtoken_1.default.verify(token, signature);
    if (typeof decoded === "string")
        return null;
    return decoded;
};
exports.verfiyToken = verfiyToken;
const getSignature = async ({ signatureEnum = Token_Types_1.SignatureTypeEnum.bearer } = {}) => {
    let signatures = { access: undefined, refresh: undefined };
    switch (signatureEnum) {
        case Token_Types_1.SignatureTypeEnum.system:
            signatures.access = process.env.ACCESS_TOKEN_ADMIN_SECRET;
            signatures.refresh = process.env.REFRESH_TOKEN_ADMIN_SECRET;
            break;
        default:
            signatures.access = process.env.ACCESS_TOKEN_USER_SECRET;
            signatures.refresh = process.env.REFRESH_TOKEN_USER_SECRET;
            break;
    }
    return signatures;
};
exports.getSignature = getSignature;
const decodedToken = async ({ authorization = "", tokenType = Token_Types_1.TokenTypeEnum.access, }, next) => {
    const [bearer, token] = authorization?.split(" ") || [];
    if (!token || !bearer)
        throw new error_response_1.Unauthorized("Unauthorized");
    const signature = await (0, exports.getSignature)({
        signatureEnum: bearer,
        tokenType,
    });
    const decoded = (0, exports.verfiyToken)({
        token,
        signature: tokenType === Token_Types_1.TokenTypeEnum.access ? signature.access : signature.refresh,
    });
    if (!decoded)
        throw new error_response_1.BadRequest("InValid Token");
    const user = await DBservices.findById({ model: user_1.default, id: decoded._id });
    if (!user)
        throw new error_response_1.NotFound("User Not Found");
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const generateNewTokens = async ({ user }) => {
    const signature = await (0, exports.getSignature)({
        signatureEnum: user.role !== user_1.roleEnum.user
            ? Token_Types_1.SignatureTypeEnum.system
            : Token_Types_1.SignatureTypeEnum.bearer
    });
    const accessToken = (0, exports.generateToken)({
        payload: { _id: user._id },
        signature: signature.access,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) }
    });
    const refreshToken = (0, exports.generateToken)({
        payload: { _id: user._id },
        signature: signature.refresh,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION) }
    });
    return { accessToken, refreshToken };
};
exports.generateNewTokens = generateNewTokens;
