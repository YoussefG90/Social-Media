"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUser = exports.addFollower = exports.allUsers = exports.wellcome = exports.GraphqlOneUserResponse = exports.GraphQlRoleEnum = exports.GraphQlProviderEnum = exports.GraphQlGenderEnum = void 0;
const graphql_1 = require("graphql");
const graphql_2 = require("graphql");
const models_1 = require("../../DB/models");
const types_gql_1 = require("../graphql/types.gql");
exports.GraphQlGenderEnum = new graphql_2.GraphQLEnumType({
    name: "GraphQlGenderEnum",
    values: {
        male: { value: models_1.genderEnum.male },
        female: { value: models_1.genderEnum.female }
    }
});
exports.GraphQlProviderEnum = new graphql_2.GraphQLEnumType({
    name: "GraphQlProviderEnum",
    values: {
        Google: { value: models_1.providerEnum.Google },
        System: { value: models_1.providerEnum.System }
    }
});
exports.GraphQlRoleEnum = new graphql_2.GraphQLEnumType({
    name: "GraphQlRoleEnum",
    values: {
        user: { value: models_1.roleEnum.user },
        admin: { value: models_1.roleEnum.admin },
        superAdmin: { value: models_1.roleEnum.superAdmin }
    }
});
exports.GraphqlOneUserResponse = new graphql_2.GraphQLObjectType({
    name: "GraphqlOneUserResponse",
    fields: {
        _id: { type: graphql_2.GraphQLID },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        userName: { type: graphql_1.GraphQLString, resolve: (parent) => {
                return parent.gender === models_1.genderEnum.male ? `Mr:${parent.userName}` : `Mis:${parent.userName}`;
            } },
        email: { type: graphql_1.GraphQLString },
        password: { type: graphql_1.GraphQLString },
        age: { type: graphql_1.GraphQLInt },
        phone: { type: graphql_1.GraphQLString },
        emailOTP: { type: graphql_1.GraphQLString },
        emailOTPExpires: { type: graphql_1.GraphQLString },
        newEmailOTP: { type: graphql_1.GraphQLString },
        newEmailOTPExpires: { type: graphql_1.GraphQLString },
        resetPasswordOTP: { type: graphql_1.GraphQLString },
        resetPasswordOTPExpires: { type: graphql_1.GraphQLString },
        confirmEmail: { type: graphql_1.GraphQLBoolean },
        resetPassword: { type: graphql_1.GraphQLBoolean },
        resetEmail: { type: graphql_1.GraphQLBoolean },
        gender: { type: exports.GraphQlGenderEnum },
        role: { type: exports.GraphQlRoleEnum },
        changeCredentialsTime: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updateAt: { type: graphql_1.GraphQLString },
        freezeAt: { type: graphql_1.GraphQLString },
        freezeBy: { type: graphql_2.GraphQLID },
        restoreAt: { type: graphql_1.GraphQLString },
        restoreBy: { type: graphql_2.GraphQLID },
        provider: { type: exports.GraphQlProviderEnum },
        tempEmail: { type: graphql_1.GraphQLString },
        twoFactorEnabled: { type: graphql_1.GraphQLBoolean },
        twoFactorOTP: { type: graphql_1.GraphQLString },
        twoFactorExpires: { type: graphql_1.GraphQLString },
        friends: { type: new graphql_2.GraphQLList(graphql_2.GraphQLID) },
        block: { type: new graphql_2.GraphQLList(graphql_2.GraphQLID) },
    }
});
exports.wellcome = new graphql_2.GraphQLNonNull(graphql_1.GraphQLString);
exports.allUsers = new graphql_2.GraphQLList(exports.GraphqlOneUserResponse);
exports.addFollower = new graphql_2.GraphQLList(exports.GraphqlOneUserResponse);
exports.searchUser = (0, types_gql_1.GraphQlUniformResponse)({
    name: "SearchUser",
    data: new graphql_2.GraphQLNonNull(exports.GraphqlOneUserResponse),
});
