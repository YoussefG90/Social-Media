"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.providerEnum = exports.roleEnum = exports.genderEnum = void 0;
const mongoose_1 = require("mongoose");
const Hash_1 = require("../../utils/Security/Hash");
const email_1 = require("../../utils/Events/email");
var genderEnum;
(function (genderEnum) {
    genderEnum["male"] = "male";
    genderEnum["female"] = "female";
})(genderEnum || (exports.genderEnum = genderEnum = {}));
var roleEnum;
(function (roleEnum) {
    roleEnum["user"] = "User";
    roleEnum["admin"] = "Admin";
    roleEnum["superAdmin"] = "SuperAdmin";
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
    tempEmail: { type: String },
    emailOTP: String,
    emailOTPExpires: Date,
    newEmailOTP: String,
    newEmailOTPExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    resetEmail: { type: Boolean, default: false },
    provider: { type: String, enum: providerEnum, default: providerEnum.System },
    resetPassword: { type: Boolean, default: false },
    confirmEmail: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorOTP: String,
    twoFactorExpires: Date,
    freezeAt: Date,
    freezeBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoreAt: Date,
    restoreBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    gender: { type: String, enum: genderEnum, default: genderEnum.male },
    role: { type: String, enum: roleEnum, default: roleEnum.user },
    profileImage: { secure_url: { type: String }, public_id: { type: String }, },
    coverImages: [{ secure_url: { type: String }, public_id: { type: String } }],
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    block: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
}).get(function () {
    return this.firstName + " " + this.lastName;
});
userSchema.pre("save", async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, Hash_1.generateHash)({ plaintext: this.password });
    }
    if (this.isModified("emailOTP")) {
        this.confirmEmailPlainOtp = this.emailOTP;
        this.emailOTP = await (0, Hash_1.generateHash)({ plaintext: this.emailOTP });
    }
    next();
});
userSchema.post("save", async function (doc, next) {
    const that = this;
    if (that.wasNew && that.confirmEmailPlainOtp) {
        email_1.emailEvent.emit("Confirm Email", { to: this.email, otp: that.confirmEmailPlainOtp });
    }
    next();
});
userSchema.post("findOneAndUpdate", async function (doc) {
    if (!doc)
        return;
    const prev = await this.model.findOne(this.getQuery()).select("role email");
    if (prev && prev.role !== doc.role && doc.email) {
        email_1.emailEvent.emit("Role Changed", {
            to: doc.email,
            otp: `Your role has been changed to ${doc.role}`,
        });
    }
});
userSchema.pre(["find", "findOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        delete query.paranoid;
        this.setQuery({ ...query });
    }
    else {
        delete query.paranoid;
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = exports.UserModel;
