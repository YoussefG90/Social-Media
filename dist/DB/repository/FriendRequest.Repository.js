"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestRepository = void 0;
const DB_Repository_1 = require("./DB.Repository");
class FriendRequestRepository extends DB_Repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.FriendRequestRepository = FriendRequestRepository;
