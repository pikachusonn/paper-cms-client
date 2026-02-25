"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react"; // Import theo ý bạn
import { GET_DASHBOARD_STATS } from "@/lib/graphql/queries/court";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";

const DashboardPage = () => {
  // State quản lý tham số API
  const [year, setYear] = useState<number>(2025); // Biến year (Int!)
  const [tempSearch, setTempSearch] = useState(""); // Lưu giá trị đang gõ
  const [appliedSearch, setAppliedSearch] = useState(""); // Giá trị thực tế dùng để query

  // 1. Gọi API với các biến từ Input
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_STATS, {
    variables: {
      year: year,
      searchCourt: appliedSearch,
    },
    fetchPolicy: "cache-and-network",
  });

  // Hàm xử lý tìm kiếm khi nhấn nút kính lúp
  const handleSearch = () => {
    setAppliedSearch(tempSearch);
  };

  // Hàm xử lý khi nhấn Enter ở ô search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const stats = data?.dashboardStats;
  const courts = stats?.courts || [];

  return (
    <div className="min-h-screen p-4 flex flex-col gap-6 bg-[#f8f9fa]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium">
          Quản lý giấy tờ
        </span>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-bold text-xl text-black hover:text-black"
              >
                Quản lý giấy tờ
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* --- PHẦN 1: SUMMARY BAR CÓ Ô NHẬP NĂM --- */}
      <div className="grid grid-cols-5 gap-0 bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex flex-col p-6 border-r">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-medium tracking-tighter">
              {stats?.totalWaiting || 0}
            </span>
            <span className="text-[11px] text-gray-500 font-medium leading-[1.2] mb-1">
              Giấy tờ chưa
              <br />
              tống đạt
            </span>
          </div>
        </div>

        <div className="flex flex-col p-6 border-r">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-medium tracking-tighter text-[#eb5211]">
              {stats?.totalOverdue || 0}
              <span className="text-2xl ml-1">🔥</span>
            </span>
            <span className="text-[11px] text-gray-500 font-medium leading-[1.2] mb-1">
              Giấy tờ quá
              <br />
              hạn tống đạt
            </span>
          </div>
        </div>

        <div className="flex flex-col p-6 border-r">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-medium tracking-tighter">
              {stats?.totalStaff || 0}
            </span>
            <span className="text-[11px] text-gray-500 font-medium leading-[1.2] mb-1">
              Nhân viên nhập
              <br />
              liệu
            </span>
          </div>
        </div>

        <div className="flex flex-col p-6 border-r">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-medium tracking-tighter">
              {stats?.totalSecretary || 0}
            </span>
            <span className="text-[11px] text-gray-500 font-medium leading-[1.2] mb-1">
              Thư ký
            </span>
          </div>
        </div>

        {/* Ô NHẬP NĂM (YEAR INPUT) */}
        <div className="flex flex-col p-6 justify-center items-end bg-gray-50/50">
          <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">
            Số liệu thống kê năm
          </span>
          <Input
            type="number"
            className="w-20 h-10 text-xl font-black text-right bg-transparent border-none focus-visible:ring-0 p-0"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* --- PHẦN 2: SEARCH BAR CÓ NÚT TÌM KIẾM --- */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm kiếm tòa án"
            className="pl-4 h-14 bg-white border-gray-200 rounded-xl text-lg shadow-sm focus-visible:ring-blue-500"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          onClick={handleSearch}
          className="h-14 w-14 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 shadow-sm"
        >
          <CiSearch size={28} />
        </Button>
      </div>

      {/* --- TABLE DANH SÁCH --- */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-gray-400 italic">
            Đang cập nhật danh sách...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="w-[80px] text-center font-bold text-gray-700">
                  STT
                </TableHead>
                <TableHead className="font-bold text-gray-700">
                  Tên Tòa Án
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Đợi tống đạt
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Quá hạn
                </TableHead>
                <TableHead className="text-right pr-8 font-bold text-gray-700">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-24 text-gray-400 italic"
                  >
                    Không tìm thấy tòa án nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                courts.map((court: any, index: number) => (
                  <TableRow
                    key={court.id}
                    className="group hover:bg-blue-50/30 transition-all border-b border-gray-100"
                  >
                    <TableCell className="text-center text-gray-400 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 uppercase tracking-wide">
                      {court.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full min-w-[40px]">
                        {court.waitingCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-full min-w-[40px] ${
                          court.overdueCount > 0
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {court.overdueCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Link href={`/court/${court.id}`}>
                        <Button
                          variant="ghost"
                          className="text-blue-600 font-bold hover:text-blue-800 hover:bg-blue-100/50 rounded-lg"
                        >
                          Chi tiết →
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
