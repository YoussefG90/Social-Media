import * as gqlTypes from "./user.types.gql"
import * as gqlargs from "./user.args.gql"
import { UserResolver } from "./user.resolver"
import { GraphQLNonNull, GraphQLString } from "graphql"


class UserGQLSchema {
    private userResolver:UserResolver = new UserResolver()
    constructor(){}

    registerQuery = () => {
        return {
            sayHi:{
                type:gqlTypes.wellcome,
                args:{name:{type:new GraphQLNonNull(GraphQLString)}},
                resolve:this.userResolver.wellcome
            },

            allUsers:{
                type:gqlTypes.allUsers,
                args:gqlargs.allUsers,
                    resolve:this.userResolver.allUsers
            },

            searchUser:{
                type:gqlTypes.searchUser,
                args:gqlargs.searchUser,
                resolve:this.userResolver.searchUser
            },
                
        }
    }

    registerMutation = () => {
        return {
            addFollower:{
                type: gqlTypes.addFollower,
                args:gqlargs.addFollower,
                resolve:this.userResolver.addFollower
            }
        }
    }
}


export default new UserGQLSchema()