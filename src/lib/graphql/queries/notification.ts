import { gql } from "@apollo/client";

// Lấy danh sách thông báo (kèm đếm số lượng chưa đọc)
export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($filter: GetNotificationsFilterInput!) {
    getMyNotifications(filter: $filter) {
      data {
        id
        title
        content
        isRead
        type
        createdAt
      }
      total
      unreadCount
      page
      limit
      totalPages
    }
  }
`;

// Đánh dấu đã đọc
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
    }
  }
`;
