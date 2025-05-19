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

        const [response] = await Promise.all([
          axios.get("/api/admin/courses", { params }),
          shouldShowFullLoading ? timeoutPromise : Promise.resolve(),
        ]);

        // Cập nhật state
        setCourses(response.courses || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Không thể tải danh sách khóa học");
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

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý khóa học</CardTitle>
              <CardDescription>
                Xem và duyệt các khóa học do giảng viên tạo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters row */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm khóa học..."
                className="pl-8"
                value={search}
                onChange={handleSearch}
              />
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {courseStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center">
                        {status.icon && (
                          <status.icon className="mr-2 h-4 w-4" />
                        )}
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                Không tìm thấy khóa học nào
              </h3>
              <p className="text-sm text-muted-foreground">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Giảng viên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày cập nhật</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                              <FileEdit className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="max-w-[200px]">
                            <div className="truncate font-medium">
                              {course.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {course.category
                                ? course.category.title
                                : "Chưa phân loại"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatInstructorName(course.instructor)}
                      </TableCell>
                      <TableCell>{getStatusBadge(course.status)}</TableCell>
                      <TableCell>
                        {course.modifiedOn
                          ? format(new Date(course.modifiedOn), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          : "Không rõ"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewCourse(course)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/courses/${course.id}`}
                                target="_blank"
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Xem trang chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {course.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApproveCourse(course.id)}
                                  className="text-green-600"
                                >
                                  <CheckCheck className="mr-2 h-4 w-4" />
                                  Duyệt khóa học
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectCourse(course)}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Từ chối khóa học
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && courses.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị <strong>{courses.length}</strong> trên tổng số{" "}
                <strong>{totalItems}</strong> khóa học
              </p>
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) handlePageChange(page - 1);
                        }}
                        aria-disabled={page === 1}
                        className={
                          page === 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(i + 1);
                          }}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) handlePageChange(page + 1);
                        }}
                        aria-disabled={page === totalPages}
                        className={
                          page === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedCourse.title}
                </DialogTitle>
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
              </DialogHeader>

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
                            <User className="h-6 w-6 text-primary" />
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
                        handleRejectCourse(selectedCourse);
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
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
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
              onClick={() => setIsRejectDialogOpen(false)}
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
    </div>
  );
}
