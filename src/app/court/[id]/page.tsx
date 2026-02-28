/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import * as XLSX from "xlsx";

import {
  GET_DOCUMENTS_BY_COURT,
  GET_OFFICIALS_BY_COURT,
  CREATE_DOCUMENT,
  UPDATE_DOCUMENT,
  DELETE_DOCUMENT,
  CREATE_BULK_DOCUMENTS,
} from "@/lib/graphql/queries/document";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { CiSearch } from "react-icons/ci";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiPlus,
  HiFilter,
  HiUpload,
  HiDocumentText,
  HiOutlineCloudUpload,
} from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";
import { IoChevronBackOutline } from "react-icons/io5";
import { toast } from "sonner";

const CourtDocumentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const courtId = params.id as string;

  // --- STATES BỘ LỌC ---
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "ALL",
    search: "",
  });

  // --- STATES MODALS ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // --- STATES CHO EXCEL PREVIEW & TIẾN ĐỘ ---
  const [excelData, setExcelData] = useState<any[]>([]);
  const [bulkErrors, setBulkErrors] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // --- STATE FORM DATA ---
  const initialForm = {
    docCode: "",
    docType: "",
    receivedDate: "",
    dueDate: "",
    deliveryMethod: "",
    responsibleOfficialId: "",
    content: "",
    recipient: "",
    address: "",
    evidenceUrl: "",
    distance: 0,
    deliveryFee: 0,
    accommodationFee: 0,
    fuelFee: 0,
    otherFee: 0,
    totalFeeInternal: 0,
    totalFeeExternal: 0,
  };
  const [formData, setFormData] = useState<any>(initialForm);

  // --- API QUERIES ---
  const { data: officialsData } = useQuery(GET_OFFICIALS_BY_COURT, {
    variables: { courtId },
    skip: !courtId,
  });

  const { data: docsData, refetch: refetchDocs } = useQuery(
    GET_DOCUMENTS_BY_COURT,
    {
      variables: {
        filter: {
          courtId,
          page: 1,
          limit: 50,
          search: filters.search || undefined,
          status: filters.status !== "ALL" ? filters.status : undefined,
          fromDate: filters.startDate
            ? new Date(filters.startDate).toISOString()
            : undefined,
          toDate: filters.endDate
            ? new Date(filters.endDate).toISOString()
            : undefined,
        },
      },
      skip: !courtId,
    },
  );

  // --- API MUTATIONS ---
  const [createDoc] = useMutation(CREATE_DOCUMENT, {
    onCompleted: () => {
      toast.success("Thêm giấy tờ thành công!");
      setIsFormModalOpen(false);
      refetchDocs();
    },
    onError: (err) => toast.error(err.message),
  });

  const [updateDoc] = useMutation(UPDATE_DOCUMENT, {
    onCompleted: () => {
      toast.success("Cập nhật giấy tờ thành công!");
      setIsFormModalOpen(false);
      refetchDocs();
    },
    onError: (err) => toast.error(err.message),
  });

  const [deleteDoc] = useMutation(DELETE_DOCUMENT, {
    onCompleted: () => {
      toast.success("Đã xóa giấy tờ!");
      refetchDocs();
    },
    onError: (err) => toast.error(err.message),
  });

  const [createBulkDocs] = useMutation(CREATE_BULK_DOCUMENTS, {
    onError: (err) => toast.error(err.message),
  });

  // --- HANDLERS (FORM THỦ CÔNG) ---
  const handleOpenCreate = () => {
    setEditingDocId(null);
    setFormData(initialForm);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (doc: any) => {
    setEditingDocId(doc.id);
    setFormData({
      docCode: doc.docCode || "",
      docType: doc.docType || "",
      receivedDate: doc.receivedDate ? doc.receivedDate.split("T")[0] : "",
      dueDate: doc.dueDate ? doc.dueDate.split("T")[0] : "",
      deliveryMethod: doc.deliveryMethod || "",
      responsibleOfficialId: doc.responsibleOfficial?.id || "",
      content: doc.content || "",
      recipient: doc.recipient || "",
      address: doc.address || "",
      evidenceUrl: doc.evidenceUrl || "",
      distance: doc.distance || 0,
      deliveryFee: doc.deliveryFee || 0,
      accommodationFee: doc.accommodationFee || 0,
      fuelFee: doc.fuelFee || 0,
      otherFee: doc.otherFee || 0,
      totalFeeInternal: doc.totalFeeInternal || 0,
      totalFeeExternal: doc.totalFeeExternal || 0,
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = () => {
    const basePayload = {
      docCode: formData.docCode,
      docType: formData.docType,
      recipient: formData.recipient,
      address: formData.address,
      receivedDate: formData.receivedDate
        ? new Date(formData.receivedDate).toISOString()
        : null,
      dueDate: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : null,
      responsibleOfficialId: formData.responsibleOfficialId,
      deliveryMethod: formData.deliveryMethod,
      content: formData.content,
      distance: parseFloat(formData.distance) || 0,
      deliveryFee: parseFloat(formData.deliveryFee) || 0,
      accommodationFee: parseFloat(formData.accommodationFee) || 0,
      fuelFee: parseFloat(formData.fuelFee) || 0,
      otherFee: parseFloat(formData.otherFee) || 0,
      totalFeeInternal: parseFloat(formData.totalFeeInternal) || 0,
      totalFeeExternal: parseFloat(formData.totalFeeExternal) || 0,
    };

    if (editingDocId) {
      updateDoc({
        variables: {
          input: {
            id: editingDocId,
            evidenceUrl: formData.evidenceUrl,
            ...basePayload,
          },
        },
      });
    } else {
      createDoc({
        variables: { input: { courtId, ...basePayload } },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giấy tờ này?")) {
      deleteDoc({ variables: { id } });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, evidenceUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HANDLERS (EXCEL IMPORT) ---
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
      if (val instanceof Date) {
        return isNaN(val.getTime()) ? null : val.toISOString();
      }
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

        const distanceKey = findKey(row, "số km");
        const deliveryFeeKey = findKey(row, "chi phí tống đạt đối với");
        const accommodationFeeKey =
          findKey(row, "hiểm trở") || findKey(row, "niêm yết");
        const fuelFeeKey = findKey(row, "xăng xe");
        const otherFeeKey = findKey(row, "chi phí khác");
        const totalIntKey = findKey(row, "tổng chi phí (nội tỉnh)");
        const totalExtKey = findKey(row, "tổng chi phí (ngoại tỉnh)");

        const isoReceivedDate = formatDate(row[receivedDateKey]);
        const isoDueDate = formatDate(row[dueDateKey]);

        return {
          _rowIndex: index + 2,
          docCode: docCodeKey ? String(row[docCodeKey]).trim() : "",
          docType: docTypeKey ? String(row[docTypeKey]).trim() : "Văn bản",
          recipient: recipientKey ? String(row[recipientKey]).trim() : "",
          address: addressKey ? String(row[addressKey]).trim() : "",
          receivedDate: isoReceivedDate,
          dueDate: isoDueDate || isoReceivedDate || new Date().toISOString(),
          responsibleOfficialName: officialKey
            ? String(row[officialKey]).trim()
            : "",
          deliveryMethod: deliveryMethodKey
            ? String(row[deliveryMethodKey]).trim()
            : "",
          content: contentKey ? String(row[contentKey]).trim() : "",
          distance: distanceKey ? parseFloat(row[distanceKey]) || 0 : 0,
          deliveryFee: deliveryFeeKey
            ? parseFloat(row[deliveryFeeKey]) || 0
            : 0,
          accommodationFee: accommodationFeeKey
            ? parseFloat(row[accommodationFeeKey]) || 0
            : 0,
          fuelFee: fuelFeeKey ? parseFloat(row[fuelFeeKey]) || 0 : 0,
          otherFee: otherFeeKey ? parseFloat(row[otherFeeKey]) || 0 : 0,
          totalFeeInternal: totalIntKey ? parseFloat(row[totalIntKey]) || 0 : 0,
          totalFeeExternal: totalExtKey ? parseFloat(row[totalExtKey]) || 0 : 0,
        };
      })
      .filter((row) => {
        if (!row.docCode && !row.recipient) return false;
        const isDocCodeNumber =
          !isNaN(Number(row.docCode)) && row.docCode.trim() !== "";
        const isRecipientNumber =
          !isNaN(Number(row.recipient)) || row.recipient.trim() === "";
        if (isDocCodeNumber && isRecipientNumber) return false;
        return true;
      });

    setExcelData(mappedData);
    setBulkErrors([]);
    e.target.value = "";
  };

  // --- HÀM TẢI FILE EXCEL MẪU [NEW] ---
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
      "Thông báo nộp tiền tạm ứng án phí",
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

  // Hàm xử lý Edit Cell trực tiếp trên bảng Preview
  const handleEditCell = (rowIndex: number, field: string, value: any) => {
    setExcelData((prev) =>
      prev.map((row) =>
        row._rowIndex === rowIndex ? { ...row, [field]: value } : row,
      ),
    );
    // Xóa lỗi của dòng này để user có thể bấm lưu lại
    setBulkErrors((prev) => prev.filter((err) => err.rowIndex !== rowIndex));
  };

  // Hàm xóa nhanh 1 dòng trên bảng Preview
  const handleDeleteRow = (rowIndex: number) => {
    setExcelData((prev) => prev.filter((row) => row._rowIndex !== rowIndex));
    setBulkErrors((prev) => prev.filter((err) => err.rowIndex !== rowIndex));
  };

  // --- HÀM LƯU HÀNG LOẠT (CHUNKING & VALIDATE LOCAL) ---
  const handleSubmitBulk = async () => {
    if (excelData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    let totalSuccess = 0;
    let allErrors: any[] = [];

    const fullPayload = excelData.map(({ _rowIndex, ...rest }) => ({
      courtId,
      _rowIndex,
      ...rest,
    }));

    // ====================================================================
    // LỚP LỌC 1: VALIDATE NỘI BỘ (THIẾU THƯ KÝ, THIẾU MÃ, TRÙNG MÃ)
    // ====================================================================
    const codeMap = new Map<string, number>();
    const localErrors: any[] = [];

    fullPayload.forEach((row) => {
      // 1. Kiểm tra thiếu Thư ký
      if (
        !row.responsibleOfficialName ||
        row.responsibleOfficialName.trim() === ""
      ) {
        localErrors.push({
          rowIndex: row._rowIndex,
          message: "Vui lòng chọn Thư ký",
        });
      }

      // 2. Kiểm tra thiếu Mã văn bản
      if (!row.docCode || row.docCode.trim() === "") {
        localErrors.push({
          rowIndex: row._rowIndex,
          message: "Mã văn bản không được trống",
        });
        return; // Bỏ qua check trùng mã bên dưới nếu không có mã
      }

      // 3. Kiểm tra trùng lặp Mã văn bản ngay trong bảng
      const normalizedCode = row.docCode.trim().toLowerCase();
      if (codeMap.has(normalizedCode)) {
        localErrors.push({
          rowIndex: row._rowIndex,
          message: `Trùng mã với dòng số ${codeMap.get(normalizedCode)}`,
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

    // ====================================================================
    // LỚP LỌC 2: GỬI LÊN BACKEND (CHUNKING) VÀ BẮT LỖI DATABASE
    // ====================================================================
    const CHUNK_SIZE = 50;
    const totalChunks = Math.ceil(fullPayload.length / CHUNK_SIZE);

    try {
      for (let i = 0; i < fullPayload.length; i += CHUNK_SIZE) {
        const chunk = fullPayload.slice(i, i + CHUNK_SIZE);

        const { data } = await createBulkDocs({
          variables: { inputs: chunk },
        });

        const result = data.createBulkDocuments;
        totalSuccess += result.successCount;

        if (result.errors && result.errors.length > 0) {
          allErrors = [...allErrors, ...result.errors];
        }

        const currentChunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
        setImportProgress(Math.round((currentChunkIndex / totalChunks) * 100));
      }

      // XỬ LÝ GIAO DIỆN SAU KHI LƯU
      if (allErrors.length > 0) {
        toast.error(
          `Đã lưu thành công ${totalSuccess} dòng. Còn lại ${allErrors.length} dòng bị lỗi cần xử lý!`,
          { duration: 5000 },
        );

        // [PHÉP THUẬT]: Lọc bảng - Chỉ giữ lại những dòng có ID nằm trong danh sách lỗi
        const errorRowIndexes = allErrors.map((err) => err.rowIndex);
        setExcelData((prev) =>
          prev.filter((row) => errorRowIndexes.includes(row._rowIndex)),
        );
        setBulkErrors(allErrors);

        // Refetch lại bảng dữ liệu chính để hiển thị ngay các dòng đã lưu thành công
        refetchDocs();
      } else {
        // Hoàn hảo 100% không có lỗi
        toast.success(
          `Tuyệt vời! Đã lưu thành công toàn bộ ${totalSuccess} dòng!`,
        );
        setIsExcelModalOpen(false);
        setExcelData([]);
        refetchDocs();
      }
    } catch (error: any) {
      console.error("Lỗi Chunking:", error);
      const errorMessage = error?.message || "";

      // Nếu Backend chưa sửa kĩ mà vẫn văng Prisma error lên đây
      if (
        errorMessage.includes("Unique constraint failed") ||
        errorMessage.includes("docCode")
      ) {
        toast.error(
          "LỖI: Có 'Mã văn bản' trong bảng đã tồn tại trên Database. Vui lòng kiểm tra lại!",
          { duration: 5000 },
        );
      } else {
        toast.error(
          "Quá trình lưu bị gián đoạn do lỗi kết nối. Vui lòng thử lại.",
        );
      }
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // --- DATA PREPARATION ---
  const documents = docsData?.getDocumentsByCourt?.data || [];
  const statHeader = docsData?.getDocumentsByCourt?.statHeader || {
    waiting: 0,
    overdue: 0,
  };
  const officials =
    officialsData?.getOfficialsByCourt?.filter((o: any) => !o.isDeleted) || [];

  return (
    <div className="p-8 flex flex-col gap-6 bg-[#f8f9fa] min-h-screen">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <span
          className="cursor-pointer hover:text-black"
          onClick={() => router.back()}
        >
          Quản lý giấy tờ
        </span>
        <span>{">"}</span>
        <span className="text-black font-bold">Chi tiết Tòa án</span>
      </div>

      {/* THỐNG KÊ */}
      <div className="flex items-center gap-2 text-lg">
        <span className="text-red-600 font-bold">{statHeader.overdue}</span>
        <span className="font-medium text-gray-700">
          giấy tờ quá hạn tống đạt,
        </span>
        <span className="text-orange-500 font-bold">{statHeader.waiting}</span>
        <span className="font-medium text-gray-700">
          giấy tờ đang đợi tống đạt
        </span>
      </div>

      {/* BỘ LỌC & NÚT THÊM */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <HiFilter size={24} className="text-gray-400" />
          {/* Thanh Search */}
          <div className="relative w-[250px]">
            <CiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Tìm mã văn bản, tên..."
              className="pl-9 h-10 border-gray-200"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          {/* Lọc theo ngày */}
          <div className="flex items-center gap-2 border rounded-md px-3 py-1.5">
            <Input
              type="date"
              className="border-0 p-0 h-8 focus-visible:ring-0"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              className="border-0 p-0 h-8 focus-visible:ring-0"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>

          {/* Lọc trạng thái */}
          <Select
            value={filters.status}
            onValueChange={(val) => setFilters({ ...filters, status: val })}
          >
            <SelectTrigger className="w-[180px] h-10 border-gray-200">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="WAITING">Đang đợi tống đạt</SelectItem>
              <SelectItem value="COMPLETED">Đã tống đạt</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nút dropdown Thêm */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-black text-white gap-2 font-bold">
              <HiPlus size={18} /> Thêm giấy tờ
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem
              className="cursor-pointer py-3 gap-2"
              onClick={handleOpenCreate}
            >
              <HiDocumentText size={18} className="text-gray-500" />
              <span className="font-semibold">Thêm thủ công</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer py-3 gap-2"
              onClick={() => setIsExcelModalOpen(true)}
            >
              <HiUpload size={18} className="text-gray-500" />
              <span className="font-semibold">Thêm bằng Excel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE GIẤY TỜ CHÍNH */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Ngày nhận</TableHead>
              <TableHead>Mã văn bản</TableHead>
              <TableHead className="max-w-[200px]">Được tống đạt</TableHead>
              <TableHead>Hạn tống đạt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tổng chi phí</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
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
                  (doc.totalFeeInternal || 0) + (doc.totalFeeExternal || 0);

                // --- ĐÂY LÀ ĐOẠN ĐẢM BẢO CHẮC CHẮN BÔI ĐỎ KHI QUÁ HẠN ---
                const isOverdueVisual =
                  doc.status === "OVERDUE" || doc.isOverdue;

                return (
                  <TableRow
                    key={doc.id}
                    className={`transition-colors ${isOverdueVisual ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}
                  >
                    <TableCell className="font-medium text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
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
                        isOverdueVisual
                          ? "text-red-600 font-bold"
                          : "font-medium"
                      }
                    >
                      {doc.dueDate
                        ? new Date(doc.dueDate).toLocaleDateString("vi-VN")
                        : "---"}
                    </TableCell>
                    <TableCell>
                      {doc.status === "WAITING" && (
                        <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded font-bold text-xs">
                          Đợi tống đạt
                        </span>
                      )}
                      {doc.status === "COMPLETED" && (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded font-bold text-xs">
                          Đã tống đạt
                        </span>
                      )}
                      {doc.status === "OVERDUE" && (
                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded font-bold text-xs border border-red-200">
                          Quá hạn
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {totalDisplay.toLocaleString("vi-VN")} vnđ
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <HiOutlineTrash
                          className="cursor-pointer text-gray-400 hover:text-red-600"
                          size={20}
                          onClick={() => handleDelete(doc.id)}
                        />
                        <HiOutlinePencil
                          className="cursor-pointer text-gray-400 hover:text-blue-600"
                          size={20}
                          onClick={() => handleOpenEdit(doc)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL 1: FORM THÊM / SỬA THỦ CÔNG */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingDocId
                ? "Chỉnh sửa văn bản tống đạt"
                : "Thêm văn bản tống đạt"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label>Mã văn bản</Label>
              <Input
                placeholder="VD: Số 164/TB-TA..."
                value={formData.docCode}
                onChange={(e) =>
                  setFormData({ ...formData, docCode: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ngày nhận văn bản</Label>
                <Input
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, receivedDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Hạn tống đạt</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Hình thức tống đạt</Label>
                <Input
                  placeholder="VD: Trực tiếp, Qua bưu điện..."
                  value={formData.deliveryMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryMethod: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Thư ký chịu trách nhiệm</Label>
                <Select
                  value={formData.responsibleOfficialId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, responsibleOfficialId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thư ký" />
                  </SelectTrigger>
                  <SelectContent>
                    {officials.map((off: any) => (
                      <SelectItem key={off.id} value={off.id}>
                        {off.name} ({off.title})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Nội dung tống đạt</Label>
              <Textarea
                placeholder="Nhập nội dung..."
                rows={3}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Người được tống đạt</Label>
                <Input
                  placeholder="Họ tên người nhận"
                  value={formData.recipient}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Địa chỉ tống đạt</Label>
                <Input
                  placeholder="Địa chỉ cụ thể"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
            {editingDocId ? (
              <div className="grid gap-2">
                <Label>Bằng chứng tống đạt (Hình ảnh)</Label>
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <HiOutlineCloudUpload
                    size={40}
                    className="text-gray-400 mb-2"
                  />
                  <span className="text-sm text-gray-500 font-medium">
                    Tải ảnh hoặc kéo vào đây
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {formData.evidenceUrl && (
                  <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border">
                    <img
                      src={formData.evidenceUrl}
                      alt="Evidence preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-2 opacity-70">
                <Label className="text-gray-500">
                  Bằng chứng tống đạt (Hình ảnh)
                </Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 cursor-not-allowed">
                  <HiOutlineCloudUpload
                    size={40}
                    className="text-gray-300 mb-2"
                  />
                  <span className="text-sm text-gray-400 font-medium text-center">
                    * Tính năng tải ảnh chứng từ chỉ khả dụng ở chế độ Cập nhật{" "}
                    <br /> (Sau khi đã đi tống đạt về).
                  </span>
                </div>
              </div>
            )}
            <h3 className="font-bold text-lg mt-2 border-b pb-2">
              Kê khai chi phí
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Số km đã đi (km)</Label>
                <Input
                  type="number"
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({ ...formData, distance: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Chi phí tống đạt (vnđ)</Label>
                <Input
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryFee: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Hỗ trợ niêm yết (vnđ)</Label>
                <Input
                  type="number"
                  value={formData.accommodationFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accommodationFee: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Hỗ trợ xăng xe (vnđ)</Label>
                <Input
                  type="number"
                  value={formData.fuelFee}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelFee: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>Chi phí Khác (vnđ)</Label>
                <Input
                  type="number"
                  value={formData.otherFee}
                  onChange={(e) =>
                    setFormData({ ...formData, otherFee: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Tổng chi phí Nội tỉnh (vnđ)</Label>
                <Input
                  type="number"
                  className="bg-gray-100 font-bold"
                  value={formData.totalFeeInternal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalFeeInternal: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Tổng chi phí Ngoại tỉnh (vnđ)</Label>
                <Input
                  type="number"
                  className="bg-gray-100 font-bold"
                  value={formData.totalFeeExternal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalFeeExternal: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmitForm}
              className="bg-black text-white px-8"
            >
              {editingDocId ? "Cập nhật" : "Lưu dữ liệu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* MODAL 2: IMPORT EXCEL (HIỂN THỊ PREVIEW RỘNG & LỌC LỖI TỰ ĐỘNG) */}
      {/* ===================================================================== */}
      <Dialog
        open={isExcelModalOpen}
        onOpenChange={(open) => {
          setIsExcelModalOpen(open);
          if (!open) {
            setExcelData([]);
            setBulkErrors([]);
            setIsImporting(false);
            setImportProgress(0);
          }
        }}
      >
        <DialogContent className="max-w-[98vw] sm:max-w-[98vw] md:max-w-[98vw] lg:max-w-[98vw] w-full max-h-[98vh] flex flex-col overflow-hidden px-2 md:px-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Nhập dữ liệu từ Excel</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 w-full">
            {excelData.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-4 w-full max-w-[500px] mx-auto">
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 py-8 text-blue-600 bg-blue-50 hover:bg-blue-100"
                  onClick={handleDownloadTemplate} // ĐÃ GẮN HÀM TẢI FILE MẪU
                >
                  <HiDocumentText size={24} className="mr-2" /> Tải File Excel
                  Mẫu
                </Button>
                <span className="text-xs text-gray-400">--- HOẶC ---</span>
                <Label className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <HiUpload size={40} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Bấm để chọn file (.xlsx, .xls)
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
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100 transition-colors">
                  <span className="font-bold text-blue-800 transition-colors">
                    Đã bóc tách được {excelData.length} văn bản.
                  </span>
                  <Button
                    size="sm"
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

                <div className="border rounded-xl max-h-[70vh] overflow-x-auto overflow-y-auto shadow-inner bg-gray-50/30">
                  <Table className="relative whitespace-nowrap min-w-max">
                    <TableHeader className="bg-gray-100 sticky top-0 z-20 shadow-sm transition-colors">
                      <TableRow className="transition-colors">
                        <TableHead className="w-[40px] text-center sticky left-0 z-30 bg-gray-100 border-r transition-colors">
                          Xóa
                        </TableHead>
                        <TableHead className="w-[50px] text-center">
                          Dòng
                        </TableHead>
                        <TableHead className="min-w-[180px]">Mã VB</TableHead>
                        <TableHead className="min-w-[180px]">
                          Người nhận
                        </TableHead>
                        <TableHead className="min-w-[200px]">Địa chỉ</TableHead>
                        <TableHead className="min-w-[180px]">Thư ký</TableHead>
                        <TableHead className="min-w-[120px]">
                          Hình thức
                        </TableHead>
                        <TableHead className="min-w-[250px]">
                          Nội dung
                        </TableHead>
                        <TableHead className="text-center">Số km</TableHead>
                        <TableHead className="text-right">
                          Phí TĐ (vnđ)
                        </TableHead>
                        <TableHead className="text-right">
                          Hỗ trợ NY (vnđ)
                        </TableHead>
                        <TableHead className="text-right">
                          Xăng xe (vnđ)
                        </TableHead>
                        <TableHead className="text-right">
                          Phí khác (vnđ)
                        </TableHead>
                        <TableHead className="text-right font-bold transition-colors">
                          Tổng Nội
                        </TableHead>
                        <TableHead className="text-right font-bold transition-colors">
                          Tổng Ngoại
                        </TableHead>
                        <TableHead className="sticky right-0 bg-gray-100 border-l shadow-sm z-30 min-w-[120px] text-center transition-colors">
                          Trạng thái
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
                            className={`group ${rowError ? "bg-red-50 hover:bg-red-100/50" : "hover:bg-blue-50/30"} transition-colors`}
                          >
                            <TableCell className="p-0 text-center sticky left-0 bg-inherit border-r z-10 transition-colors">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                onClick={() => handleDeleteRow(row._rowIndex)}
                                title="Xóa dòng này"
                              >
                                <HiXMark size={16} />
                              </Button>
                            </TableCell>

                            <TableCell className="font-bold text-gray-500 text-center transition-colors">
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
                                placeholder="Nhập mã..."
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
                                placeholder="Họ tên..."
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <Input
                                value={row.address}
                                onChange={(e) =>
                                  handleEditCell(
                                    row._rowIndex,
                                    "address",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 focus:bg-white bg-transparent transition-all shadow-none"
                                placeholder="Địa chỉ..."
                              />
                            </TableCell>

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

                            <TableCell>{row.deliveryMethod || "---"}</TableCell>
                            <TableCell
                              className="max-w-[250px] truncate"
                              title={row.content}
                            >
                              {row.content || "---"}
                            </TableCell>

                            <TableCell className="text-center">
                              {row.distance}
                            </TableCell>
                            <TableCell className="text-right font-medium transition-colors">
                              {row.deliveryFee?.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="text-right font-medium transition-colors">
                              {row.accommodationFee?.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="text-right font-medium transition-colors">
                              {row.fuelFee?.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="text-right font-medium transition-colors">
                              {row.otherFee?.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="font-bold text-blue-600 text-right transition-colors">
                              {row.totalFeeInternal?.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="font-bold text-purple-600 text-right transition-colors">
                              {row.totalFeeExternal?.toLocaleString("vi-VN")}
                            </TableCell>

                            <TableCell className="sticky right-0 border-l bg-inherit backdrop-blur-md z-10 text-center p-2 transition-colors">
                              {rowError ? (
                                <span
                                  className="inline-flex items-center justify-center px-2 py-1 bg-red-100 text-red-700 font-bold text-[10px] uppercase rounded border border-red-200 transition-colors"
                                  title={rowError.message}
                                >
                                  Lỗi dữ liệu
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center px-2 py-1 bg-green-100 text-green-700 font-bold text-[10px] uppercase rounded border border-green-200 transition-colors">
                                  Sẵn sàng
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t w-full flex justify-end gap-2 transition-colors">
            <Button
              variant="outline"
              disabled={isImporting}
              onClick={() => setIsExcelModalOpen(false)}
            >
              Đóng
            </Button>
            <Button
              onClick={handleSubmitBulk}
              className="bg-black text-white px-8 min-w-[160px] transition-colors"
              disabled={isImporting}
            >
              {isImporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang lưu {importProgress}%...</span>
                </div>
              ) : (
                "Lưu vào hệ thống"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourtDocumentsPage;
