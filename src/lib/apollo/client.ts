import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client"
import { authLink } from "./authLink";
import { httpLink } from "./httpLink";
export const apolloClient = new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
});