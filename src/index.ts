import { ApolloServer } from "apollo-server";
import { connectToMongoDB } from "./db/mongodb"
import { typeDefs } from "./graphicql/schema";
import { resolvers } from "./graphicql/resolvers";
import { getUserFromToken } from "./autentificacion/auth";

const start = async () => {
  await connectToMongoDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      console.log(token)
      const user = token ? await getUserFromToken(token as string) : null;
      console.log(user)
      return { user };
    },
  });

  await server.listen({ port: 4000 });
  console.log("GQL conectado");
};



start().catch(err=>console.error(err));