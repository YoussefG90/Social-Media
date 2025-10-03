import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { AllowCommentsEnum, AvailabilityEnum } from "../../DB/models"
import { GraphqlOneUserResponse } from "../user"


export const GraphQlAvailabilityEnum = new GraphQLEnumType({
    name:"AvailabilityEnum",
    values:{
        public:{value:AvailabilityEnum.public},
        onlyMe:{value:AvailabilityEnum.onlyMe},
        friends:{value:AvailabilityEnum.friends}
    }
})

export const GraphQlAllowCommentsEnum = new GraphQLEnumType({
    name:"AllowCommentsEnum",
    values:{
        Allow:{value:AllowCommentsEnum.Allow},
        Deny:{value:AllowCommentsEnum.Deny},
    }
})

export const GraphQLOnePostResponse = new GraphQLObjectType ({
    name:"OnePostResponse",
    fields:{
            _id:{type:GraphQLID},
            content:{type:GraphQLString},
            assistFolderId:{type:GraphQLString},
            availability:{type:GraphQlAvailabilityEnum},
            allowComments:{type:GraphQlAllowCommentsEnum},
            likes:{type:new GraphQLList(GraphQLID)},
            tags:{type:new GraphQLList(GraphQLID)},
            createdBy:{type:GraphqlOneUserResponse},
            freezedAt:{type:GraphQLString},
            freezedBy:{type:GraphQLID},
            restoreAt:{type:GraphQLString},
            restoredBy:{type:GraphQLID},
            createdAt:{type:GraphQLString},
            updatedAt:{type:GraphQLString},
    }
})

export const allPosts = new GraphQLObjectType({
    name:"allPosts",
    fields: {
        docsCount: { type: GraphQLInt },
        pages: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        currentPage: { type: GraphQLInt },
        result: { type: new GraphQLList(GraphQLOnePostResponse) }
    }
})