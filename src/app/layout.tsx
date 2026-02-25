import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/common/sidebar";
import { IoHomeOutline } from "react-icons/io5";
import { IoIosNotificationsOutline } from "react-icons/io";
import { CiUser } from "react-icons/ci";
import { Toaster } from "@/components/ui/sonner"; //

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premier - Quản lý giấy tờ",
  description: "Hệ thống quản lý giấy tờ tống đạt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Danh sách các mục trên Sidebar
  const items = [
    {
      title: "Quản lý giấy tờ",
      url: "/",
      icon: <IoHomeOutline size={20} />,
    },
    {
      title: "Thông báo",
      url: "/notification", // Thêm dấu / để làm đường dẫn tuyệt đối
      icon: <IoIosNotificationsOutline size={20} />,
    },
    {
      title: "Quản lý nhân sự",
      url: "/management", // Bạn có thể thay đổi đường dẫn này sau
      icon: <CiUser size={20} />,
    },
  ];

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SidebarProvider>
            <AppSidebar items={items} />

            <main className="w-full">
              <div className="w-full">
                <TooltipProvider>{children}</TooltipProvider>
              </div>
            </main>
          </SidebarProvider>
        </Providers>
        <Toaster richColors closeButton position="top-right" duration={3000} />
      </body>
    </html>
  );
}
