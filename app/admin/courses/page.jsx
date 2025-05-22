"use client";

import { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileEdit,
  Eye,
  CheckCheck,
  X,
  MoreHorizontal,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  UserIcon,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Danh sách trạng thái khóa học
  const courseStatuses = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Đang chờ duyệt", icon: Clock },
    { value: "approved", label: "Đã duyệt", icon: CheckCircle2 },
    { value: "rejected", label: "Đã từ chối", icon: AlertTriangle },
    { value: "draft", label: "Bản nháp", icon: FileEdit },
  ];

  // Hàm fetch danh sách khóa học từ API
  const fetchCourses = useCallback(
    async (currentPage = page, searchTerm = search, status = statusFilter) => {
      try {
        // Chỉ hiển thị trạng thái loading khi không có dữ liệu
        const shouldShowFullLoading = courses.length === 0;
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

        if (status && status !== "all") {
          params.status = status;
        }

        // Thêm timeout để tránh UI flickering khi dữ liệu tải nhanh
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 300),
        );

        // Cấu hình retry cho request này
        const requestConfig = {
          params,
          retry: 3,
          retryDelay: 1000,
        };

        const [response] = await Promise.all([
          axios.get("/api/admin/courses", requestConfig),
          shouldShowFullLoading ? timeoutPromise : Promise.resolve(),
        ]);

        // Kiểm tra đảm bảo response hợp lệ
        if (!response || !response.courses) {
          throw new Error("Dữ liệu trả về không hợp lệ");
        }

        // Cập nhật state
        setCourses(response.courses || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      } catch (error) {
        console.error("Error fetching courses:", error);

        // Hiển thị thông báo lỗi chi tiết hơn
        let errorMessage = "Không thể tải danh sách khóa học";

        if (error.response) {
          // Lỗi từ server với response
          errorMessage += `: ${error.response.data?.error || `Lỗi ${error.response.status}`}`;
        } else if (error.code === "ERR_NETWORK") {
          // Lỗi kết nối mạng
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.";
        } else if (error.code === "ECONNABORTED") {
          // Lỗi timeout
          errorMessage =
            "Yêu cầu bị hủy do quá thời gian. Vui lòng thử lại sau.";
        } else if (error.message) {
          // Các lỗi khác có thông báo
          errorMessage += `: ${error.message}`;
        }

        toast.error(errorMessage);

        // Đặt courses rỗng nếu có lỗi để hiển thị trạng thái trống
        setCourses([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [
      /* không sử dụng courses.length */
    ],
  );

  // Tải dữ liệu khi component mount và khi các filter thay đổi
  useEffect(() => {
    fetchCourses(page, search, statusFilter);
  }, [fetchCourses, page, search, statusFilter]);

  // Không gọi fetchCourses trực tiếp trong các handler, mà thay đổi state để trigger useEffect
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1); // Reset về trang 1 khi thay đổi filter
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setIsDetailOpen(true);
  };

  const handleRejectCourse = (course) => {
    setSelectedCourse(course);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  // Xử lý duyệt khóa học
  const handleApproveCourse = async (courseId) => {
    try {
      setIsSubmitting(true);

      await axios.patch(`/api/admin/courses/${courseId}`, {
        action: "approve",
      });

      toast.success("Khóa học đã được duyệt thành công");

      // Refresh danh sách
      fetchCourses();

      // Đóng dialog nếu đang mở
      if (selectedCourse?.id === courseId) {
        setIsDetailOpen(false);
      }
    } catch (error) {
      console.error("Error approving course:", error);
      toast.error(error.response?.data?.error || "Không thể duyệt khóa học");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý từ chối khóa học
  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.patch(`/api/admin/courses/${selectedCourse.id}`, {
        action: "reject",
        reason: rejectionReason,
      });

      toast.success("Đã từ chối khóa học");

      // Refresh danh sách
      fetchCourses();

      // Đóng dialog
      setIsRejectDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast.error(error.response?.data?.error || "Không thể từ chối khóa học");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị trạng thái khóa học dưới dạng badge
  const getStatusBadge = useCallback((status) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Bản nháp</Badge>;
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" /> Đang chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" /> Bị từ chối
          </Badge>
        );
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  }, []);

  // Format tên giảng viên
  const formatInstructorName = useCallback((instructor) => {
    if (!instructor) return "Không xác định";
    return (
      `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() ||
      instructor.email
    );
  }, []);

  // Thêm hàm làm mới
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    const toastId = toast.loading("Đang làm mới danh sách...");
    try {
      await fetchCourses(1, "", "all");
      toast.dismiss(toastId);
      toast.success("Đã làm mới danh sách khoá học");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Không thể làm mới danh sách: " + error.message);
    }
  }, [fetchCourses]);

  const handleDeleteDialog = (course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse || isSubmitting) return;

    const courseId = selectedCourse.id;
    if (!courseId) {
      toast.error("Không thể xác định khóa học để xóa");
      setIsSubmitting(false);
      return;
    }

    setIsDeleteOpen(false);
    setSelectedCourse(null);

    setIsSubmitting(true);
    const toastId = toast.loading("Đang xóa khoá học...");

    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId),
    );
    setTotalItems((prev) => Math.max(0, prev - 1));

    try {
      await axios.delete(`/api/admin/courses/${courseId}`);
      toast.dismiss(toastId);
      toast.success("Xóa khoá học thành công");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(
        "Lỗi khi xóa khoá học: " +
          (error.response?.data?.error || error.message),
      );
      console.error("Lỗi khi xóa khoá học:", error);

      fetchCourses(page, search, statusFilter);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm đóng dialog chi tiết
  const closeDetailDialog = () => {
    setIsDetailOpen(false);
  };
  // Hàm đóng dialog xóa
  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };
  // Hàm đóng dialog từ chối
  const closeRejectDialog = () => {
    setIsRejectDialogOpen(false);
  };

  // Xử lý focus khi đóng Dialog
  useEffect(() => {
    // Cleanup focus khi component unmount hoặc dialog đóng
    return () => {
      // Đảm bảo không có element nào bị focus sau khi dialog đóng
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
  }, [isDetailOpen, isRejectDialogOpen, isDeleteOpen]);

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Quản lý khoá học
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Xem và duyệt {totalItems} khoá học do giảng viên tạo
          </p>
        </div>
        {/* Nút hành động chính (có thể thêm sau nếu cần) */}
      </div>

      {/* Thanh filter & search */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm khoá học..."
            className="h-11 w-full pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                fetchCourses(1, e.target.value, statusFilter);
              }
            }}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="h-11 w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {courseStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <div className="flex items-center">
                  {status.icon && <status.icon className="mr-2 h-4 w-4" />}
                  {status.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card Table */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base font-medium">
                Danh sách khoá học
              </CardTitle>
              <CardDescription>
                {courses.length > 0
                  ? `Hiển thị ${courses.length} trên tổng số ${totalItems} khoá học`
                  : "Không có dữ liệu khoá học"}
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
                <Loader2 className="animate-spin-fast h-3 w-3" />
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
                  <TableHead className="w-[220px] py-2.5 pl-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Khoá học
                  </TableHead>
                  <TableHead className="w-[20%] py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Giảng viên
                  </TableHead>
                  <TableHead className="w-[120px] py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </TableHead>
                  <TableHead className="w-[130px] py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ngày cập nhật
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
                        <Loader2 className="animate-spin-fast h-5 w-5 text-primary" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow key="empty-row">
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <FileEdit className="h-6 w-6 stroke-1" />
                        </div>
                        <p className="font-medium">Không tìm thấy khoá học</p>
                        <p className="max-w-md text-center text-sm">
                          Không có khoá học nào phù hợp với bộ lọc hiện tại. Thử
                          thay đổi từ khoá tìm kiếm hoặc bộ lọc.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("all");
                            setPage(1);
                            fetchCourses(1, "", "all");
                          }}
                          className="mt-2 text-primary"
                        >
                          Xoá bộ lọc và hiển thị tất cả
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow
                      key={course.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="py-2.5 pl-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-primary/10 text-primary ring-4 ring-transparent transition-all duration-200 group-hover:ring-primary/5">
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FileEdit className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="max-w-[160px] truncate text-sm font-medium">
                              {course.title}
                            </div>
                            <div className="max-w-[160px] truncate text-xs text-muted-foreground">
                              {course.category
                                ? course.category.title
                                : "Chưa phân loại"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-sm font-medium">
                        {formatInstructorName(course.instructor)}
                      </TableCell>
                      <TableCell className="py-2.5">
                        {getStatusBadge(course.status)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-muted-foreground">
                        {course.modifiedOn
                          ? format(new Date(course.modifiedOn), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          : "Không rõ"}
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
                              onClick={() => handleViewCourse(course)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Xem chi tiết</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {course.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApproveCourse(course.id)}
                                  className="text-green-600"
                                >
                                  <CheckCheck className="mr-2 h-4 w-4" />
                                  Duyệt khoá học
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectCourse(course)}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Từ chối khoá học
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteDialog(course)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Xóa</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <CardFooter className="flex justify-center border-t px-6 py-5">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && handlePageChange(page - 1)}
                      className={
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer transition-opacity duration-200"
                      }
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
                    <>
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
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        page < totalPages && handlePageChange(page + 1)
                      }
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer transition-opacity duration-200"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </CardContent>
      </Card>

      {/* Course Detail Dialog */}
      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Đảm bảo blur focus trước khi đóng dialog
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            setIsDetailOpen(false);
            setTimeout(() => setSelectedCourse(null), 200);
          } else {
            setIsDetailOpen(open);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedCourse?.title || "Chi tiết khóa học"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Xem thông tin chi tiết về khóa học và thực hiện các thao tác quản
              lý.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getStatusBadge(selectedCourse.status)}
                <span>
                  Ngày cập nhật:{" "}
                  {selectedCourse.modifiedOn
                    ? format(
                        new Date(selectedCourse.modifiedOn),
                        "dd/MM/yyyy HH:mm",
                        {
                          locale: vi,
                        },
                      )
                    : "Không rõ"}
                </span>
              </div>

              <div className="space-y-4">
                {/* Thumbnail */}
                {selectedCourse.thumbnailUrl && (
                  <div className="overflow-hidden rounded-md border">
                    <img
                      src={selectedCourse.thumbnailUrl}
                      alt={selectedCourse.title}
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                )}

                {/* Course info grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      Thông tin cơ bản
                    </h3>
                    <div className="space-y-2 rounded-md border p-4">
                      <div>
                        <span className="text-sm font-medium">Tiêu đề:</span>
                        <p>{selectedCourse.title}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          Tiêu đề phụ:
                        </span>
                        <p>{selectedCourse.subtitle || "Không có"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Danh mục:</span>
                        <p>
                          {selectedCourse.category?.title || "Chưa phân loại"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Giá:</span>
                        <p>
                          {selectedCourse.price === 0
                            ? "Miễn phí"
                            : `${selectedCourse.price.toLocaleString()} VNĐ`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      Giảng viên
                    </h3>
                    <div className="space-y-2 rounded-md border p-4">
                      <div className="flex items-center gap-2">
                        {selectedCourse.instructor?.profilePicture ? (
                          <img
                            src={selectedCourse.instructor.profilePicture}
                            alt={formatInstructorName(
                              selectedCourse.instructor,
                            )}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <UserIcon className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {formatInstructorName(selectedCourse.instructor)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCourse.instructor?.email ||
                              "Không có email"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Mô tả khóa học
                  </h3>
                  <div className="rounded-md border p-4">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedCourse.description || "Không có mô tả",
                      }}
                    />
                  </div>
                </div>

                {/* Modules */}
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Các chương ({selectedCourse.modules?.length || 0})
                  </h3>
                  <div className="rounded-md border">
                    {selectedCourse.modules &&
                    selectedCourse.modules.length > 0 ? (
                      <div className="divide-y" key="modules-list">
                        {selectedCourse.modules.map((module, idx) => (
                          <div
                            key={module.id || module._id || idx}
                            className="p-4"
                          >
                            <div className="mb-1 font-medium">
                              {module.title}
                            </div>
                            <div className="ml-2 mt-1">
                              {Array.isArray(module.lessonIds) &&
                              module.lessonIds.length > 0 ? (
                                <ul className="list-disc space-y-1 pl-4">
                                  {module.lessonIds.map((lesson, lidx) => (
                                    <li
                                      key={lesson.id || lesson._id || lidx}
                                      className="text-sm text-muted-foreground"
                                    >
                                      {lesson.title || "(Không có tiêu đề)"}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-sm italic text-muted-foreground">
                                  Chưa có bài học
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Chưa có chương nào
                      </div>
                    )}
                  </div>
                </div>

                {/* Quiz */}
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Quiz của khóa học
                  </h3>
                  {selectedCourse.quizSet &&
                  Array.isArray(selectedCourse.quizSet.quizIds) &&
                  selectedCourse.quizSet.quizIds.length > 0 ? (
                    <ul className="list-decimal space-y-1 pl-4">
                      {selectedCourse.quizSet.quizIds.map((quiz, qidx) => (
                        <li
                          key={quiz.id || quiz._id || qidx}
                          className="text-sm"
                        >
                          <span className="font-medium">{quiz.title}</span>
                          {quiz.options && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({quiz.options.length} đáp án)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm italic text-muted-foreground">
                      Chưa có quiz
                    </div>
                  )}
                </div>

                {/* Rejection reason */}
                {selectedCourse.status === "rejected" &&
                  selectedCourse.rejectionReason && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-destructive">
                        Lý do từ chối
                      </h3>
                      <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
                        <p>{selectedCourse.rejectionReason}</p>
                      </div>
                    </div>
                  )}
              </div>

              <DialogFooter className="gap-2">
                {selectedCourse.status === "pending" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsDetailOpen(false);
                        setTimeout(() => {
                          handleRejectCourse(selectedCourse);
                        }, 100);
                      }}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Từ chối
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleApproveCourse(selectedCourse.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Spinner className="mr-2" />
                      ) : (
                        <ThumbsUp className="mr-2 h-4 w-4" />
                      )}
                      Duyệt khóa học
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={closeDetailDialog}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={isRejectDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Đảm bảo blur focus trước khi đóng dialog
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            setIsRejectDialogOpen(false);
            setTimeout(() => setSelectedCourse(null), 200);
          } else {
            setIsRejectDialogOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để giảng viên có thể hiểu và cải thiện
              khóa học.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Khóa học:</h4>
              <div className="rounded-md bg-secondary p-2">
                {selectedCourse?.title || ""}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Lý do từ chối:</h4>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối chi tiết..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeRejectDialog}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? (
                <Spinner className="mr-2" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa khoá học */}
      {selectedCourse && (
        <AlertDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            if (!open) {
              // Đảm bảo blur focus trước khi đóng dialog
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              setIsDeleteOpen(false);
              setTimeout(() => setSelectedCourse(null), 200);
            } else {
              setIsDeleteOpen(open);
            }
          }}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="border-b pb-4">
              <AlertDialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                Xác nhận xóa khoá học
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                Bạn có chắc chắn muốn xóa khoá học{" "}
                <span className="font-medium">{selectedCourse.title}</span>?
              </AlertDialogDescription>
              <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="mr-2 inline-block h-4 w-4" />
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên
                quan đến khoá học này.
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2 flex justify-between gap-2 border-t px-2 pt-4">
              <AlertDialogCancel
                className="relative"
                onClick={closeDeleteDialog}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCourse}
                className="relative gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin-fast h-4 w-4" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Xóa khoá học
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
