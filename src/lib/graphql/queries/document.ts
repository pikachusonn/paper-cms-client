import { gql } from "@apollo/client";

export const GET_DOCUMENTS_BY_COURT = gql`
  query GetDocumentsByCourt($filter: GetDocsFilterInput!) {
    getDocumentsByCourt(filter: $filter) {
      data {
        id
        docCode
        docType
        recipient
        address
        receivedDate
        dueDate
        status
        evidenceUrl
        deliveryMethod
        content
        responsibleOfficial {
          id
          name
        }
        totalFeeInternal
        totalFeeExternal
        isOverdue
      }
      total
      page
      limit
      totalPages
      statHeader {
        waiting
        overdue
      }
    }
  }
`;

export const GET_OFFICIALS_BY_COURT = gql`
  query GetOfficialsByCourt($courtId: ID!) {
    getOfficialsByCourt(courtId: $courtId) {
      id
      name
      title
      phone
      isDeleted
    }
  }
`;

export const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      id
      docCode
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($input: UpdateDocumentInput!) {
    updateDocument(input: $input) {
      id
      docCode
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

export const CREATE_BULK_DOCUMENTS = gql`
  mutation CreateBulkDocuments($inputs: [CreateDocumentInput!]!) {
    createBulkDocuments(inputs: $inputs) {
      successCount
      errors {
        rowIndex
        message
      }
    }
  }
`;

export const CONFIRM_DOCUMENT = gql`
  mutation confirmDocument($id: ID!) {
    confirmDocument(id: $id) {
      id
      status
    }
  }
`;

// 1. API Tạo Link (Dành cho Admin)
export const GENERATE_PUBLIC_IMPORT_LINK = gql`
  mutation generatePublicImportLink($courtId: ID!) {
    generatePublicImportLink(courtId: $courtId)
  }
`;

// 2. API Public Import (Không cần Auth, truyền thẳng token vào args)
export const PUBLIC_CREATE_BULK_DOCUMENTS = gql`
  mutation publicCreateBulkDocuments(
    $token: String!
    $inputs: [CreateDocumentInput!]!
  ) {
    publicCreateBulkDocuments(token: $token, inputs: $inputs) {
      successCount
      errors {
        rowIndex
        message
      }
    }
  }
`;

// Lấy danh sách cán bộ cho trang Public (Dùng token 30 phút)
export const PUBLIC_GET_OFFICIALS = gql`
  query publicGetOfficials($token: String!) {
    publicGetOfficials(token: $token) {
      id
      name
      title
    }
  }
`;
