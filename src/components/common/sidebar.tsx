/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react"; // Thêm useState để quản lý popup
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { SiRiotgames } from "react-icons/si";
import { HiOutlineLogout, HiOutlineKey } from "react-icons/hi";
import styles from "./styles.module.css";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  CHANGE_PASSWORD,
  GET_ACCOUNT_BY_ID,
  LOGOUT_MUTATION,
} from "@/lib/graphql/queries/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Dialog components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

const AppSidebar = ({ items }: { items: SidebarItem[] }) => {
  const { open } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  // State cho Popup Đổi mật khẩu
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

  const token = Cookies.get("accessToken");
  let userId = "";
  try {
    if (token) {
      const decoded: any = jwtDecode(token);
      userId = decoded.sub;
    }
  } catch (e) {
    console.error("Token invalid");
  }

  const { data } = useQuery(GET_ACCOUNT_BY_ID, {
    variables: { id: userId },
    // skip: !userId,
  });

  const user = data?.account;

  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    router.push("/login");
  };
  const [callChangePasswordApi] = useMutation(CHANGE_PASSWORD);
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    console.log(userId, passwords.old, passwords.new); // Kiểm tra giá trị trước khi gọi API
    try {
      // 2. Gọi API đổi mật khẩu
      const { data } = await callChangePasswordApi({
        variables: {
          input: {
            userId: userId,
            oldPassword: passwords.old,
            newPassword: passwords.new,
          },
        },
      });
      console.log("Kết quả từ BE trả về:", data);
      // 3. Xử lý kết quả dựa trên giá trị Boolean từ Backend
      if (data?.changePassword) {
        // TRƯỜNG HỢP THÀNH CÔNG
        toast.success("Mật khẩu đã được cập nhật thành công!");
        setIsDialogOpen(false); // Đóng popup
        setPasswords({ old: "", new: "", confirm: "" }); // Reset form
      } else {
        // TRƯỜNG HỢP SAI MẬT KHẨU CŨ (Nếu BE trả về false thay vì ném lỗi)
        setIsDialogOpen(false); // Đóng popup theo ý bạn
        toast.error("Mật khẩu hiện tại không chính xác!");
      }
    } catch (error: any) {
      // TRƯỜNG HỢP CÓ LỖI (Ví dụ: BE trả về 400/500)
      setIsDialogOpen(false);
      toast.error(error.message || "Sai mật khẩu hiện tại hoặc lỗi hệ thống!");
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader
          className={`${!open && styles.collapsedSidebarHeader} border-b`}
        >
          {open ? (
            <div className="flex gap-[8px] items-center p-2 rounded-md">
              <SiRiotgames size={30} className="text-red-600" />
              <div className="flex-1 flex flex-col">
                <p className="text-base/4 font-black uppercase text-black">
                  PREMIER
                </p>
                <p className="text-[11px] text-gray-500 font-medium tracking-tight">
                  A league of its own
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-2">
              <SiRiotgames size={24} className="text-red-600" />
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="mt-2">
          <SidebarGroup className="py-4">
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={
                          isActive
                            ? "bg-neutral-100 text-black"
                            : "text-gray-500"
                        }
                      >
                        <Link href={item.url}>
                          {item.icon}
                          <span className="font-semibold">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`${open ? "flex items-center justify-between p-2 hover:bg-neutral-100 cursor-pointer rounded-xl transition-colors" : "flex items-center justify-center cursor-pointer py-2"}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img
                    src={
                      user?.avatar || "https://ui.shadcn.com/avatars/shadcn.jpg"
                    }
                    alt="avatar"
                    className="rounded-lg object-cover w-[35px] h-[35px] border"
                  />
                  {open && (
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold leading-4 truncate text-black">
                        {user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 truncate">
                        {user?.email || "Chưa đăng nhập"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="right"
              className="w-[200px] mb-4 shadow-xl border-neutral-200 p-1.5"
            >
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Vai trò
                </p>
                <p className="text-xs font-bold text-gray-700">
                  {user?.role || "USER"}
                </p>
              </div>

              {/* Mở Popup thay vì chuyển trang */}
              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                className="cursor-pointer gap-2 py-2.5 text-gray-600 focus:bg-neutral-50"
              >
                <HiOutlineKey size={18} className="text-gray-400" />
                <span className="font-semibold">Đổi mật khẩu</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-neutral-100" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer gap-2 py-2.5 font-bold"
              >
                <HiOutlineLogout size={18} />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      {/* --- POPUP ĐỔI MẬT KHẨU (DIALOG) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Đổi mật khẩu
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Mật khẩu cũ
              </label>
              <Input
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwords.old}
                onChange={(e) =>
                  setPasswords({ ...passwords, old: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Mật khẩu mới
              </label>
              <Input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Xác nhận mật khẩu mới
              </label>
              <Input
                type="password"
                placeholder="Gõ lại mật khẩu mới"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handlePasswordChange}
              className="bg-red-600 hover:bg-red-700"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppSidebar;
