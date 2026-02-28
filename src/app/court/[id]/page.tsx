/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";

import {
  GET_DOCUMENTS_BY_COURT,
  GET_OFFICIALS_BY_COURT,
  CREATE_DOCUMENT,
  UPDATE_DOCUMENT,
  DELETE_DOCUMENT,
  CONFIRM_DOCUMENT,
  GENERATE_PUBLIC_IMPORT_LINK,
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
  HiDocumentText,
  HiOutlineCloudUpload,
  HiOutlineCheckCircle,
  HiOutlineLink,
  HiOutlineClipboardCopy,
} from "react-icons/hi";
import { IoChevronBackOutline } from "react-icons/io5";
import { toast } from "sonner";

const CourtDocumentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const courtId = params.id as string;

  // =========================================================================
  // [BẢO MẬT] LẤY VÀ GIẢI MÃ TOKEN TỪ COOKIES ĐỂ XÁC ĐỊNH ROLE
  // =========================================================================
  const [currentUserRole, setCurrentUserRole] = useState("");

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const token = getCookie("accessToken");

    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );

        const decodedData = JSON.parse(jsonPayload);

        if (decodedData.role) {
          setCurrentUserRole(decodedData.role.toUpperCase());
        }
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
  }, []);

  // --- STATES BỘ LỌC ---
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "ALL",
    search: "",
  });

  // --- STATES MODALS THỦ CÔNG ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // --- STATES TẠO LINK PUBLIC IMPORT ---
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

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

  const [confirmDocument] = useMutation(CONFIRM_DOCUMENT, {
    onCompleted: () => {
      toast.success("Đã xác nhận giấy tờ thành công!");
      refetchDocs();
    },
    onError: (err) => toast.error(err.message),
  });

  const [generatePublicLink, { loading: isGenerating }] = useMutation(
    GENERATE_PUBLIC_IMPORT_LINK,
    {
      onCompleted: (data) => {
        setGeneratedLink(data.generatePublicImportLink);
        setIsLinkModalOpen(true);
      },
      onError: (err) => toast.error(err.message),
    },
  );

  // --- HANDLERS (FORM THỦ CÔNG & BẢNG) ---
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

  const handleConfirmDoc = (id: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn XÁC NHẬN giấy tờ này? Sau khi xác nhận, nhân viên sẽ không thể sửa đổi.",
      )
    ) {
      confirmDocument({ variables: { id } });
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

  // --- HANDLERS (LINK IMPORT) ---
  const handleCreatePublicLink = () => {
    generatePublicLink({ variables: { courtId } });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Đã copy đường link! Hãy gửi link này cho cán bộ.");
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

          <Select
            value={filters.status}
            onValueChange={(val) => setFilters({ ...filters, status: val })}
          >
            <SelectTrigger className="w-[180px] h-10 border-gray-200">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {/* [CẬP NHẬT] Đúng 3 trạng thái của BE */}
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="WAITING">Đợi tống đạt</SelectItem>
              <SelectItem value="COMPLETED">Đã tống đạt (Chờ duyệt)</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận (Chốt)</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              onClick={handleCreatePublicLink}
              disabled={isGenerating}
            >
              <HiOutlineLink size={18} className="text-blue-600" />
              <span className="font-semibold text-blue-700">
                Tạo link Import (30 phút)
              </span>
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

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-3 items-center">
                        {/* ========================================================
                            [LOGIC NÚT BẤM CHUẨN MỚI] 
                            ======================================================== */}

                        {/* NÚT XÁC NHẬN: Chỉ hiện cho ADMIN khi trạng thái đã đổi thành COMPLETED (Nhân viên đã báo cáo) */}
                        {currentUserRole === "ADMIN" &&
                          doc.status === "COMPLETED" && (
                            <HiOutlineCheckCircle
                              className="cursor-pointer text-gray-400 hover:text-green-600"
                              size={22}
                              title="Xác nhận giấy tờ (Chốt dữ liệu)"
                              onClick={() => handleConfirmDoc(doc.id)}
                            />
                          )}

                        {/* NÚT SỬA & XÓA: Admin thì lúc nào cũng sửa xóa được. Staff thì chỉ được đụng vào khi CHƯA CONFIRMED */}
                        {(currentUserRole === "ADMIN" ||
                          doc.status !== "CONFIRMED") && (
                          <>
                            <HiOutlinePencil
                              className="cursor-pointer text-gray-400 hover:text-blue-600"
                              size={20}
                              title="Cập nhật"
                              onClick={() => handleOpenEdit(doc)}
                            />
                            <HiOutlineTrash
                              className="cursor-pointer text-gray-400 hover:text-red-600"
                              size={20}
                              title="Xóa"
                              onClick={() => handleDelete(doc.id)}
                            />
                          </>
                        )}
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

      {/* MODAL 2: HIỂN THỊ LINK BẢO MẬT ĐỂ COPY */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Link Nhập Excel Tự Động
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-gray-500">
              Đường link này chứa mã bảo mật an toàn. Hãy gửi link này cho cán
              bộ phụ trách.
              <strong className="text-red-500 block mt-1">
                Lưu ý: Link sẽ tự động vô hiệu hóa sau 30 phút.
              </strong>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Input
                readOnly
                value={generatedLink}
                className="bg-gray-50 text-gray-600 cursor-text font-mono text-xs"
              />
              <Button
                onClick={handleCopyLink}
                className="bg-black text-white shrink-0 gap-2"
              >
                <HiOutlineClipboardCopy size={18} /> Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourtDocumentsPage;
