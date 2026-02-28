/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_COURTS_WITH_OFFICIALS,
  GET_STAFF_ACCOUNTS,
  GET_ADMIN_ACCOUNTS,
} from "@/lib/graphql/queries/management";
import {
  CREATE_COURT,
  CREATE_OFFICIAL,
  UPDATE_ACCOUNT,
  UPDATE_COURT_OFFICIAL,
  DELETE_COURT_OFFICIAL,
  DELETE_ACCOUNT,
} from "@/lib/graphql/mutations/management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Icons
import { CiSearch } from "react-icons/ci";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiPlus,
  HiOutlineUserAdd,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { IoBusinessOutline } from "react-icons/io5";
import { toast } from "sonner";
import { CREATE_ACCOUNT } from "@/lib/graphql/mutations/auth";

const ManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("courts");

  // --- STATE QUẢN LÝ POPUP ---
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);
  const [isAddOfficialOpen, setIsAddOfficialOpen] = useState(false);
  const [isEditOfficialOpen, setIsEditOfficialOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // --- STATE FORM DATA ---
  const [newCourt, setNewCourt] = useState({
    name: "",
    address: "",
    courtNumber: "",
    email: "",
    phone: "",
  });
  const [newOfficial, setNewOfficial] = useState({
    courtId: "",
    name: "",
    title: "",
    phone: "",
  });
  const [editingOfficial, setEditingOfficial] = useState({
    id: "",
    name: "",
    title: "",
    phone: "",
  });
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [newStaff, setNewStaff] = useState({
    email: "",
    fullName: "",
    phone: "",
    role: "STAFF",
  });

  // --- API QUERIES ---
  const { data: courtData, refetch: refetchCourts } = useQuery(
    GET_COURTS_WITH_OFFICIALS,
    { skip: activeTab !== "courts" },
  );
  const { data: staffData, refetch: refetchStaff } = useQuery(
    GET_STAFF_ACCOUNTS,
    { variables: { search: searchTerm }, skip: activeTab !== "staffs" },
  );
  const { data: adminData, refetch: refetchAdmins } = useQuery(
    GET_ADMIN_ACCOUNTS,
    { variables: { search: searchTerm }, skip: activeTab !== "admins" },
  );

  // --- API MUTATIONS (KÈM LOADING STATE ĐỂ CHẶN SPAM) ---
  const [createCourt, { loading: isCreatingCourt }] = useMutation(
    CREATE_COURT,
    {
      onCompleted: () => {
        toast.success("Thêm tòa án thành công!");
        setIsAddCourtOpen(false);
        setNewCourt({
          name: "",
          address: "",
          courtNumber: "",
          email: "",
          phone: "",
        });
        refetchCourts();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const [createOfficial, { loading: isCreatingOfficial }] = useMutation(
    CREATE_OFFICIAL,
    {
      onCompleted: () => {
        toast.success("Thêm cán bộ thành công!");
        setIsAddOfficialOpen(false);
        setNewOfficial({ courtId: "", name: "", title: "", phone: "" });
        refetchCourts();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const [updateCourtOfficial, { loading: isUpdatingOfficial }] = useMutation(
    UPDATE_COURT_OFFICIAL,
    {
      onCompleted: () => {
        toast.success("Cập nhật cán bộ thành công!");
        setIsEditOfficialOpen(false);
        refetchCourts();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const [updateAccount, { loading: isUpdatingAccount }] = useMutation(
    UPDATE_ACCOUNT,
    {
      onCompleted: () => {
        toast.success("Cập nhật tài khoản thành công!");
        setIsEditAccountOpen(false);
        activeTab === "staffs" ? refetchStaff() : refetchAdmins();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const [createAccount, { loading: isCreatingAccount }] = useMutation(
    CREATE_ACCOUNT,
    {
      onCompleted: () => {
        toast.success("Cấp tài khoản mới thành công!");
        setIsAddStaffOpen(false);
        setNewStaff({ email: "", fullName: "", phone: "", role: "STAFF" });
        activeTab === "staffs" ? refetchStaff() : refetchAdmins();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const [deleteAccount] = useMutation(DELETE_ACCOUNT, {
    onCompleted: () => {
      toast.success("Đã vô hiệu hóa tài khoản!");
      activeTab === "staffs" ? refetchStaff() : refetchAdmins();
    },
    onError: (err) => toast.error(err.message),
  });

  const [deleteCourtOfficial] = useMutation(DELETE_COURT_OFFICIAL, {
    onCompleted: () => {
      toast.success("Xóa cán bộ thành công!");
      refetchCourts();
    },
    onError: (err) => toast.error(err.message),
  });

  // --- HANDLERS ---
  const handleOpenAddStaff = (role: "STAFF" | "ADMIN") => {
    setNewStaff({ ...newStaff, role });
    setIsAddStaffOpen(true);
  };

  const handleOpenEditAccount = (account: any) => {
    setEditingAccount({
      id: account.id,
      name: account.fullName || account.email.split("@")[0],
      phone: account.phone || "",
      role: account.role,
      avatar: account.avatar || "",
    });
    setIsEditAccountOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?")) {
      deleteAccount({ variables: { id } });
    }
  };

  const handleAddCourt = () => {
    if (isCreatingCourt) return;
    if (!newCourt.name || !newCourt.address)
      return toast.warning("Vui lòng nhập tên và địa chỉ tòa!");
    createCourt({
      variables: {
        input: {
          ...newCourt,
          courtNumber: parseInt(newCourt.courtNumber) || 0,
        },
      },
    });
  };

  const handleOpenAddOfficial = (courtId: string = "") => {
    setNewOfficial({ ...newOfficial, courtId });
    setIsAddOfficialOpen(true);
  };

  const handleAddOfficial = () => {
    if (isCreatingOfficial) return;
    if (!newOfficial.name || !newOfficial.courtId)
      return toast.warning("Vui lòng chọn Tòa án và nhập tên!");
    createOfficial({ variables: { input: newOfficial } });
  };

  const handleUpdateOfficial = () => {
    if (isUpdatingOfficial) return;
    if (!editingOfficial.name)
      return toast.warning("Tên cán bộ không được để trống!");
    updateCourtOfficial({ variables: { input: editingOfficial } });
  };

  const handleDeleteOfficial = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cán bộ này khỏi tòa án?")) {
      deleteCourtOfficial({ variables: { id } });
    }
  };

  const handleAddStaff = () => {
    if (isCreatingAccount) return;
    if (!newStaff.email || !newStaff.fullName)
      return toast.warning("Vui lòng nhập Email và Họ tên!");
    createAccount({ variables: { input: newStaff } });
  };

  const handleUpdateAccount = () => {
    if (isUpdatingAccount) return;
    if (!editingAccount) return;
    updateAccount({ variables: { input: editingAccount } });
  };

  // --- DATA PREPARATION ---
  const courts = courtData?.courts || [];
  const staffs = staffData?.getStaffAccounts || [];
  const admins = adminData?.getAdminAccounts || [];

  // Reusable Spinner Component
  const LoadingSpinner = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>{text}</span>
    </div>
  );

  // Helper render bảng
  const renderAccountTable = (data: any[]) => (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Tài khoản</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-10 text-gray-400 italic"
              >
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            data.map((acc: any) => (
              <TableRow key={acc.id} className="hover:bg-gray-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        acc.avatar || "https://ui.shadcn.com/avatars/shadcn.jpg"
                      }
                      alt="ava"
                      className="w-8 h-8 rounded-full border shadow-sm"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">
                        {acc.email}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-blue-500">
                        {acc.role}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {acc.fullName || "---"}
                </TableCell>
                <TableCell>{acc.phone || "---"}</TableCell>
                <TableCell>
                  {acc.isDeleted ? (
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-[10px] font-bold border border-red-100">
                      Đã vô hiệu
                    </span>
                  ) : (
                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold border border-green-100">
                      Hoạt động
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3 items-center">
                    <HiOutlinePencil
                      className="cursor-pointer text-gray-400 hover:text-blue-600"
                      size={18}
                      onClick={() => handleOpenEditAccount(acc)}
                    />
                    {!acc.isDeleted && (
                      <HiOutlineTrash
                        className="cursor-pointer text-gray-400 hover:text-red-600"
                        size={18}
                        onClick={() => handleDeleteAccount(acc.id)}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-6 bg-[#f8f9fa] min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Quản lý dữ liệu
        </h1>
        <div className="relative w-[320px]">
          <CiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Tìm kiếm tài khoản, tòa án..."
            className="pl-10 bg-white border-gray-200 focus:ring-black rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue="courts"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-transparent border-b w-full justify-start h-auto p-0 gap-8">
          <TabsTrigger
            value="courts"
            className="data-[state=active]:border-black data-[state=active]:text-black border-b-2 border-transparent px-0 pb-3 font-bold text-gray-400 rounded-none transition-all"
          >
            Tòa án & Cán bộ
          </TabsTrigger>
          <TabsTrigger
            value="staffs"
            className="data-[state=active]:border-black data-[state=active]:text-black border-b-2 border-transparent px-0 pb-3 font-bold text-gray-400 rounded-none transition-all"
          >
            Nhân viên nhập liệu
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="data-[state=active]:border-black data-[state=active]:text-black border-b-2 border-transparent px-0 pb-3 font-bold text-gray-400 rounded-none transition-all"
          >
            Quản trị (Admin)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courts" className="mt-6 outline-none">
          <div className="flex justify-end mb-4 gap-3">
            <Button
              onClick={() => handleOpenAddOfficial("")}
              variant="outline"
              className="gap-2 rounded-lg"
            >
              <HiPlus /> Thêm cán bộ
            </Button>
            <Button
              onClick={() => setIsAddCourtOpen(true)}
              className="bg-black text-white gap-2 rounded-lg"
            >
              <IoBusinessOutline /> Thêm tòa án
            </Button>
          </div>
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {courts.map((court: any) => (
              <AccordionItem
                key={court.id}
                value={court.id}
                className="bg-white border rounded-xl overflow-hidden shadow-sm border-gray-200"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <IoBusinessOutline size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-gray-900">{court.name}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {court.address}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50/80 p-4 rounded-xl border border-gray-100 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <HiOutlineMail size={16} />{" "}
                      <span>{court.email || "---"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <HiOutlinePhone size={16} />{" "}
                      <span>{court.phone || "---"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <HiOutlineOfficeBuilding size={16} />{" "}
                      <span>Mã tòa: {court.courtNumber}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>{" "}
                      Danh sách Cán bộ tòa án
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 h-8 text-xs font-bold"
                      onClick={() => handleOpenAddOfficial(court.id)}
                    >
                      <HiPlus /> Thêm nhân sự
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-transparent border-b">
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Chức vụ</TableHead>
                        <TableHead>SĐT</TableHead>
                        <TableHead>Trạng Thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {court.officials?.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-gray-400 italic py-8"
                          >
                            Chưa có nhân sự nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        court.officials.map((off: any) => (
                          <TableRow
                            key={off.id}
                            className="border-none hover:bg-gray-50/50"
                          >
                            <TableCell className="font-bold text-gray-700">
                              {off.name}
                            </TableCell>
                            <TableCell className="text-gray-500">
                              {off.title}
                            </TableCell>
                            <TableCell>{off.phone}</TableCell>
                            <TableCell>
                              {off.isDeleted ? (
                                <span className="text-red-500 font-bold text-[10px]">
                                  NGỪNG HĐ
                                </span>
                              ) : (
                                <span className="text-green-500 font-bold text-[10px]">
                                  HOẠT ĐỘNG
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                              <HiOutlinePencil
                                className="cursor-pointer hover:text-blue-600"
                                size={18}
                                onClick={() => handleOpenEditOfficial(off)}
                              />
                              {!off.isDeleted && (
                                <HiOutlineTrash
                                  className="cursor-pointer hover:text-red-600"
                                  size={18}
                                  onClick={() => handleDeleteOfficial(off.id)}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="staffs" className="mt-6 outline-none">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleOpenAddStaff("STAFF")}
              className="bg-black text-white gap-2 rounded-lg"
            >
              <HiOutlineUserAdd /> Thêm nhân viên
            </Button>
          </div>
          {renderAccountTable(staffs)}
        </TabsContent>

        <TabsContent value="admins" className="mt-6 outline-none">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleOpenAddStaff("ADMIN")}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-lg"
            >
              <HiOutlineShieldCheck /> Cấp quyền Admin
            </Button>
          </div>
          {renderAccountTable(admins)}
        </TabsContent>
      </Tabs>

      {/* --- MODAL 1: THÊM TÒA ÁN --- */}
      <Dialog open={isAddCourtOpen} onOpenChange={setIsAddCourtOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm tòa án mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên tòa án</Label>
              <Input
                value={newCourt.name}
                onChange={(e) =>
                  setNewCourt({ ...newCourt, name: e.target.value })
                }
                placeholder="VD: Tòa án nhân dân..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Địa chỉ</Label>
              <Input
                value={newCourt.address}
                onChange={(e) =>
                  setNewCourt({ ...newCourt, address: e.target.value })
                }
                placeholder="Địa chỉ tòa án"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={newCourt.email}
                  onChange={(e) =>
                    setNewCourt({ ...newCourt, email: e.target.value })
                  }
                  placeholder="Email liên hệ"
                />
              </div>
              <div className="grid gap-2">
                <Label>SĐT</Label>
                <Input
                  value={newCourt.phone}
                  onChange={(e) =>
                    setNewCourt({ ...newCourt, phone: e.target.value })
                  }
                  placeholder="Số điện thoại"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Mã tòa (Số)</Label>
              <Input
                type="number"
                value={newCourt.courtNumber}
                onChange={(e) =>
                  setNewCourt({ ...newCourt, courtNumber: e.target.value })
                }
                placeholder="VD: 123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddCourtOpen(false)}
              disabled={isCreatingCourt}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddCourt}
              className="bg-black text-white min-w-[120px]"
              disabled={isCreatingCourt}
            >
              {isCreatingCourt ? (
                <LoadingSpinner text="Đang thêm..." />
              ) : (
                "Thêm mới"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: THÊM CÁN BỘ --- */}
      <Dialog open={isAddOfficialOpen} onOpenChange={setIsAddOfficialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm cán bộ tòa án</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Thuộc Tòa án</Label>
              <Select
                value={newOfficial.courtId}
                onValueChange={(val) =>
                  setNewOfficial({ ...newOfficial, courtId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tòa án làm việc" />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court: any) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Họ và tên</Label>
              <Input
                value={newOfficial.name}
                onChange={(e) =>
                  setNewOfficial({ ...newOfficial, name: e.target.value })
                }
                placeholder="Nhập họ tên..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Chức vụ</Label>
              <Input
                value={newOfficial.title}
                onChange={(e) =>
                  setNewOfficial({ ...newOfficial, title: e.target.value })
                }
                placeholder="VD: Thư ký..."
              />
            </div>
            <div className="grid gap-2">
              <Label>SĐT</Label>
              <Input
                value={newOfficial.phone}
                onChange={(e) =>
                  setNewOfficial({ ...newOfficial, phone: e.target.value })
                }
                placeholder="SĐT liên hệ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOfficialOpen(false)}
              disabled={isCreatingOfficial}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddOfficial}
              className="bg-black text-white min-w-[120px]"
              disabled={isCreatingOfficial}
            >
              {isCreatingOfficial ? (
                <LoadingSpinner text="Đang thêm..." />
              ) : (
                "Thêm mới"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: SỬA CÁN BỘ --- */}
      <Dialog open={isEditOfficialOpen} onOpenChange={setIsEditOfficialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin cán bộ</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Họ và tên</Label>
              <Input
                value={editingOfficial.name}
                onChange={(e) =>
                  setEditingOfficial({
                    ...editingOfficial,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Chức vụ</Label>
              <Input
                value={editingOfficial.title}
                onChange={(e) =>
                  setEditingOfficial({
                    ...editingOfficial,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
              <Input
                value={editingOfficial.phone}
                onChange={(e) =>
                  setEditingOfficial({
                    ...editingOfficial,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOfficialOpen(false)}
              disabled={isUpdatingOfficial}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateOfficial}
              className="bg-black text-white min-w-[140px]"
              disabled={isUpdatingOfficial}
            >
              {isUpdatingOfficial ? (
                <LoadingSpinner text="Đang cập nhật..." />
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 4: CẤP TÀI KHOẢN (TRỌNG TÂM) --- */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Cấp tài khoản{" "}
              {newStaff.role === "ADMIN" ? "Quản trị" : "Nhân viên"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label className="font-bold">Họ và tên</Label>
              <Input
                value={newStaff.fullName}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, fullName: e.target.value })
                }
                placeholder="VD: Nguyễn Văn A"
                className="rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Email đăng nhập</Label>
              <Input
                type="email"
                value={newStaff.email}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, email: e.target.value })
                }
                placeholder="VD: nva@gmail.com"
                className="rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Số điện thoại</Label>
              <Input
                value={newStaff.phone}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, phone: e.target.value })
                }
                placeholder="VD: 0987654321"
                className="rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Vai trò</Label>
              <Select
                value={newStaff.role}
                onValueChange={(val: any) =>
                  setNewStaff({ ...newStaff, role: val })
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Nhân viên (STAFF)</SelectItem>
                  <SelectItem value="ADMIN">Quản trị (ADMIN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddStaffOpen(false)}
              className="rounded-lg"
              disabled={isCreatingAccount}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddStaff}
              className="bg-black text-white rounded-lg px-8 min-w-[160px]"
              disabled={isCreatingAccount}
            >
              {isCreatingAccount ? (
                <LoadingSpinner text="Đang cấp TK..." />
              ) : (
                "Cấp tài khoản"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 5: SỬA TÀI KHOẢN --- */}
      <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật tài khoản</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên hiển thị</Label>
              <Input
                value={editingAccount?.name || ""}
                onChange={(e) =>
                  setEditingAccount({ ...editingAccount, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
              <Input
                value={editingAccount?.phone || ""}
                onChange={(e) =>
                  setEditingAccount({
                    ...editingAccount,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Vai trò</Label>
              <Select
                value={editingAccount?.role}
                onValueChange={(val) =>
                  setEditingAccount({ ...editingAccount, role: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="STAFF">STAFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditAccountOpen(false)}
              disabled={isUpdatingAccount}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateAccount}
              className="bg-black text-white min-w-[140px]"
              disabled={isUpdatingAccount}
            >
              {isUpdatingAccount ? (
                <LoadingSpinner text="Đang lưu..." />
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagementPage;
