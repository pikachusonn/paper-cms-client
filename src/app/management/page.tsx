/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
// Import Query/Mutation sếp đã tự làm
import {
  GET_COURTS_WITH_OFFICIALS,
  GET_STAFF_ACCOUNTS,
  GET_ALL_ACCOUNTS_PAGINATED,
} from "@/lib/graphql/queries/management";
import {
  CREATE_COURT,
  CREATE_OFFICIAL,
  UPDATE_ACCOUNT,
  UPDATE_COURT_OFFICIAL,
  DELETE_COURT_OFFICIAL,
  DELETE_ACCOUNT, // [NEW] Import Mutation Xóa tài khoản
} from "@/lib/graphql/mutations/management";

// UI Components
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
} from "react-icons/hi";
import { IoBusinessOutline } from "react-icons/io5";
import { toast } from "sonner";
import { CREATE_ACCOUNT } from "@/lib/graphql/mutations/auth";

const ManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
  );

  const { data: staffData, refetch: refetchStaff } = useQuery(
    GET_STAFF_ACCOUNTS,
    {
      variables: { search: searchTerm },
    },
  );

  const { data: allAccountData, refetch: refetchAll } = useQuery(
    GET_ALL_ACCOUNTS_PAGINATED,
    {
      variables: { filter: { page: 1, limit: 10 } },
    },
  );

  // --- API MUTATIONS ---
  const [createCourt] = useMutation(CREATE_COURT, {
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
  });

  const [createOfficial] = useMutation(CREATE_OFFICIAL, {
    onCompleted: () => {
      toast.success("Thêm cán bộ thành công!");
      setIsAddOfficialOpen(false);
      setNewOfficial({ courtId: "", name: "", title: "", phone: "" });
      refetchCourts();
    },
    onError: (err) => toast.error(err.message),
  });

  const [updateCourtOfficial] = useMutation(UPDATE_COURT_OFFICIAL, {
    onCompleted: () => {
      toast.success("Cập nhật cán bộ thành công!");
      setIsEditOfficialOpen(false);
      refetchCourts();
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

  const [updateAccount] = useMutation(UPDATE_ACCOUNT, {
    onCompleted: () => {
      toast.success("Cập nhật tài khoản thành công!");
      setIsEditAccountOpen(false);
      setEditingAccount(null);
      refetchStaff();
      refetchAll();
    },
    onError: (err) => toast.error(err.message),
  });

  const [createAccount] = useMutation(CREATE_ACCOUNT, {
    onCompleted: () => {
      toast.success("Cấp tài khoản nhân viên thành công!");
      setIsAddStaffOpen(false);
      setNewStaff({ email: "", fullName: "", phone: "", role: "STAFF" });
      refetchStaff();
      refetchAll();
    },
    onError: (err) => toast.error(err.message),
  });

  // [NEW] Hook gọi API xóa mềm tài khoản
  const [deleteAccount] = useMutation(DELETE_ACCOUNT, {
    onCompleted: () => {
      toast.success("Đã vô hiệu hóa tài khoản thành công!");
      refetchStaff();
      refetchAll();
    },
    onError: (err) => toast.error(err.message),
  });

  // --- HANDLERS ---
  const handleAddCourt = () => {
    if (!newCourt.name || !newCourt.address)
      return toast.warning("Vui lòng nhập tên và địa chỉ tòa!");
    createCourt({
      variables: {
        input: {
          name: newCourt.name,
          address: newCourt.address,
          courtNumber: parseInt(newCourt.courtNumber) || 0,
          email: newCourt.email,
          phone: newCourt.phone,
        },
      },
    });
  };

  const handleOpenAddOfficial = (courtId: string = "") => {
    setNewOfficial({ ...newOfficial, courtId });
    setIsAddOfficialOpen(true);
  };

  const handleAddOfficial = () => {
    if (!newOfficial.name || !newOfficial.courtId)
      return toast.warning("Vui lòng chọn Tòa án và nhập tên!");
    createOfficial({
      variables: {
        input: {
          courtId: newOfficial.courtId,
          name: newOfficial.name,
          title: newOfficial.title,
          phone: newOfficial.phone,
        },
      },
    });
  };

  const handleOpenEditOfficial = (off: any) => {
    setEditingOfficial({
      id: off.id,
      name: off.name,
      title: off.title || "",
      phone: off.phone || "",
    });
    setIsEditOfficialOpen(true);
  };

  const handleUpdateOfficial = () => {
    if (!editingOfficial.name)
      return toast.warning("Tên cán bộ không được để trống!");
    updateCourtOfficial({
      variables: {
        input: {
          id: editingOfficial.id,
          name: editingOfficial.name,
          title: editingOfficial.title,
          phone: editingOfficial.phone,
        },
      },
    });
  };

  const handleDeleteOfficial = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cán bộ này khỏi tòa án?")) {
      deleteCourtOfficial({
        variables: { id },
      });
    }
  };

  const handleAddStaff = () => {
    if (!newStaff.email || !newStaff.fullName)
      return toast.warning("Vui lòng nhập Email và Họ tên!");
    createAccount({
      variables: {
        input: {
          email: newStaff.email,
          fullName: newStaff.fullName,
          phone: newStaff.phone,
          role: newStaff.role,
        },
      },
    });
  };

  const handleOpenEditAccount = (account: any) => {
    setEditingAccount({
      id: account.id,
      name: account.email.split("@")[0],
      phone: account.phone || "",
      role: account.role,
      avatar: account.avatar || "",
    });
    setIsEditAccountOpen(true);
  };

  const handleUpdateAccount = () => {
    if (!editingAccount) return;
    updateAccount({
      variables: {
        input: {
          id: editingAccount.id,
          name: editingAccount.name,
          phone: editingAccount.phone,
          role: editingAccount.role,
          avatar: editingAccount.avatar,
        },
      },
    });
  };

  // [NEW] Handler xóa tài khoản (vô hiệu hóa)
  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?")) {
      deleteAccount({
        variables: { id },
      });
    }
  };

  // --- DATA PREPARATION ---
  const courts = courtData?.courts || [];
  const staffs = staffData?.getStaffAccounts || [];
  const accounts = allAccountData?.getAllAccounts?.data || [];

  return (
    <div className="p-8 flex flex-col gap-6 bg-[#f8f9fa] min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý dữ liệu</h1>
        <div className="relative w-[300px]">
          <CiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="courts" className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start h-auto p-0 gap-8">
          <TabsTrigger
            value="courts"
            className="data-[state=active]:border-black border-b-2 border-transparent px-0 pb-2 font-bold text-gray-500 rounded-none"
          >
            Tòa án
          </TabsTrigger>
          <TabsTrigger
            value="staffs"
            className="data-[state=active]:border-black border-b-2 border-transparent px-0 pb-2 font-bold text-gray-500 rounded-none"
          >
            Nhân viên nhập liệu
          </TabsTrigger>
          <TabsTrigger
            value="accounts"
            className="data-[state=active]:border-black border-b-2 border-transparent px-0 pb-2 font-bold text-gray-500 rounded-none"
          >
            Tất cả tài khoản
          </TabsTrigger>
        </TabsList>

        {/* === TAB 1: TÒA ÁN === */}
        <TabsContent value="courts" className="mt-6">
          <div className="flex justify-end mb-4 gap-2">
            <Button
              onClick={() => handleOpenAddOfficial("")}
              variant="outline"
              className="gap-2"
            >
              <HiPlus /> Thêm cán bộ
            </Button>
            <Button
              onClick={() => setIsAddCourtOpen(true)}
              className="bg-black text-white gap-2"
            >
              <IoBusinessOutline /> Thêm tòa án
            </Button>
          </div>
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {courts.map((court: any) => (
              <AccordionItem
                key={court.id}
                value={court.id}
                className="bg-white border rounded-xl overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <IoBusinessOutline size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-gray-900">{court.name}</p>
                      <p className="text-xs text-gray-500">{court.address}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-2">
                  <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border text-sm">
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

                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-gray-800">
                      Danh sách Cán bộ tòa án
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 h-8"
                      onClick={() => handleOpenAddOfficial(court.id)}
                    >
                      <HiPlus /> Thêm vào tòa này
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b">
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
                            className="text-center text-gray-400 italic"
                          >
                            Chưa có nhân sự nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        court.officials.map((off: any) => (
                          <TableRow
                            key={off.id}
                            className="border-none hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {off.name}
                            </TableCell>
                            <TableCell>{off.title}</TableCell>
                            <TableCell>{off.phone}</TableCell>
                            <TableCell>
                              {off.isDeleted ? (
                                <span className="text-red-600 font-bold text-xs">
                                  Đã ngừng hoạt động
                                </span>
                              ) : (
                                <span className="text-green-600 font-bold text-xs">
                                  Hoạt động
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

        {/* === TAB 2: NHÂN VIÊN (STAFF) === */}
        <TabsContent value="staffs" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsAddStaffOpen(true)}
              className="bg-black text-white gap-2"
            >
              <HiOutlineUserAdd /> Thêm nhân viên
            </Button>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffs.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            s.avatar ||
                            "https://ui.shadcn.com/avatars/shadcn.jpg"
                          }
                          alt="ava"
                          className="w-8 h-8 rounded-full border"
                        />{" "}
                        <span className="font-bold">{s.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{s.fullName || "---"}</TableCell>
                    <TableCell>{s.phone || "---"}</TableCell>
                    <TableCell>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                        {s.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {s.isDeleted ? (
                        <span className="text-red-600 font-bold text-xs">
                          Đã ngừng hoạt động
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold text-xs">
                          Hoạt động
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <HiOutlinePencil
                        className="cursor-pointer hover:text-blue-600"
                        size={18}
                        onClick={() => handleOpenEditAccount(s)}
                      />
                      {/* [NEW] Ẩn nút xóa nếu tài khoản đã bị xóa mềm */}
                      {!s.isDeleted && (
                        <HiOutlineTrash
                          className="cursor-pointer hover:text-red-600"
                          size={18}
                          onClick={() => handleDeleteAccount(s.id)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* === TAB 3: TẤT CẢ TÀI KHOẢN === */}
        <TabsContent value="accounts" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsAddStaffOpen(true)}
              className="bg-black text-white gap-2"
            >
              <HiOutlineUserAdd /> Cấp tài khoản mới
            </Button>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Tài khoản</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc: any) => (
                  <TableRow key={acc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            acc.avatar ||
                            "https://ui.shadcn.com/avatars/shadcn.jpg"
                          }
                          alt="ava"
                          className="w-8 h-8 rounded-full border"
                        />
                        <span className="font-bold text-gray-800">
                          {acc.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{acc.phone || "---"}</TableCell>
                    <TableCell>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                        {acc.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {acc.isDeleted ? (
                        <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                          Đã xóa
                        </span>
                      ) : (
                        <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                          Hoạt động
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {acc.createdAt
                        ? new Date(acc.createdAt).toLocaleDateString("vi-VN")
                        : "---"}
                    </TableCell>
                    <TableCell className="text-right flex justify-end items-center gap-2">
                      <HiOutlinePencil
                        className="cursor-pointer hover:text-blue-600 inline-block"
                        size={18}
                        onClick={() => handleOpenEditAccount(acc)}
                      />
                      {/* [NEW] Ẩn nút xóa nếu tài khoản đã bị xóa mềm */}
                      {!acc.isDeleted && (
                        <HiOutlineTrash
                          className="cursor-pointer hover:text-red-600 inline-block"
                          size={18}
                          onClick={() => handleDeleteAccount(acc.id)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
            <Button variant="outline" onClick={() => setIsAddCourtOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddCourt} className="bg-black text-white">
              Thêm mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: THÊM CÁN BỘ (OFFICIAL) --- */}
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
              <Label>Chức vụ (Title)</Label>
              <Input
                value={newOfficial.title}
                onChange={(e) =>
                  setNewOfficial({ ...newOfficial, title: e.target.value })
                }
                placeholder="VD: Thư ký, Thẩm phán..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
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
            >
              Hủy
            </Button>
            <Button onClick={handleAddOfficial} className="bg-black text-white">
              Thêm mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 5: CẬP NHẬT CÁN BỘ TÒA ÁN --- */}
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
                placeholder="Nhập họ tên..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Chức vụ (Title)</Label>
              <Input
                value={editingOfficial.title}
                onChange={(e) =>
                  setEditingOfficial({
                    ...editingOfficial,
                    title: e.target.value,
                  })
                }
                placeholder="VD: Thư ký, Thẩm phán..."
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
                placeholder="SĐT liên hệ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOfficialOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateOfficial}
              className="bg-black text-white"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: SỬA TÀI KHOẢN --- */}
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
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="STAFF">STAFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Avatar URL</Label>
              <Input
                value={editingAccount?.avatar || ""}
                onChange={(e) =>
                  setEditingAccount({
                    ...editingAccount,
                    avatar: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditAccountOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateAccount}
              className="bg-black text-white"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 4: THÊM TÀI KHOẢN NHÂN VIÊN --- */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cấp tài khoản nhân viên mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Họ và tên (Bắt buộc)</Label>
              <Input
                value={newStaff.fullName}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, fullName: e.target.value })
                }
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email đăng nhập (Bắt buộc)</Label>
              <Input
                type="email"
                value={newStaff.email}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, email: e.target.value })
                }
                placeholder="VD: nva@gmail.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
              <Input
                value={newStaff.phone}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, phone: e.target.value })
                }
                placeholder="VD: 0987654321"
              />
            </div>
            <div className="grid gap-2">
              <Label>Vai trò</Label>
              <Select
                value={newStaff.role}
                onValueChange={(val) => setNewStaff({ ...newStaff, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Nhân viên (STAFF)</SelectItem>
                  <SelectItem value="ADMIN">Quản trị (ADMIN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddStaff} className="bg-black text-white">
              Cấp tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagementPage;
