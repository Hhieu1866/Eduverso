"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  User,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Shield,
  BadgeCheck,
  MoreHorizontal,
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Check,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import React from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
  });
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Memoize các hàm và dữ liệu không thay đổi thường xuyên
  const userRoles = useMemo(
    () => [
      { value: "admin", label: "Admin", icon: Shield },
      { value: "instructor", label: "Giảng viên", icon: BadgeCheck },
      { value: "student", label: "Học viên", icon: User },
    ],
    [],
  );

  // Thêm tham chiếu để theo dõi các timeout hiện có
  const timeoutRefs = useRef([]);

  // Hàm tiện ích để tạo timeout có thể quản lý
  const createManagedTimeout = useCallback((callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  // Hàm tiện ích để xóa một timeout cụ thể
  const clearManagedTimeout = useCallback((id) => {
    clearTimeout(id);
    timeoutRefs.current = timeoutRefs.current.filter(
      (timeoutId) => timeoutId !== id,
    );
  }, []);

  // Tạo hàm xử lý cả id và _id trong callback
  const handleRoleChangeCallback = useCallback((userId, newRole) => {
    if (userId) {
      handleRoleChange(userId, newRole);
    }
  }, []);

  // Tạo hàm tiện ích để lấy user ID một cách nhất quán
  const getUserId = useCallback((user) => {
    // Thứ tự ưu tiên: user._id, user.id, hoặc undefined nếu không có cả hai
    return user?._id || user?.id;
  }, []);

  // Hàm fetch dữ liệu người dùng từ API có useCallback
  const fetchUsers = useCallback(
    async (currentPage = page, searchTerm = search, role = roleFilter) => {
      // Chỉ hiển thị trạng thái loading nếu không có dữ liệu hoặc bắt đầu tải trang mới
      const shouldShowFullLoading = users.length === 0;

      try {
        if (shouldShowFullLoading) {
          setLoading(true);
        }

        const params = {
          page: currentPage.toString(),
          limit: "10",
        };

        if (searchTerm) {
          params.search = searchTerm;
        }

        if (role && role !== "all") {
          params.role = role;
        }

        console.log("Fetching users with params:", params);

        // Thêm timeout để tránh UI flickering khi dữ liệu tải nhanh
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 300),
        );
        const [data] = await Promise.all([
          axios.get("/api/admin/users", { params }),
          shouldShowFullLoading ? timeoutPromise : Promise.resolve(),
        ]);

        console.log("Fetched users data:", data);

        // Cập nhật state theo thứ tự để tránh render lại nhiều lần
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
        setPage(currentPage);
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
        toast.error(
          "Không thể tải danh sách người dùng: " +
            (error.response?.data?.error || error.message),
        );
      } finally {
        setLoading(false);
      }
    },
    [page, search, roleFilter, users.length],
  );

  // Lắng nghe thay đổi của page - khởi tạo dữ liệu ban đầu
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Xóa tất cả timeout khi component unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((id) => clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search, roleFilter);
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    fetchUsers(newPage, search, roleFilter);
  };

  // Xử lý lọc theo vai trò
  const handleRoleFilterChange = (value) => {
    console.log("Chọn lọc theo vai trò:", value);
    setRoleFilter(value);
    fetchUsers(1, search, value === "all" ? "" : value);
  };

  // Xử lý mở dialog xem chi tiết người dùng
  const handleViewUser = (user) => {
    setCurrentUser(user);
    setIsDetailOpen(true);
  };

  // Xử lý mở dialog chỉnh sửa người dùng
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
    });
    setIsEditDialogOpen(true);
  };

  // Xử lý mở dialog xóa người dùng
  const handleDeleteDialog = (user) => {
    setCurrentUser(user);
    setIsDeleteOpen(true);
  };

  // Cập nhật hàm handleRoleChange
  const handleRoleChange = async (userId, newRole) => {
    console.log("handleRoleChange được gọi với:", {
      userId,
      userIdType: typeof userId,
      userIdLength: userId ? userId.length : 0,
      newRole,
    });

    // Đảm bảo có userId và log chi tiết nếu không có
    if (!userId) {
      console.error(
        "CRITICAL: Không thể xác định userId - Giá trị nhận được:",
        userId,
      );
      toast.error("Không thể xác định người dùng để cập nhật");
      return;
    }

    // Tạo một biến để lưu toast ID
    let toastId = toast.loading("Đang cập nhật quyền người dùng...");

    try {
      console.log("Gọi API với userId:", userId, "và newRole:", newRole);

      // Cập nhật UI trước khi gọi API để cải thiện trải nghiệm
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          // So sánh cả id và _id
          const userIdValue = getUserId(user);
          if (userIdValue === userId) {
            return { ...user, role: newRole };
          }
          return user;
        }),
      );

      // Gọi API với axios
      await axios.patch(`/api/admin/users/${userId}`, { role: newRole });
      console.log("API trả về thành công");

      // Đóng thông báo loading
      toast.dismiss(toastId);

      // Hiển thị thông báo thành công
      toast.success("Cập nhật quyền người dùng thành công");

      // Đặt timeout nhỏ trước khi cập nhật danh sách để tránh đơ UI
      createManagedTimeout(() => {
        // Làm mới dữ liệu
        fetchUsers(page, search, roleFilter);
      }, 300);
    } catch (error) {
      console.error("Lỗi chi tiết khi cập nhật quyền:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);

      // Đóng thông báo loading
      toast.dismiss(toastId);
      toast.error(
        "Lỗi khi cập nhật quyền: " +
          (error.response?.data?.error || error.message),
      );

      // Tải lại dữ liệu để khôi phục UI về trạng thái server
      createManagedTimeout(() => {
        fetchUsers(page, search, roleFilter);
      }, 300);
    }
  };

  // Xử lý lưu thay đổi thông tin người dùng
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const userId = getUserId(currentUser);
    if (!userId) {
      toast.error("Không thể xác định người dùng để cập nhật");
      return;
    }

    setIsSubmitting(true);
    let toastId = toast.loading("Đang cập nhật thông tin người dùng...");

    try {
      await axios.patch(`/api/admin/users/${userId}`, editFormData);

      // Đóng dialog
      setIsEditDialogOpen(false);

      // Đóng thông báo loading
      toast.dismiss(toastId);

      // Hiển thị thông báo thành công
      toast.success("Cập nhật thông tin người dùng thành công");

      // Đặt timeout nhỏ trước khi cập nhật danh sách để tránh đơ UI
      createManagedTimeout(() => {
        // Cập nhật danh sách người dùng
        fetchUsers();
      }, 300);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      toast.dismiss(toastId);
      toast.error(
        "Lỗi khi cập nhật thông tin: " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async () => {
    if (!currentUser) return;

    const userId = getUserId(currentUser);
    if (!userId) {
      toast.error("Không thể xác định người dùng để xóa");
      return;
    }

    // Lưu trữ thông tin của user cần xóa để khôi phục nếu cần
    const userToDelete = { ...currentUser };

    // Đóng dialog ngay lập tức
    setIsDeleteOpen(false);

    // Đánh dấu đang xử lý
    setIsSubmitting(true);

    // Hiển thị thông báo đang xử lý
    const toastId = toast.loading("Đang xóa người dùng...");

    try {
      // Cập nhật UI ngay lập tức - xóa user khỏi danh sách trước khi hoàn tất API call
      // Điều này giúp tạo cảm giác phản hồi nhanh cho người dùng
      setUsers((prevUsers) =>
        prevUsers.filter((user) => getUserId(user) !== userId),
      );
      setTotalItems((prev) => Math.max(0, prev - 1));

      // Tiến hành gọi API xóa trên server
      await axios.delete(`/api/admin/users/${userId}`);

      // Sau khi xóa thành công, hiển thị thông báo
      toast.dismiss(toastId);
      toast.success("Xóa người dùng thành công");
    } catch (error) {
      // Nếu lỗi xảy ra, khôi phục lại danh sách user ban đầu
      console.error("Lỗi khi xóa người dùng:", error);
      toast.dismiss(toastId);
      toast.error(
        "Lỗi khi xóa người dùng: " +
          (error.response?.data?.error || error.message),
      );

      // Tải lại danh sách từ server để đảm bảo dữ liệu đồng bộ
      createManagedTimeout(() => {
        fetchUsers(page, search, roleFilter);
      }, 300);
    } finally {
      // Đặt lại trạng thái xử lý
      setIsSubmitting(false);

      // Ngắt mọi tham chiếu đến người dùng đã xóa
      setCurrentUser(null);
    }
  };

  // Xử lý thêm người dùng mới
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);
    let toastId = toast.loading("Đang tạo người dùng mới...");

    try {
      await axios.post(`/api/admin/users`, newUser);

      // Reset form
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "user", // Luôn reset về user
      });

      // Đóng dialog
      setIsAddUserOpen(false);

      // Đóng thông báo loading
      toast.dismiss(toastId);

      // Hiển thị thông báo thành công
      toast.success("Tạo người dùng mới thành công");

      // Đặt timeout nhỏ trước khi cập nhật danh sách để tránh đơ UI
      createManagedTimeout(() => {
        // Cập nhật danh sách người dùng
        fetchUsers();
      }, 300);
    } catch (error) {
      console.error("Lỗi khi tạo người dùng mới:", error);
      toast.dismiss(toastId);
      toast.error(
        "Lỗi khi tạo người dùng: " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy màu sắc badge dựa trên role
  const getRoleBadge = (role) => {
    console.log("Hiển thị badge cho role:", role);
    // Tìm thông tin vai trò từ danh sách đã định nghĩa
    const roleInfo = userRoles.find((r) => r.value === role);

    // Nếu không tìm thấy, hiển thị vai trò gốc trong database
    if (!roleInfo) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {role || "Không xác định"}
        </Badge>
      );
    }

    // Sử dụng các variants khác nhau của Badge component
    if (role === "admin") {
      return (
        <Badge variant="destructive" className="font-medium">
          {roleInfo.label}
        </Badge>
      );
    }

    if (role === "instructor") {
      return (
        <Badge className="bg-blue-500 font-medium hover:bg-blue-600">
          {roleInfo.label}
        </Badge>
      );
    }

    if (role === "student") {
      return (
        <Badge className="bg-green-500 font-medium hover:bg-green-600">
          {roleInfo.label}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="font-medium">
        {roleInfo.label}
      </Badge>
    );
  };

  // Tối ưu render cho TableRow bằng cách tạo một component con
  const UserTableRow = useCallback(
    ({ user, index }) => {
      const userId = getUserId(user);

      return (
        <TableRow
          key={userId || `user-${index}`}
          className="group cursor-pointer transition-colors hover:bg-muted/30"
        >
          <TableCell className="py-2.5 pl-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10 text-primary ring-4 ring-transparent transition-all duration-200 group-hover:ring-primary/5">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Chưa cập nhật"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.designation || "Chưa có chức danh"}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell className="py-2.5 text-sm font-medium">
            {user.email}
          </TableCell>
          <TableCell className="py-2.5 text-sm text-muted-foreground">
            {user.createdAt
              ? format(new Date(user.createdAt), "dd/MM/yyyy")
              : "Chưa có dữ liệu"}
          </TableCell>
          <TableCell>
            <Select
              value={user.role}
              onValueChange={(value) => {
                // Lấy userId từ hàm tiện ích
                const userId = getUserId(user);

                // Kiểm tra chi tiết về user và userId
                if (!user) {
                  console.error("Lỗi: user là null hoặc undefined");
                } else if (!userId) {
                  console.error("Lỗi: userId là null hoặc undefined", user);
                } else {
                  handleRoleChangeCallback(String(userId), value);
                }
              }}
            >
              <SelectTrigger
                className={cn(
                  "h-8 w-[120px] text-sm font-medium transition-colors",
                  user.role === "admin"
                    ? "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : user.role === "instructor"
                      ? "border-blue-200 bg-blue-100 text-blue-600 hover:bg-blue-200"
                      : user.role === "student"
                        ? "border-green-200 bg-green-100 text-green-600 hover:bg-green-200"
                        : "border-muted-foreground/20 bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                <SelectValue>
                  {(() => {
                    const roleInfo = userRoles.find(
                      (r) => r.value === user.role,
                    ) || {
                      label: user.role || "Không xác định",
                    };
                    return (
                      <div className="flex items-center">{roleInfo.label}</div>
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="center">
                {userRoles.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="font-medium"
                  >
                    <div className="flex items-center">{role.label}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell className="pr-3 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-70 transition-opacity hover:bg-muted group-hover:opacity-100"
                >
                  <span className="sr-only">Thao tác</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleViewUser(user)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEditUser(user)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteDialog(user)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Xóa</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      );
    },
    [
      handleRoleChangeCallback,
      handleViewUser,
      handleEditUser,
      handleDeleteDialog,
      getUserId,
      userRoles,
    ],
  );

  // Xử lý làm mới danh sách người dùng
  const handleRefresh = useCallback(async () => {
    // Đặt trạng thái loading ngay lập tức
    setLoading(true);

    // Hiển thị thông báo đang tải
    const toastId = toast.loading("Đang làm mới danh sách...");

    try {
      // Gọi API để lấy danh sách mới
      await fetchUsers(1, "", "all");

      // Đóng thông báo loading
      toast.dismiss(toastId);

      // Hiển thị thông báo thành công
      toast.success("Đã làm mới danh sách người dùng");
    } catch (error) {
      // Đóng thông báo loading
      toast.dismiss(toastId);

      // Hiển thị thông báo lỗi
      toast.error("Không thể làm mới danh sách: " + error.message);
    }
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Quản lý và phân quyền cho {totalItems} người dùng trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="h-10 gap-2 self-start bg-primary px-4 text-white shadow-sm transition-all duration-200 hover:bg-primary/90 md:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Thêm người dùng</span>
        </Button>
      </div>

      {/* Thanh tìm kiếm và lọc đơn giản */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm người dùng..."
            className="h-11 w-full pl-9" // tăng chiều cao
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchUsers(1, e.target.value, roleFilter);
              }
            }}
          />
        </div>

        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
          <SelectTrigger className="h-11 w-[140px] sm:w-[160px]">
            {" "}
            {/* tăng chiều cao */}
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {userRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bảng người dùng */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base font-medium">
                Danh sách người dùng
              </CardTitle>
              <CardDescription>
                {users.length > 0
                  ? `Hiển thị ${users.length} trên tổng số ${totalItems} người dùng`
                  : "Không có dữ liệu người dùng"}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span>Làm mới</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b bg-muted/30 hover:bg-transparent">
                  <TableHead className="w-[200px] py-2.5 pl-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Người dùng
                  </TableHead>
                  <TableHead className="w-[28%] py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="w-[130px] py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="w-[110px] py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Vai trò
                  </TableHead>
                  <TableHead className="w-[70px] py-2.5 pr-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow key="loading-row">
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow key="empty-row">
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <User className="h-6 w-6 stroke-1" />
                        </div>
                        <p className="font-medium">Không tìm thấy người dùng</p>
                        <p className="max-w-md text-center text-sm">
                          Không có người dùng nào phù hợp với bộ lọc hiện tại.
                          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => fetchUsers(1, "", "all")}
                          className="mt-2 text-primary"
                        >
                          Xóa bộ lọc và hiển thị tất cả
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <UserTableRow
                      key={getUserId(user) || index}
                      user={user}
                      index={index}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <CardFooter className="flex justify-center border-t px-6 py-5">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(page - 1)}
                      className={cn(
                        "transition-opacity duration-200",
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer",
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={page === pageNumber}
                          className="cursor-pointer transition-colors hover:bg-muted"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && (
                    <React.Fragment key="pagination-ellipsis">
                      <PaginationItem>
                        <div className="flex h-9 w-9 items-center justify-center">
                          ...
                        </div>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          isActive={page === totalPages}
                          className="cursor-pointer transition-colors hover:bg-muted"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(page + 1)}
                      className={cn(
                        "transition-opacity duration-200",
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </CardContent>
      </Card>

      {/* Dialog xem chi tiết người dùng */}
      {currentUser && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                Chi tiết người dùng
              </DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về người dùng
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] space-y-6 overflow-y-auto px-2 py-6">
              {/* Avatar và thông tin cơ bản */}
              <div className="flex flex-col items-center gap-3 border-b pb-6">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 text-primary shadow-sm">
                  {currentUser.profilePicture ? (
                    <img
                      src={currentUser.profilePicture}
                      alt={`${currentUser.firstName} ${currentUser.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {currentUser.firstName && currentUser.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : "Chưa cập nhật"}
                  </h3>
                  <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-4">
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                    Thông tin cơ bản
                  </h4>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        ID:
                      </span>
                      <span className="col-span-2 break-all rounded bg-muted p-1.5 font-mono text-sm">
                        {currentUser._id}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Email:
                      </span>
                      <span className="col-span-2 text-sm font-medium">
                        {currentUser.email}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Chức danh:
                      </span>
                      <span className="col-span-2 text-sm">
                        {currentUser.designation || "Chưa cập nhật"}
                      </span>
                    </div>

                    {currentUser.phone && (
                      <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">
                          Số điện thoại:
                        </span>
                        <span className="col-span-2 text-sm">
                          {currentUser.phone}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Ngày tạo:
                      </span>
                      <span className="col-span-2 text-sm">
                        {currentUser.createdAt
                          ? format(
                              new Date(currentUser.createdAt),
                              "dd/MM/yyyy HH:mm:ss",
                            )
                          : "Chưa có dữ liệu"}
                      </span>
                    </div>
                  </div>
                </div>

                {currentUser.bio && (
                  <div className="rounded-lg bg-muted/40 p-4">
                    <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                      Tiểu sử
                    </h4>
                    <div className="whitespace-pre-line rounded border bg-background p-3 text-sm">
                      {currentUser.bio}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex justify-between gap-2 border-t px-2 pt-4">
              <Button
                onClick={() => handleEditUser(currentUser)}
                variant="outline"
                className="gap-1.5"
              >
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog chỉnh sửa thông tin người dùng */}
      {currentUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Pencil className="h-4 w-4" />
                </div>
                Chỉnh sửa thông tin
              </DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho người dùng{" "}
                <span className="font-medium">{currentUser.email}</span>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-5 px-2 py-6">
              <div className="space-y-4 rounded-lg bg-muted/40 p-5">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right text-sm">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-email"
                      type="email"
                      className="border-input/60 focus-visible:ring-primary"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Email dùng để đăng nhập
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-firstName"
                    className="text-right text-sm"
                  >
                    Họ
                  </Label>
                  <Input
                    id="edit-firstName"
                    className="col-span-3 border-input/60 focus-visible:ring-primary"
                    value={editFormData.firstName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="Nguyễn"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-lastName" className="text-right text-sm">
                    Tên
                  </Label>
                  <Input
                    id="edit-lastName"
                    className="col-span-3 border-input/60 focus-visible:ring-primary"
                    value={editFormData.lastName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="Văn A"
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-between border-t px-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="relative px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative gap-2 px-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog xác nhận xóa người dùng */}
      {currentUser && (
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="border-b pb-4">
              <AlertDialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                Xác nhận xóa người dùng
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 pt-2">
                <p>
                  Bạn có chắc chắn muốn xóa người dùng{" "}
                  <span className="font-medium">{currentUser.email}</span>?
                </p>
                <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mr-2 inline-block h-4 w-4" />
                  Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên
                  quan đến người dùng này.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2 flex justify-between gap-2 border-t px-2 pt-4">
              <AlertDialogCancel className="relative">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="relative gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Xóa người dùng
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog thêm người dùng mới */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserPlus className="h-4 w-4" />
              </div>
              Thêm người dùng mới
            </DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo người dùng mới trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-5 px-2 py-6">
            <div className="space-y-4 rounded-lg bg-muted/40 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-sm">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    className="border-input/60 focus-visible:ring-primary"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email dùng để đăng nhập
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right text-sm">
                  Mật khẩu <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="border-input/60 focus-visible:ring-primary"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tối thiểu 8 ký tự
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right text-sm">
                  Vai trò <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-3">
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger className="border-input/60 focus-visible:ring-primary">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          className="font-medium"
                        >
                          <div className="flex items-center">{role.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4 pt-2">
                <Label htmlFor="name" className="pt-2 text-right text-sm">
                  Họ và tên
                </Label>
                <div className="col-span-3 space-y-3">
                  <Input
                    id="firstName"
                    placeholder="Họ (VD: Nguyễn)"
                    className="border-input/60 focus-visible:ring-primary"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                  <Input
                    id="lastName"
                    placeholder="Tên (VD: Văn A)"
                    className="border-input/60 focus-visible:ring-primary"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between border-t px-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Tạo người dùng
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
