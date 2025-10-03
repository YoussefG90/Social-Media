"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphValidation = exports.Validation = exports.genralFields = void 0;
const zod_1 = require("zod");
const user_1 = require("../DB/models/user");
const error_response_1 = require("../utils/Response/error.response");
const mongoose_1 = require("mongoose");
const graphql_1 = require("graphql");
exports.genralFields = {
    name: zod_1.z.string().min(2).max(20).regex(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{1,20}$/)),
    email: zod_1.z.email(),
    password: zod_1.z.string().regex(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    phone: zod_1.z.string().regex(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    gender: zod_1.z.enum([...Object.values(user_1.genderEnum)]),
    age: zod_1.z.number().lt(100).gte(16),
    otp: zod_1.z.string().regex(/^\d{6}$/),
    file: {
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        destination: zod_1.z.string(),
        filename: zod_1.z.string(),
        path: zod_1.z.string(),
        size: zod_1.z.number().positive()
    },
    files: function (mimetype) {
        return zod_1.z.strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            destination: zod_1.z.string().optional(),
            filename: zod_1.z.string().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number().positive()
        });
    },
    id: zod_1.z.string().refine((data) => { return mongoose_1.Types.ObjectId.isValid(data); }, { error: "invalid objectId Format" })
};
const Validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body.attachment = req.file;
            }
            if (req.files) {
                req.body.attachments = req.files;
            }
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationError.push({ key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path };
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
const graphValidation = async (schema, args) => {
    const validationResult = await schema.safeParseAsync(args);
    if (!validationResult.success) {
        const errors = validationResult.error;
        throw new graphql_1.GraphQLError("Validation Error", {
            extensions: {
                statusCode: 400,
                issues: [
                    {
                        key: "args",
                        issues: errors.issues.map((issue) => ({
                            message: issue.message,
                            path: issue.path
                        }))
                    }
                ]
            }
        });
    }
};
exports.graphValidation = graphValidation;
