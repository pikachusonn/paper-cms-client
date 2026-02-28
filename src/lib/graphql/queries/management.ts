import { gql } from "@apollo/client";

// Tab 1: Lấy Tòa án & Nhân sự (Officials)
export const GET_COURTS_WITH_OFFICIALS = gql`
  query GetCourtsWithOfficials {
    courts {
      id
      name
      address
      phone
      email
      courtNumber
      officials {
        id
        name
        title
        phone
        isDeleted
      }
    }
  }
`;

// Tab 2: Lấy Nhân viên nhập liệu (Staff)
export const GET_STAFF_ACCOUNTS = gql`
  query GetStaffAccounts($search: String) {
    getStaffAccounts(search: $search) {
      id
      email
      fullName
      avatar
      role
      phone
      isDeleted
    }
  }
`;

export const GET_ADMIN_ACCOUNTS = gql`
  query GetAdminAccounts($search: String) {
    getAdminAccounts(search: $search) {
      id
      email
      fullName
      avatar
      role
      phone
      isDeleted
    }
  }
`;

// Tab 3: Lấy Tất cả Tài khoản (Có Filter & Pagination)
export const GET_ALL_ACCOUNTS_PAGINATED = gql`
  query GetAllAccounts($filter: AccountFilterInput) {
    getAllAccounts(filter: $filter) {
      data {
        id
        email
        role
        avatar
        phone
        isDeleted
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;
