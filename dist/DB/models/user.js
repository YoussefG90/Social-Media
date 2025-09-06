"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.providerEnum = exports.roleEnum = exports.genderEnum = void 0;
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
var providerEnum;
(function (providerEnum) {
    providerEnum["System"] = "System";
    providerEnum["Google"] = "Google";
})(providerEnum || (exports.providerEnum = providerEnum = {}));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 25 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return this.provider === providerEnum.System ? true : false; } },
    phone: { type: String },
    age: { type: Number, required: true },
    emailOTP: String,
    emailOTPExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    tempEmail: String,
    provider: { type: String, enum: providerEnum, default: providerEnum.System },
    resetPassword: { type: Boolean, default: false },
    confirmEmail: { type: Boolean, default: false },
    freezeAt: Date,
    freezeBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoreAt: Date,
    restoreBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    gender: { type: String, enum: genderEnum, default: genderEnum.male },
    role: { type: String, enum: roleEnum, default: roleEnum.user },
    profileImage: { secure_url: { type: String, required: true }, public_id: { type: String, required: true }, },
    coverImages: [{ secure_url: { type: String, required: true }, public_id: { type: String, required: true } }
    ],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
}).get(function () {
    return this.firstName + " " + this.lastName;
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = exports.UserModel;
