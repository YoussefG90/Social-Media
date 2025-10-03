"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPosts = exports.GraphQLOnePostResponse = exports.GraphQlAllowCommentsEnum = exports.GraphQlAvailabilityEnum = void 0;
const graphql_1 = require("graphql");
const models_1 = require("../../DB/models");
const user_1 = require("../user");
exports.GraphQlAvailabilityEnum = new graphql_1.GraphQLEnumType({
    name: "AvailabilityEnum",
    values: {
        public: { value: models_1.AvailabilityEnum.public },
        onlyMe: { value: models_1.AvailabilityEnum.onlyMe },
        friends: { value: models_1.AvailabilityEnum.friends }
    }
});
exports.GraphQlAllowCommentsEnum = new graphql_1.GraphQLEnumType({
    name: "AllowCommentsEnum",
    values: {
        Allow: { value: models_1.AllowCommentsEnum.Allow },
        Deny: { value: models_1.AllowCommentsEnum.Deny },
    }
});
exports.GraphQLOnePostResponse = new graphql_1.GraphQLObjectType({
    name: "OnePostResponse",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        content: { type: graphql_1.GraphQLString },
        assistFolderId: { type: graphql_1.GraphQLString },
        availability: { type: exports.GraphQlAvailabilityEnum },
        allowComments: { type: exports.GraphQlAllowCommentsEnum },
        likes: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        createdBy: { type: user_1.GraphqlOneUserResponse },
        freezedAt: { type: graphql_1.GraphQLString },
        freezedBy: { type: graphql_1.GraphQLID },
        restoreAt: { type: graphql_1.GraphQLString },
        restoredBy: { type: graphql_1.GraphQLID },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    }
});
exports.allPosts = new graphql_1.GraphQLObjectType({
    name: "allPosts",
    fields: {
        docsCount: { type: graphql_1.GraphQLInt },
        pages: { type: graphql_1.GraphQLInt },
        limit: { type: graphql_1.GraphQLInt },
        currentPage: { type: graphql_1.GraphQLInt },
        result: { type: new graphql_1.GraphQLList(exports.GraphQLOnePostResponse) }
    }
});
