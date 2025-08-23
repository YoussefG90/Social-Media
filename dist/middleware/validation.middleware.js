"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = exports.genralFields = void 0;
const zod_1 = require("zod");
const user_1 = require("../DB/models/user");
const error_response_1 = require("../utils/Response/error.response");
exports.genralFields = {
    name: zod_1.z.string().min(2).max(20).regex(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{1,20}$/)),
    email: zod_1.z.email(),
    password: zod_1.z.string().regex(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    phone: zod_1.z.string().regex(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    gender: zod_1.z.enum([...Object.values(user_1.genderEnum)]),
    age: zod_1.z.number().lt(100).gte(16),
    file: {
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        finalPath: zod_1.z.string(),
        destination: zod_1.z.string(),
        filename: zod_1.z.string(),
        path: zod_1.z.string(),
        size: zod_1.z.number().positive()
    }
};
const Validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationError.push({ key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path[0] };
                    }) });
            }
            if (validationError.length) {
                throw new error_response_1.BadRequest("Validation Error", { validationError });
            }
        }
        return next();
    };
};
exports.Validation = Validation;
