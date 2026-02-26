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
export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      email
    }
  }
`;