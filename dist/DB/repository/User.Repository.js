"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReposirotry = void 0;
const DB_Repository_1 = require("./DB.Repository");
const error_response_1 = require("../../utils/Response/error.response");
class UserReposirotry extends DB_Repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data, options, }) {
        const [user] = (await this.create({ data, options })) || [];
        if (!user) {
            throw new error_response_1.NotFound("User Not Created");
        }
        return user;
    }
}
exports.UserReposirotry = UserReposirotry;
