import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation Login($loginRequest: LoginRequest!) {
        login(loginRequest: $loginRequest) {
            accessToken
            refreshToken
            account { id email role }
        }
    }
`
