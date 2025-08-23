"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleEnum = exports.genderEnum = void 0;
const mongoose_1 = require("mongoose");
var genderEnum;
(function (genderEnum) {
    genderEnum["male"] = "male";
    genderEnum["female"] = "female";
})(genderEnum || (exports.genderEnum = genderEnum = {}));
var roleEnum;
(function (roleEnum) {
    roleEnum["user"] = "User";
    roleEnum["admin"] = "Admin";
})(roleEnum || (exports.roleEnum = roleEnum = {}));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    emailOTP: String,
    emailOTPExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    tempEmail: String,
    resetPassword: { type: Boolean, default: false },
    confirmEmail: { type: Boolean, default: false },
    gender: { type: String, enum: { values: Object.values(genderEnum),
            message: `Only Allowed Genders are: ${Object.values(genderEnum).join(", ")}` },
        default: genderEnum.male },
    role: { type: String, enum: { values: Object.values(roleEnum),
            message: `Only Allowed Roles are : ${Object.values(genderEnum).join(", ")}` },
        default: roleEnum.user },
}, {
    timestamps: true
});
const UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = UserModel;
