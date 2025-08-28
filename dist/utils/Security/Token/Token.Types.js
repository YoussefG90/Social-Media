"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenTypeEnum = exports.SignatureTypeEnum = void 0;
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
