"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenTypeEnum = exports.SignatureTypeEnum = exports.logoutEnum = void 0;
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
})(SignatureTypeEnum || (exports.SignatureTypeEnum = SignatureTypeEnum = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["access"] = "access";
    TokenTypeEnum["refresh"] = "refresh";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
