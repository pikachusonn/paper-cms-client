// src/lib/graphql/queries/auth.ts (hoặc account.ts)
import { gql } from "@apollo/client";

export const GET_ACCOUNT_BY_ID = gql`
  query GetAccount($id: ID!) {
    account(id: $id) {
      id
      email
      avatar
      role
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout($userId: ID!) {
    logout(userId: $userId) 
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) 
  }
`;