/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import * as XLSX from "xlsx";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

// [UPDATED] Import API lấy danh sách thư ký Public
import {
  PUBLIC_CREATE_BULK_DOCUMENTS,
  PUBLIC_GET_OFFICIALS,
} from "@/lib/graphql/queries/document";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HiUpload, HiShieldExclamation, HiDocumentText } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function PublicImportContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [excelData, setExcelData] = useState<any[]>([]);
  const [bulkErrors, setBulkErrors] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // State khóa giao diện nếu Token lỗi
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [publicCreateBulkDocs] = useMutation(PUBLIC_CREATE_BULK_DOCUMENTS);

  // 1. KHI TRANG LOAD: KIỂM TRA ĐỊNH DẠNG & THỜI HẠN TOKEN
  useEffect(() => {
    if (!token) {
      setIsTokenInvalid(true);
      setErrorMessage("Đường link không hợp lệ hoặc thiếu mã bảo mật!");
      return;
    }

    if (token.split(".").length !== 3) {
      setIsTokenInvalid(true);
      setErrorMessage("Mã bảo mật đã bị hỏng hoặc cố tình can thiệp!");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp < currentTime) {
        setIsTokenInvalid(true);
        setErrorMessage(
          "Đường link này đã hết hạn (sau 30 phút). Vui lòng xin cấp link mới từ Quản trị viên!",
        );
      }
    } catch (error) {
      setIsTokenInvalid(true);
      setErrorMessage("Mã bảo mật không hợp lệ!");
    }
  }, [token]);

  // 2. [NEW] GỌI API PUBLIC LẤY DANH SÁCH THƯ KÝ BẰNG TOKEN URL
  const { data: officialsData } = useQuery(PUBLIC_GET_OFFICIALS, {
    variables: { token: token },
    skip: !token || isTokenInvalid, // Đợi có token xịn mới gọi
  });

  const officials =
    officialsData?.publicGetOfficials?.filter((o: any) => !o.isDeleted) || [];

  // --- HÀM TẢI FILE EXCEL MẪU ---
  const handleDownloadTemplate = () => {
    const headers = [
      "Số, ký hiệu",
      "Giấy tờ, hồ sơ, tài liệu",
      "Người được tống đạt",
      "Địa chỉ",
      "Ngày nhận văn bản",
      "Thời hạn tống đạt",
      "Thư ký",
      "Hình thức tống đạt",
      "Nội dung văn bản",
      "Số km",
      "Chi phí tống đạt đối với",
      "Niêm yết",
      "Xăng xe",
      "Chi phí khác",
      "Tổng chi phí (nội tỉnh)",
      "Tổng chi phí (ngoại tỉnh)",
    ];
    const sampleData = [
      "Số 164/TB-TA",
      "Thông báo thụ lý vụ án",
      "Nguyễn Văn A",
      "Số 1, đường ABC, Hà Nội",
      "26/12/2025",
      "31/12/2025",
      "Tên thư ký A",
      "Trực tiếp",
      "Thông báo nộp tiền",
      15,
      150000,
      50000,
      30000,
      0,
      230000,
      0,
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    worksheet["!cols"] = headers.map((h) => ({
      wch: Math.max(h.length + 5, 15),
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Mau");
    XLSX.writeFile(workbook, "Template_Nhap_Giay_To.xlsx");
  };

  // --- HÀM XỬ LÝ EXCEL ---
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const findKey = (row: any, keyword: string) => {
      return Object.keys(row).find((k) =>
        k.toLowerCase().includes(keyword.toLowerCase()),
      );
    };

    const formatDate = (val: any) => {
      if (!val) return null;
      if (val instanceof Date)
        return isNaN(val.getTime()) ? null : val.toISOString();
      if (typeof val === "number") {
        const unixDate = new Date((val - 25569) * 86400 * 1000);
        return isNaN(unixDate.getTime()) ? null : unixDate.toISOString();
      }
      if (typeof val === "string") {
        const parts = val.split(/[-/]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const dateObj = new Date(Date.UTC(year, month, day));
          if (!isNaN(dateObj.getTime())) return dateObj.toISOString();
        }
        const fallbackDate = new Date(val);
        return isNaN(fallbackDate.getTime())
          ? null
          : fallbackDate.toISOString();
      }
      return null;
    };

    const mappedData = jsonData
      .map((row: any, index: number) => {
        const docCodeKey =
          findKey(row, "loại văn bản") || findKey(row, "số, ký hiệu");
        const docTypeKey = findKey(row, "giấy tờ, hồ sơ, tài liệu");
        const recipientKey =
          findKey(row, "người được tống đạt") || findKey(row, "đương sự");
        const addressKey = findKey(row, "địa chỉ");
        const receivedDateKey = findKey(row, "ngày nhận văn bản");
        const dueDateKey = findKey(row, "thời hạn tống đạt");
        const officialKey = findKey(row, "thư ký") || findKey(row, "cán bộ");
        const contentKey = findKey(row, "nội dung văn bản");
        const deliveryMethodKey = findKey(row, "hình thức tống đạt");

        return {
          _rowIndex: index + 2,
          docCode: docCodeKey ? String(row[docCodeKey]).trim() : "",
          docType: docTypeKey ? String(row[docTypeKey]).trim() : "Văn bản",
          recipient: recipientKey ? String(row[recipientKey]).trim() : "",
          address: addressKey ? String(row[addressKey]).trim() : "",
          receivedDate: formatDate(row[receivedDateKey]),
          dueDate:
            formatDate(row[dueDateKey]) ||
            formatDate(row[receivedDateKey]) ||
            new Date().toISOString(),
          responsibleOfficialName: officialKey
            ? String(row[officialKey]).trim()
            : "",
          deliveryMethod: deliveryMethodKey
            ? String(row[deliveryMethodKey]).trim()
            : "",
          content: contentKey ? String(row[contentKey]).trim() : "",
          distance: parseFloat(row[findKey(row, "số km") || ""]) || 0,
          deliveryFee:
            parseFloat(row[findKey(row, "chi phí tống đạt đối với") || ""]) ||
            0,
          accommodationFee:
            parseFloat(row[findKey(row, "niêm yết") || ""]) || 0,
          fuelFee: parseFloat(row[findKey(row, "xăng xe") || ""]) || 0,
          otherFee: parseFloat(row[findKey(row, "chi phí khác") || ""]) || 0,
          totalFeeInternal:
            parseFloat(row[findKey(row, "tổng chi phí (nội tỉnh)") || ""]) || 0,
          totalFeeExternal:
            parseFloat(row[findKey(row, "tổng chi phí (ngoại tỉnh)") || ""]) ||
            0,
        };
      })
      .filter((row) => {
        if (!row.docCode && !row.recipient) return false;
        return true;
      });

    setExcelData(mappedData);
    setBulkErrors([]);
    e.target.value = "";
  };

  const handleEditCell = (rowIndex: number, field: string, value: any) => {
    setExcelData((prev) =>
      prev.map((row) =>
        row._rowIndex === rowIndex ? { ...row, [field]: value } : row,
      ),
    );
    setBulkErrors((prev) => prev.filter((err) => err.rowIndex !== rowIndex));
  };

  const handleDeleteRow = (rowIndex: number) => {
    setExcelData((prev) => prev.filter((row) => row._rowIndex !== rowIndex));
    setBulkErrors((prev) => prev.filter((err) => err.rowIndex !== rowIndex));
  };

  // --- HÀM CHUNKING GỌI API PUBLIC ---
  const handleSubmitBulk = async () => {
    if (excelData.length === 0 || isTokenInvalid) return;

    setIsImporting(true);
    setImportProgress(0);
    let totalSuccess = 0;
    let allErrors: any[] = [];

    const fullPayload = excelData.map(({ _rowIndex, ...rest }) => ({
      courtId: "auto-from-token",
      _rowIndex,
      ...rest,
    }));

    const codeMap = new Map<string, number>();
    const localErrors: any[] = [];

    // Check lỗi Local
    fullPayload.forEach((row) => {
      if (
        !row.responsibleOfficialName ||
        row.responsibleOfficialName.trim() === ""
      ) {
        localErrors.push({
          rowIndex: row._rowIndex,
          message: "Thiếu Tên Thư ký",
        });
      }
      if (!row.docCode || row.docCode.trim() === "") {
        localErrors.push({ rowIndex: row._rowIndex, message: "Thiếu Mã VB" });
        return;
      }
      const normalizedCode = row.docCode.trim().toLowerCase();
      if (codeMap.has(normalizedCode)) {
        localErrors.push({
          rowIndex: row._rowIndex,
          message: `Trùng mã với dòng ${codeMap.get(normalizedCode)}`,
        });
      } else {
        codeMap.set(normalizedCode, row._rowIndex);
      }
    });

    if (localErrors.length > 0) {
      toast.error("Phát hiện lỗi dữ liệu! Vui lòng sửa các ô màu đỏ.");
      setBulkErrors(localErrors);
      setIsImporting(false);
      return;
    }

    const CHUNK_SIZE = 50;
    const totalChunks = Math.ceil(fullPayload.length / CHUNK_SIZE);

    try {
      for (let i = 0; i < fullPayload.length; i += CHUNK_SIZE) {
        const chunk = fullPayload.slice(i, i + CHUNK_SIZE);

        const { data } = await publicCreateBulkDocs({
          variables: { token, inputs: chunk },
        });

        const result = data.publicCreateBulkDocuments;
        totalSuccess += result.successCount;
        if (result.errors?.length > 0)
          allErrors = [...allErrors, ...result.errors];

        setImportProgress(
          Math.round(((Math.floor(i / CHUNK_SIZE) + 1) / totalChunks) * 100),
        );
      }

      if (allErrors.length > 0) {
        toast.error(
          `Hoàn tất! Lưu thành công ${totalSuccess} dòng. Còn ${allErrors.length} dòng bị lỗi.`,
        );
        const errorRowIndexes = allErrors.map((err) => err.rowIndex);
        setExcelData((prev) =>
          prev.filter((row) => errorRowIndexes.includes(row._rowIndex)),
        );
        setBulkErrors(allErrors);
      } else {
        toast.success(
          `Tuyệt vời! Đã nộp thành công ${totalSuccess} dòng dữ liệu.`,
        );
        setExcelData([]);
      }
    } catch (error: any) {
      console.error("Chi tiết lỗi BE trả về:", error);

      const errMsg = error?.message?.toLowerCase() || "";
      const graphQLErrors = error?.graphQLErrors || [];

      const isAuthError =
        errMsg.includes("unauthorized") ||
        errMsg.includes("token") ||
        errMsg.includes("expired") ||
        errMsg.includes("forbidden") ||
        errMsg.includes("hợp lệ") ||
        errMsg.includes("hết hạn") ||
        graphQLErrors.some(
          (err: any) =>
            err.extensions?.code === "UNAUTHENTICATED" ||
            err.extensions?.code === "FORBIDDEN" ||
            err.extensions?.code === "BAD_USER_INPUT",
        );

      if (isAuthError) {
        setIsTokenInvalid(true);
        setErrorMessage(
          "Đường link này đã hết hạn (sau 30 phút) hoặc không hợp lệ. Vui lòng xin cấp link mới từ Quản trị viên!",
        );
        toast.error("Giao dịch bị từ chối: Mã bảo mật không hợp lệ!");
      } else {
        toast.error(
          `Lỗi hệ thống: ${error?.message || "Vui lòng thử lại sau."}`,
        );
      }
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-100">
        <div className="bg-blue-900 text-white p-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            Cổng Nhập Liệu Tòa Án
          </h1>
          <p className="text-blue-200 mt-1">
            Giao diện tải dữ liệu Excel trực tiếp lên hệ thống
          </p>
        </div>

        <div className="p-8 flex-1 flex flex-col items-center w-full">
          {isTokenInvalid ? (
            <div className="my-20 flex flex-col items-center text-center max-w-md">
              <HiShieldExclamation size={80} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Truy cập bị từ chối
              </h2>
              <p className="text-red-600 font-medium">{errorMessage}</p>
            </div>
          ) : excelData.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-6 w-full max-w-[600px] mx-auto">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full border-dashed border-2 py-8 text-blue-600 bg-blue-50 hover:bg-blue-100 text-lg"
              >
                <HiDocumentText size={28} className="mr-2" /> Tải File Excel Mẫu
              </Button>

              <span className="text-sm font-bold text-gray-400">
                --- HOẶC ---
              </span>

              <Label className="w-full border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                <HiUpload size={60} className="text-blue-500 mb-4" />
                <span className="text-lg font-bold text-blue-900 mb-1">
                  Click để tải file Excel lên
                </span>
                <span className="text-sm font-medium text-gray-500">
                  Chỉ hỗ trợ file .xlsx, .xls
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleExcelUpload}
                />
              </Label>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-800 text-lg">
                  Đã bóc tách được {excelData.length} văn bản.
                </span>
                <Button
                  variant="outline"
                  disabled={isImporting}
                  onClick={() => {
                    setExcelData([]);
                    setBulkErrors([]);
                  }}
                >
                  Tải file khác
                </Button>
              </div>

              <div className="border rounded-xl max-h-[60vh] overflow-x-auto overflow-y-auto shadow-inner bg-gray-50/30">
                <Table className="relative whitespace-nowrap min-w-max">
                  <TableHeader className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                    <TableRow>
                      <TableHead className="w-[50px] text-center sticky left-0 z-30 bg-gray-100 border-r">
                        Dòng
                      </TableHead>
                      <TableHead className="min-w-[180px]">Mã VB</TableHead>
                      <TableHead className="min-w-[180px]">
                        Người nhận
                      </TableHead>
                      <TableHead className="min-w-[180px]">Thư ký</TableHead>
                      <TableHead className="min-w-[200px]">Nội dung</TableHead>
                      <TableHead className="text-right">Tổng Nội</TableHead>
                      <TableHead className="text-right">Tổng Ngoại</TableHead>
                      <TableHead className="w-[60px] text-center sticky right-0 bg-gray-100 border-l shadow-sm z-30">
                        Xóa
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelData.map((row: any) => {
                      const rowError = bulkErrors.find(
                        (e) => e.rowIndex === row._rowIndex,
                      );
                      return (
                        <TableRow
                          key={row._rowIndex}
                          className={`group ${rowError ? "bg-red-50 hover:bg-red-100/50" : "hover:bg-blue-50/30"}`}
                        >
                          <TableCell className="font-bold text-gray-500 text-center sticky left-0 bg-inherit border-r z-10">
                            {row._rowIndex}
                          </TableCell>
                          <TableCell className="p-1">
                            <Input
                              value={row.docCode}
                              onChange={(e) =>
                                handleEditCell(
                                  row._rowIndex,
                                  "docCode",
                                  e.target.value,
                                )
                              }
                              className={`h-8 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-blue-500 focus:bg-white bg-transparent transition-all shadow-none ${!row.docCode ? "border-red-500 bg-red-100/50" : "border-transparent"}`}
                            />
                          </TableCell>
                          <TableCell className="p-1">
                            <Input
                              value={row.recipient}
                              onChange={(e) =>
                                handleEditCell(
                                  row._rowIndex,
                                  "recipient",
                                  e.target.value,
                                )
                              }
                              className={`h-8 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 focus:bg-white bg-transparent transition-all shadow-none ${!row.recipient ? "border-red-500 bg-red-100/50" : "border-transparent"}`}
                            />
                          </TableCell>

                          {/* DROPDOWN CHỌN THƯ KÝ - LẤY TỪ DATA CỦA BE TRẢ VỀ */}
                          <TableCell className="p-1">
                            <Select
                              value={row.responsibleOfficialName || ""}
                              onValueChange={(val) =>
                                handleEditCell(
                                  row._rowIndex,
                                  "responsibleOfficialName",
                                  val,
                                )
                              }
                            >
                              <SelectTrigger
                                className={`h-8 text-xs shadow-none transition-all ${!row.responsibleOfficialName ? "border-red-500 bg-red-100/50" : "border-transparent bg-transparent hover:bg-white"}`}
                              >
                                <SelectValue placeholder="Chọn thư ký..." />
                              </SelectTrigger>
                              <SelectContent>
                                {officials.map((off: any) => (
                                  <SelectItem
                                    key={off.id}
                                    value={off.name}
                                    className="text-xs"
                                  >
                                    {off.name} ({off.title})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell
                            className="max-w-[200px] truncate"
                            title={row.content}
                          >
                            {row.content || "---"}
                          </TableCell>
                          <TableCell className="font-bold text-blue-600 text-right">
                            {row.totalFeeInternal?.toLocaleString("vi-VN")}
                          </TableCell>
                          <TableCell className="font-bold text-purple-600 text-right">
                            {row.totalFeeExternal?.toLocaleString("vi-VN")}
                          </TableCell>
                          <TableCell className="p-0 text-center sticky right-0 border-l bg-inherit backdrop-blur-md z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 rounded-full"
                              onClick={() => handleDeleteRow(row._rowIndex)}
                              title={
                                rowError ? rowError.message : "Xóa dòng này"
                              }
                            >
                              <HiXMark size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSubmitBulk}
                  className="bg-black hover:bg-gray-800 text-white px-10 py-6 text-lg rounded-xl shadow-lg"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang đẩy dữ liệu {importProgress}%...</span>
                    </div>
                  ) : (
                    "Nộp dữ liệu lên hệ thống"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicImportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Đang tải dữ liệu...
          </div>
        </div>
      }
    >
      <PublicImportContent />
    </Suspense>
  );
}
