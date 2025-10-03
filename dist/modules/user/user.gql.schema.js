"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const gqlTypes = __importStar(require("./user.types.gql"));
const gqlargs = __importStar(require("./user.args.gql"));
const user_resolver_1 = require("./user.resolver");
const graphql_1 = require("graphql");
class UserGQLSchema {
    userResolver = new user_resolver_1.UserResolver();
    constructor() { }
    registerQuery = () => {
        return {
            sayHi: {
                type: gqlTypes.wellcome,
                args: { name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) } },
                resolve: this.userResolver.wellcome
            },
            allUsers: {
                type: gqlTypes.allUsers,
                args: gqlargs.allUsers,
                resolve: this.userResolver.allUsers
            },
            searchUser: {
                type: gqlTypes.searchUser,
                args: gqlargs.searchUser,
                resolve: this.userResolver.searchUser
            },
        };
    };
    registerMutation = () => {
        return {
            addFollower: {
                type: gqlTypes.addFollower,
                args: gqlargs.addFollower,
                resolve: this.userResolver.addFollower
            }
        };
    };
}
exports.default = new UserGQLSchema();
