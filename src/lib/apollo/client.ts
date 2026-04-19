import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client"
import { authLink } from "./authLink";
import { httpLink } from "./httpLink";
import { errorLink } from "./errorLink";
export const apolloClient = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
});