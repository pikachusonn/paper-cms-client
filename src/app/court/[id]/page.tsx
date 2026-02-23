"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/dateRangePicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PROCESS_STATUS } from "@/constant/common";
import clsx from "clsx";
import { format, isBefore } from "date-fns";
import { CiFilter } from "react-icons/ci";
import { GoSortAsc } from "react-icons/go";

const courtDetail = () => {
  const documents = [
    {
      id: 1,
      receiveDate: "2025-01-26T11:29:37.160+07:00",
      documentCode: "HE18",
      content: "CONTENT",
      processAddress: "167 phùng khắc khoan, thị xã Sơn tây, Hà Nội",
      processDeadline: "2026-01-30T11:30:37.160+07:00",
      processStatus: PROCESS_STATUS.PENDING,
      totalPrice: 10000000,
    },
    {
      id: 2,
      receiveDate: "2025-02-15T09:15:12.000+07:00",
      documentCode: "HD21",
      content: "Hồ sơ đăng ký kinh doanh",
      processAddress: "45 nguyễn trãi, thanh xuân, Hà Nội",
      processDeadline: "2025-03-01T17:00:00.000+07:00",
      processStatus: PROCESS_STATUS.PROCESSED,
      totalPrice: 5500000,
    },
    {
      id: 3,
      receiveDate: "2025-03-05T14:45:00.000+07:00",
      documentCode: "PL09",
      content: "Cấp phép xây dựng",
      processAddress: "22 lê lợi, hà đông, Hà Nội",
      processDeadline: "2025-04-10T16:30:00.000+07:00",
      processStatus: PROCESS_STATUS.FINISHED,
      totalPrice: 23000000,
    },
    {
      id: 4,
      receiveDate: "2025-04-12T08:20:00.000+07:00",
      documentCode: "GT56",
      content: "Gia hạn giấy tờ",
      processAddress: "88 trần duy hưng, cầu giấy, Hà Nội",
      processDeadline: "2025-05-20T11:00:00.000+07:00",
      processStatus: PROCESS_STATUS.PENDING,
      totalPrice: 7800000,
    },
    {
      id: 5,
      receiveDate: "2025-05-01T10:00:00.000+07:00",
      documentCode: "HS77",
      content: "Hồ sơ chuyển nhượng",
      processAddress: "12 kim mã, ba đình, Hà Nội",
      processDeadline: "2025-06-15T15:00:00.000+07:00",
      processStatus: PROCESS_STATUS.PROCESSED,
      totalPrice: 12500000,
    },
    {
      id: 6,
      receiveDate: "2025-06-18T13:10:00.000+07:00",
      documentCode: "DN33",
      content: "Đăng ký doanh nghiệp",
      processAddress: "101 phạm hùng, nam từ liêm, Hà Nội",
      processDeadline: "2025-07-25T16:00:00.000+07:00",
      processStatus: PROCESS_STATUS.FINISHED,
      totalPrice: 18000000,
    },
    {
      id: 7,
      receiveDate: "2025-07-09T09:40:00.000+07:00",
      documentCode: "XD88",
      content: "Thẩm định thiết kế",
      processAddress: "9 hồ tùng mậu, bắc từ liêm, Hà Nội",
      processDeadline: "2025-08-30T14:00:00.000+07:00",
      processStatus: PROCESS_STATUS.PENDING,
      totalPrice: 32000000,
    },
    {
      id: 8,
      receiveDate: "2025-08-20T11:25:00.000+07:00",
      documentCode: "TC11",
      content: "Thủ tục thuế",
      processAddress: "66 đội cấn, ba đình, Hà Nội",
      processDeadline: "2025-09-15T17:30:00.000+07:00",
      processStatus: PROCESS_STATUS.PROCESSED,
      totalPrice: 6400000,
    },
  ];

  const getStatusColor = (status: PROCESS_STATUS) => {
    switch (status) {
      case PROCESS_STATUS.PENDING:
        return (
          <span className="text-[#eb5211] font-semibold">đợi tống đạt</span>
        );
      case PROCESS_STATUS.PROCESSED:
        return (
          <span className="text-yellow-500 font-semibold">đã tống đạt</span>
        );
      case PROCESS_STATUS.FINISHED:
        return (
          <span className="text-[#47CC17] font-semibold">đã tống đạt</span>
        );
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4">
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

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="font-semibold text-[16px]">
              Toà án Sơn Tây
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <p>
        <span className="text-[20px] font-bold text-red-500">1</span> giấy tờ
        quá hạn tống đạt,{" "}
        <span className="text-[20px] font-bold text-orange-400">2</span> giấy tờ
        đang đợi tống đạt
      </p>
      <div className="flex items-center justify-between">
        <div className={clsx("flex items-center gap-4")}>
          <CiFilter size={24} />
          <DateRangePicker />
          <Select value="all">
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Lọc giấy tờ" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="unprocessed">Đợi tống đạt</SelectItem>
                <SelectItem value="blueberry">Đã tống đạt</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <GoSortAsc size={24} />
            <span>Hạn tống đạt</span>
          </div>
        </div>
        <Button>Thêm giấy tờ</Button>
      </div>

      <div className="border rounded-md max-h-[65vh] overflow-y-auto">
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-white border-b border-black!">
            <TableRow>
              <TableHead className="w-[5%] py-[16px]">STT</TableHead>
              <TableHead className="w-[10%] py-[16px]">Mã</TableHead>
              <TableHead className="w-[15%] py-[16px]">Nội dung</TableHead>
              <TableHead className="w-[20%] py-[16px]">Địa chỉ</TableHead>
              <TableHead className="w-[12%] py-[16px]">Ngày nhận</TableHead>
              <TableHead className="w-[12%] py-[16px]">Hạn</TableHead>
              <TableHead className="w-[12%] py-[16px]">Trạng thái</TableHead>
              <TableHead className="w-[14%] py-[16px]">Tổng tiền</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {documents
              ?.sort(
                (d1, d2) =>
                  new Date(d2.processDeadline).getTime() -
                  new Date(d1.processDeadline).getTime(),
              )
              .map((doc, index) => {
                const deadline = new Date(doc.processDeadline);

                const isOverdue =
                  doc.processStatus === PROCESS_STATUS.PENDING &&
                  isBefore(deadline, new Date());

                return (
                  <TableRow
                    key={doc.id}
                    className={clsx(
                      isOverdue ? "bg-[#FFBB00]/30" : "",
                      "hover:border-black border-t! hover:bg-gray-100",
                    )}
                  >
                    <TableCell className="py-[16px] font-medium">
                      {index + 1}
                    </TableCell>

                    <TableCell className="py-[16px] font-medium">
                      {doc.documentCode}
                    </TableCell>

                    <TableCell className="py-[16px] max-w-[200px]">
                      {doc.content}
                    </TableCell>

                    <TableCell className="py-[16px] max-w-[250px] whitespace-normal break-words">
                      {doc.processAddress}
                    </TableCell>

                    <TableCell className="py-[16px]">
                      {format(new Date(doc.receiveDate), "dd/MM/yyyy")}
                    </TableCell>

                    <TableCell className="py-[16px]">
                      {format(deadline, "dd/MM/yyyy")}
                    </TableCell>

                    <TableCell className="py-[16px]">
                      {getStatusColor(doc.processStatus)}
                    </TableCell>

                    <TableCell className="py-[16px]">
                      {doc.totalPrice.toLocaleString("vi-VN")} ₫
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default courtDetail;
