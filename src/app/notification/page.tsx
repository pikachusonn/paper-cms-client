/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_MY_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
} from "@/lib/graphql/queries/notification";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import { IoEyeOutline } from "react-icons/io5";
import { toast } from "sonner";

const NotificationPage = () => {
  // Quản lý Tab hiện tại: "ALL" hoặc "UNREAD"
  const [activeTab, setActiveTab] = useState("ALL");

  // State xem chi tiết thông báo
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  // --- API QUERIES ---
  // Gọi API lấy thông báo. Nếu tab là UNREAD thì truyền isRead: false, ngược lại không truyền để lấy tất cả
  const { data, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: {
      filter: {
        page: 1,
        limit: 50, // Lấy tạm 50 cái, sếp có thể làm phân trang sau
        ...(activeTab === "UNREAD" ? { isRead: false } : {}),
      },
    },
    fetchPolicy: "network-only", // Luôn lấy data mới nhất
  });

  // --- API MUTATIONS ---
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
    onCompleted: () => {
      refetch(); // Đánh dấu xong thì load lại list để cập nhật unreadCount
    },
    onError: (err) => {
      toast.error("Lỗi: " + err.message);
    },
  });

  // --- HANDLERS ---
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
    markAsRead({ variables: { id } });
  };

  const handleViewDetails = (notif: any) => {
    setSelectedNotif(notif);
    // Nếu chưa đọc thì khi xem chi tiết sẽ tự động đánh dấu đã đọc luôn
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
  };

  // --- DATA PREPARATION ---
  const notifications = (data as any)?.getMyNotifications?.data || [];
  // Lấy unreadCount từ tab "Tất cả" hoặc tab hiện tại để hiển thị trên tiêu đề (nếu cần)
  const unreadCount = (data as any)?.getMyNotifications?.unreadCount || 0;

  return (
    <div className="p-8 flex flex-col gap-6 bg-[#f8f9fa] min-h-screen w-full">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val)}
        className="w-full bg-white border rounded-xl p-4 shadow-sm"
      >
        <TabsList className="bg-gray-100 mb-4 h-9">
          <TabsTrigger
            value="ALL"
            className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value="UNREAD"
            className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Chưa đọc
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ALL" className="mt-0">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onView={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="UNREAD" className="mt-0">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onView={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      {/* --- MODAL XEM CHI TIẾT THÔNG BÁO --- */}
      <Dialog
        open={!!selectedNotif}
        onOpenChange={(open) => !open && setSelectedNotif(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-blue-600">
              {selectedNotif?.title || "Chi tiết thông báo"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedNotif?.content}
            </p>
            <p className="text-xs text-gray-400 mt-4 italic">
              Nhận lúc:{" "}
              {selectedNotif?.createdAt
                ? new Date(selectedNotif.createdAt).toLocaleString("vi-VN")
                : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- COMPONENT CON: Render danh sách ---
const NotificationList = ({ notifications, onMarkAsRead, onView }: any) => {
  if (notifications.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 italic">
        Không có thông báo nào.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {notifications.map((notif: any) => (
        <div
          key={notif.id}
          className={`flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${
            !notif.isRead ? "bg-blue-50/30" : "opacity-70"
          }`}
          onClick={() => onView(notif)}
        >
          <div className="flex-1 pr-4">
            <p
              className={`text-sm ${!notif.isRead ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}
            >
              {/* Theo design, content là text thông báo chính */}
              {notif.content}
            </p>
          </div>

          <div className="flex items-center gap-4 whitespace-nowrap">
            {!notif.isRead && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => onMarkAsRead(notif.id, e)}
              >
                đánh dấu đã đọc
              </button>
            )}
            <IoEyeOutline
              size={20}
              className="text-gray-500 hover:text-black cursor-pointer"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPage;
