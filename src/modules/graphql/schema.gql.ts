import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGQLSchema } from "../user";
import { PostGQLSchema } from "../post";



const query = new GraphQLObjectType({
    name:"RootSchemaQuery",
    fields:{
     ...userGQLSchema.registerQuery(),
     ...PostGQLSchema.registerQuery()
    }
})


const mutation = new GraphQLObjectType({
    name:"RootSchemaMutation",
    fields:{
     ...userGQLSchema.registerMutation(),
     ...PostGQLSchema.registerMutation()

    }
})

export const schema = new GraphQLSchema({query,mutation})