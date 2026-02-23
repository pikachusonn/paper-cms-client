"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
import { FaFireFlameCurved } from "react-icons/fa6";

export default function Home() {
  const court = [
    {
      id: 1,
      courtName: "Toà án Sơn Tây",
      address: "12 Ngô Quyền, thị xã Sơn Tây, Hà Nội",
      totalUnprocessed: 3,
      isOverdue: 1,
    },
    {
      id: 2,
      courtName: "Toà án Ba Đình",
      address: "45 Liễu Giai, quận Ba Đình, Hà Nội",
      totalUnprocessed: 5,
      isOverdue: 2,
    },
    {
      id: 3,
      courtName: "Toà án Đống Đa",
      address: "18 Tôn Đức Thắng, quận Đống Đa, Hà Nội",
      totalUnprocessed: 2,
      isOverdue: 0,
    },
    {
      id: 4,
      courtName: "Toà án Cầu Giấy",
      address: "102 Trần Đăng Ninh, quận Cầu Giấy, Hà Nội",
      totalUnprocessed: 7,
      isOverdue: 3,
    },
    {
      id: 5,
      courtName: "Toà án Hoàn Kiếm",
      address: "6 Hai Bà Trưng, quận Hoàn Kiếm, Hà Nội",
      totalUnprocessed: 1,
      isOverdue: 0,
    },
    {
      id: 6,
      courtName: "Toà án Hai Bà Trưng",
      address: "55 Lò Đúc, quận Hai Bà Trưng, Hà Nội",
      totalUnprocessed: 4,
      isOverdue: 1,
    },
    {
      id: 7,
      courtName: "Toà án Thanh Xuân",
      address: "89 Nguyễn Trãi, quận Thanh Xuân, Hà Nội",
      totalUnprocessed: 6,
      isOverdue: 2,
    },
    {
      id: 8,
      courtName: "Toà án Hà Đông",
      address: "15 Quang Trung, quận Hà Đông, Hà Nội",
      totalUnprocessed: 8,
      isOverdue: 4,
    },
    {
      id: 9,
      courtName: "Toà án Long Biên",
      address: "22 Nguyễn Văn Cừ, quận Long Biên, Hà Nội",
      totalUnprocessed: 3,
      isOverdue: 1,
    },
    {
      id: 10,
      courtName: "Toà án Tây Hồ",
      address: "9 Âu Cơ, quận Tây Hồ, Hà Nội",
      totalUnprocessed: 2,
      isOverdue: 0,
    },
    {
      id: 11,
      courtName: "Toà án Bắc Từ Liêm",
      address: "120 Phạm Văn Đồng, quận Bắc Từ Liêm, Hà Nội",
      totalUnprocessed: 5,
      isOverdue: 1,
    },
    {
      id: 12,
      courtName: "Toà án Nam Từ Liêm",
      address: "30 Lê Đức Thọ, quận Nam Từ Liêm, Hà Nội",
      totalUnprocessed: 4,
      isOverdue: 2,
    },
    {
      id: 13,
      courtName: "Toà án Hoàng Mai",
      address: "77 Tam Trinh, quận Hoàng Mai, Hà Nội",
      totalUnprocessed: 6,
      isOverdue: 3,
    },
    {
      id: 14,
      courtName: "Toà án Gia Lâm",
      address: "10 Ngô Xuân Quảng, huyện Gia Lâm, Hà Nội",
      totalUnprocessed: 2,
      isOverdue: 0,
    },
    {
      id: 15,
      courtName: "Toà án Đông Anh",
      address: "5 Cao Lỗ, huyện Đông Anh, Hà Nội",
      totalUnprocessed: 7,
      isOverdue: 2,
    },
    {
      id: 16,
      courtName: "Toà án Sóc Sơn",
      address: "88 Núi Đôi, huyện Sóc Sơn, Hà Nội",
      totalUnprocessed: 3,
      isOverdue: 1,
    },
    {
      id: 17,
      courtName: "Toà án Thanh Trì",
      address: "14 Ngọc Hồi, huyện Thanh Trì, Hà Nội",
      totalUnprocessed: 5,
      isOverdue: 2,
    },
    {
      id: 18,
      courtName: "Toà án Thường Tín",
      address: "33 Quốc lộ 1A, huyện Thường Tín, Hà Nội",
      totalUnprocessed: 1,
      isOverdue: 0,
    },
    {
      id: 19,
      courtName: "Toà án Phú Xuyên",
      address: "66 Tiểu khu Phú Minh, huyện Phú Xuyên, Hà Nội",
      totalUnprocessed: 4,
      isOverdue: 1,
    },
    {
      id: 20,
      courtName: "Toà án Chương Mỹ",
      address: "25 Quốc lộ 6, huyện Chương Mỹ, Hà Nội",
      totalUnprocessed: 6,
      isOverdue: 3,
    },
  ];

  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 min-h-screen bg-zinc-50 font-sans dark:bg-black p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="font-semibold text-[16px] text-black"
            >
              Quản lý giấy tờ
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full p-4 rounded-md border border-black/20 shadow-md flex items-center justify-between">
        <div className="flex items-center justify-between gap-[50px]">
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold">20</span>
            <span className="max-w-[100px]">Giấy tờ chưa tống đạt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold flex items-center text-orange-500">
              15 <FaFireFlameCurved />
            </span>
            <span className="max-w-[100px]">Giấy tờ quá hạn tống đạt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold">20</span>
            <span className="max-w-[100px]">Giấy tờ chưa tống đạt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold">1</span>
            <span className="max-w-[100px]">Nhân viên nhập liệu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold">20</span>
            <span className="max-w-[100px]">thư kí tống đạt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold">20</span>
            <span className="max-w-[100px]">chi nhánh toà án</span>
          </div>
        </div>
        <p className="font-semibold max-w-[100px]">Số liệu thống kê năm 2025</p>
      </div>
      <div className="relative mt-[8px]">
        <CiSearch className="absolute left-[8px] top-1/2 -translate-y-1/2" />
        <Input className="pl-[32px]" placeholder="Tìm kiếm toà án" />
      </div>
      <div className="border rounded-md max-h-[65vh] overflow-y-auto">
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-white border-b border-black!">
            <TableRow>
              <TableHead className="w-[5%] py-[16px]">STT</TableHead>
              <TableHead className="w-[25%] py-[16px]">Tên Toà Án</TableHead>
              <TableHead className="w-[25%] py-[16px]">Địa Chỉ</TableHead>
              <TableHead className="w-[20%] py-[16px]">
                Số giấy tờ chưa tống đạt
              </TableHead>
              <TableHead className="w-[20%] py-[16px]">
                Số giấy tờ đến hạn tống đạt
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {court
              ?.sort((c1, c2) => c2?.isOverdue - c1.isOverdue)
              .map((court, index) => (
                <TableRow
                  key={court.id}
                  onClick={() => {
                    router.push(`/court/${court?.id}`);
                  }}
                  className={clsx(
                    court?.isOverdue > 0 ? "bg-[#FFBB00]/30" : "",
                    "hover:border-black border-t! hover:bg-[#FFBB00]/50",
                  )}
                >
                  <TableCell className="font-medium py-[16px]">
                    {index}
                  </TableCell>
                  <TableCell className="font-medium py-[16px]">
                    {court.courtName}
                  </TableCell>
                  <TableCell className="py-[16px]">{court.address}</TableCell>
                  <TableCell className="py-[16px]">
                    {court.totalUnprocessed}
                  </TableCell>
                  <TableCell className="py-[16px]">{court.isOverdue}</TableCell>
                </TableRow>
              ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">$2,500.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
