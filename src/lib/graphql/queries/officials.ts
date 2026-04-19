import { gql } from "@apollo/client";

export const GET_OFFICIALS_DETAILS = gql`
  query courtStaff($id: ID!) {
    courtStaff(id: $id) {
      id
      name
      phone
      email
      isDeleted
      court {
        id
        name
        address
        phone
        email
        courtNumber
      }
    }
  }
`;
