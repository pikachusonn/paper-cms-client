import { getAccessToken } from "@/helper/token.helper"
import { ApolloLink } from "@apollo/client"
export const authLink = new ApolloLink((operation, forward)=>{
    const accessToken = getAccessToken();
    operation.setContext(({ headers = {}})=> ({
        headers: {
            ...headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
    }));
    return forward(operation);
});