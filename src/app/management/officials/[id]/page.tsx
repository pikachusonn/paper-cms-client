/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_DOCUMENTS_BY_COURT } from "@/lib/graphql/queries/document";
import { GET_OFFICIALS_DETAILS } from "@/lib/graphql/queries/officials";
import { formatVND } from "@/lib/utils";
import { useQuery } from "@apollo/client/react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
interface DatPickerProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
}

const DatePicker = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: DatPickerProps) => {
  return (
    <div className="flex items-center gap-2 border rounded-md px-3 py-1.5">
      <Input
        type="date"
        className="border-0 p-0 h-8 focus-visible:ring-0"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <span className="text-gray-400">-</span>
      <Input
        type="date"
        className="border-0 p-0 h-8 focus-visible:ring-0"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>
  );
};

const OfficialDetail = () => {
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );

  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [page, setPage] = useState(1);

  const params = useParams();
  const staffId = params.id;

  const { data } = useQuery(GET_OFFICIALS_DETAILS, {
    variables: {
      id: staffId,
    },
    fetchPolicy: "cache-and-network",
  });

  const staffData = useMemo(() => {
    return (data as any)?.courtStaff;
  }, [data]);

  const { data: docsData, refetch: refetchDocs } = useQuery(
    GET_DOCUMENTS_BY_COURT,
    {
      variables: {
        filter: {
          courtId: staffData?.court?.id,
          officialId: staffId,
          page: page || 1,
          limit: 50,
          fromDate: new Date(
            startDate || format(startOfMonth(new Date()), "yyyy-MM-dd"),
          ).toISOString(),
          toDate: new Date(
            endDate || format(endOfMonth(new Date()), "yyyy-MM-dd"),
          ).toISOString(),
        },
      },
      skip: !staffData?.court?.id || !staffId,
    },
  );

  const documents = useMemo(() => {
    return (docsData as any)?.getDocumentsByCourt?.data || [];
  }, [docsData]);

  const getPages = () => {
    const pages: (number | "...")[] = [];
    const totalPage = Math.ceil(
      (docsData as any)?.getDocumentsByCourt?.total / 50,
    );
    if (totalPage <= 5) {
      return Array.from({ length: totalPage }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPage - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPage - 2) pages.push("...");

    pages.push(totalPage);
    return pages;
  };

  const totalFee = useMemo(() => {
    return documents?.reduce((sum: number, doc: any) => {
      const totalDisplay =
        doc?.distance <= 25 ? 14000 : doc?.distance <= 200 ? 29000 : 30000;
      const value = Number(String(totalDisplay || 0).replace(/\./g, ""));
      return sum + value;
    }, 0);
  }, [documents]);

  return (
    <div className="min-h-screen p-5 flex flex-col gap-[16px] bg-[#fafafa]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/management" className="">
              Quản lý nhân sự
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{staffData?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h5 className="text-[18px] font-semibold">Chi tiết thư kí</h5>
      <div className="flex items-stretch gap-[32px] justify-between">
        <div className="grid grid-cols-[140px_1fr]">
          <h6 className="font-semibold">Tên:</h6>
          <span>{staffData?.name}</span>

          <h6 className="font-semibold">Số điện thoại:</h6>
          <span>{staffData?.phone}</span>

          <h6 className="font-semibold">Toà án:</h6>
          <a
            href={`/court/${staffData?.court?.id}`}
            className="text-blue-500 underline"
          >
            {staffData?.court?.name}
          </a>
        </div>

        <div className="border rounded-md flex items-center shadow-md bg-white flex-1 pr-[8px]">
          <div className="flex items-center gap-[8px] py-[8px] px-[20px] h-full flex-2">
            <span className="font-semibold">Ngày nhận</span>
            <DatePicker
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </div>
          <div className="flex items-center justify-end gap-[8px] p-[8px] h-full flex-1">
            <span className="font-semibold">Tổng giấy tờ phục trách:</span>
            <span>{documents?.length || 0}</span>
          </div>
          <div className="flex items-center justify-end gap-[8px] p-[8px] h-full flex-1">
            <span className="font-semibold">Tổng chi phí:</span>
            <span>{formatVND(totalFee)} vnđ</span>
          </div>
        </div>
      </div>
      <h5 className="text-[18px] font-semibold">Danh sách giấy tờ tống đạt</h5>
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Ngày Tống Đạt</TableHead>
              <TableHead>Mã văn bản</TableHead>
              <TableHead className="max-w-[200px]">Được tống đạt</TableHead>
              <TableHead>Hạn tống đạt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="">
                <span>Tổng chi phí tống đạt</span>&nbsp;
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-gray-400"
                >
                  Không có giấy tờ nào.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc: any, index: number) => {
                const totalDisplay =
                  doc?.distance <= 25
                    ? 14000
                    : doc?.distance <= 200
                      ? 29000
                      : 30000;

                // Note: Quá hạn có thể đè lên màu nếu status chưa phải là CONFIRMED
                const isOverdueVisual =
                  doc.status === "OVERDUE" || doc.isOverdue;

                return (
                  <TableRow
                    key={doc.id}
                    className={`transition-colors ${isOverdueVisual && doc.status !== "CONFIRMED" ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}
                  >
                    <TableCell className="font-medium text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-bold">
                      {doc.receivedDate
                        ? new Date(doc.receivedDate).toLocaleDateString("vi-VN")
                        : "---"}
                    </TableCell>
                    <TableCell className="font-bold text-gray-800">
                      {doc.docCode}
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={`${doc.recipient} - ${doc.address}`}
                    >
                      <p className="font-bold">{doc.recipient}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {doc.address}
                      </p>
                    </TableCell>
                    <TableCell
                      className={
                        isOverdueVisual && doc.status !== "CONFIRMED"
                          ? "text-red-600 font-bold"
                          : "font-medium"
                      }
                    >
                      {doc.dueDate
                        ? new Date(doc.dueDate).toLocaleDateString("vi-VN")
                        : "---"}
                    </TableCell>

                    {/* ========================================================
                        [LOGIC TRẠNG THÁI MỚI CHUẨN 3 BƯỚC BE] 
                        ======================================================== */}
                    <TableCell>
                      {/* B1: WAITING -> Đợi tống đạt (Cam) */}
                      {doc.status === "WAITING" && !isOverdueVisual && (
                        <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded font-bold text-xs">
                          Đợi tống đạt
                        </span>
                      )}

                      {/* B2: COMPLETED -> Đã tống đạt (Chờ Admin xác nhận) (Xanh lam) */}
                      {doc.status === "COMPLETED" && !isOverdueVisual && (
                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold text-xs">
                          Đã tống đạt
                        </span>
                      )}

                      {/* B3: CONFIRMED -> Đã xác nhận (Xanh lá) */}
                      {doc.status === "CONFIRMED" && (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded font-bold text-xs border border-green-200">
                          Đã xác nhận
                        </span>
                      )}

                      {/* QUÁ HẠN (Đỏ) - Chỉ hiển thị đỏ nếu chưa chốt CONFIRMED */}
                      {isOverdueVisual && doc.status !== "CONFIRMED" && (
                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded font-bold text-xs border border-red-200">
                          Quá hạn
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="font-bold">
                      {totalDisplay.toLocaleString("vi-VN")} vnđ
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent>
          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((prev) => prev - 1);
              }}
            />
          </PaginationItem>

          {/* Page numbers */}
          {getPages().map((p, index) => (
            <PaginationItem key={index}>
              {p === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((prev) => prev + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default OfficialDetail;
