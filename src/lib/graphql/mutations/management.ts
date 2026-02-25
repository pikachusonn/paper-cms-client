import { gql } from "@apollo/client";

// 1. Thêm Tòa án
export const CREATE_COURT = gql`
  mutation CreateCourt($input: CreateCourtInput!) {
    createCourt(input: $input) {
      id
      name
      phone
      email
    }
  }
`;

// 2. Thêm Cán bộ Tòa án (Official)
export const CREATE_OFFICIAL = gql`
  mutation createCourtOfficial($input: CreateOfficialInput!) {
    createCourtOfficial(input: $input) {
      id
      name
    }
  }
`;

// 3. Sửa Tài khoản
export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($input: UpdateAccountInput!) {
    updateAccount(input: $input) {
      id
      email
    }
  }
`;
