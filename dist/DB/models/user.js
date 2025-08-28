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
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 25 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
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
const UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = UserModel;
