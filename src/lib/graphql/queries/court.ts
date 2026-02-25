import { gql } from "@apollo/client";

// Đổi tên constant cho đúng mục đích: Lấy thống kê và danh sách các tòa
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($year: Int!, $searchCourt: String) {
    dashboardStats(year: $year, searchCourt: $searchCourt) {
      # 1. Các con số tổng quát cho toàn hệ thống
      totalWaiting
      totalOverdue
      totalStaff
      totalSecretary
      # 2. Danh sách tất cả các tòa án kèm số liệu riêng
      courts {
        id
        name
        waitingCount
        overdueCount
      }
    }
  }
`;