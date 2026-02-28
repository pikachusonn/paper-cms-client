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