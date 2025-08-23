"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewTokens = exports.decodedToken = exports.getSignature = exports.verfiyToken = exports.generateRefreshToken = exports.generateToken = exports.logoutEnum = exports.tokenTypeEnum = exports.signatureTypeEnum = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var signatureTypeEnum;
(function (signatureTypeEnum) {
    signatureTypeEnum["system"] = "system";
    signatureTypeEnum["bearer"] = "Bearer";
})(signatureTypeEnum || (exports.signatureTypeEnum = signatureTypeEnum = {}));
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum["refresh"] = "refresh";
    tokenTypeEnum["access"] = "access";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
var logoutEnum;
(function (logoutEnum) {
    logoutEnum["signoutFromAll"] = "signoutFromAll";
    logoutEnum["signout"] = "signout";
    logoutEnum["stayLoggedIn"] = "stayLoggedIn";
})(logoutEnum || (exports.logoutEnum = logoutEnum = {}));
var SignatureTypeEnum;
(function (SignatureTypeEnum) {
    SignatureTypeEnum["bearer"] = "bearer";
    SignatureTypeEnum["system"] = "system";
})(SignatureTypeEnum || (SignatureTypeEnum = {}));
const generateToken = ({ payload = {}, signature = process.env.ACCESS_TOKEN_USER_SECRET, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) } }) => {
    return jsonwebtoken_1.default.sign(payload, signature, options);
};
exports.generateToken = generateToken;
const generateRefreshToken = ({ payload = {}, signature = process.env.REFRESH_TOKEN_USER_SECRET, options = { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION) } }) => {
    return jsonwebtoken_1.default.sign(payload, signature, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verfiyToken = ({ token, signature = process.env.ACCESS_TOKEN_USER_SECRET }) => {
    return jsonwebtoken_1.default.verify(token, signature);
};
exports.verfiyToken = verfiyToken;
const getSignature = async ({ signatureEnum = SignatureTypeEnum.bearer } = {}) => {
    let signatures = { access: undefined, refresh: undefined };
    switch (signatureEnum) {
        case SignatureTypeEnum.system:
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
const decodedToken = async ({ authorization = "", tokenType = tokenTypeEnum.access }) => {
    const [bearer, token] = authorization?.split(" ") || [];
    if (!token || !bearer)
        return next(new Error("Unauthorized", { cause: 401 }));
    let signature = await (0, exports.getSignature)({ signatureEnum: bearer, tokenType });
    const decoded = await (0, exports.verfiyToken)({ token, signature: tokenType === tokenTypeEnum.access ? signature.access : signature.refresh });
    if (!decoded)
        return next(new Error("In Valid Token", { cause: 400 }));
    if (decoded.jti && await servicesDB.findOne({ model: RevokeToken, filter: { jti: decoded.jti } })) {
        return next(new Error("In-Vaild Tokens", { cause: 401 }));
    }
    const user = await servicesDB.findById({ model: UserModel, id: decoded._id });
    if (!user) {
        return next(new Error("Account Not Register", { cause: 404 }));
    }
    if (user.userTokens && decoded.iat * 1000 < new Date(user.userTokens).getTime()) {
        return next(new Error("In-Vaild Tokens", { cause: 401 }));
    }
    if (user.changeTokensTime?.getTime() > decoded.iat * 1000) {
        return next(new Error("In-Vaild Tokens", { cause: 401 }));
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const generateNewTokens = async ({ user } = {}) => {
    const signature = await (0, exports.getSignature)({
        signatureEnum: user.role != roleEnum.user ? signatureTypeEnum.system : signatureTypeEnum.bearer
    });
    const accessToken = await (0, exports.generateToken)({ payload: { _id: user._id }, signature: signature.access,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) } });
    const refreshToken = await (0, exports.generateToken)({ payload: { _id: user._id }, signature: signature.refresh,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION) } });
    return { accessToken, refreshToken };
};
exports.generateNewTokens = generateNewTokens;
