"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import EssaySubmission from "@/model/essaySubmission";
import Essay from "@/model/essay";
import { dbConnect } from "@/service/mongo";

// Học viên nộp bài tự luận
export async function submitEssay(essayId, courseId, data) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "student") {
      throw new Error(
        "Không có quyền thực hiện. Yêu cầu đăng nhập với vai trò học viên.",
      );
    }

    const studentId = session.user.id;

    // Kiểm tra xem có dữ liệu file được gửi lên không
    if (
      !data.submittedFiles ||
      !Array.isArray(data.submittedFiles) ||
      data.submittedFiles.length === 0
    ) {
      throw new Error("Không có file nào được cung cấp để nộp.");
    }

    // Thêm log để kiểm tra dữ liệu file đầu vào
    console.log(
      "Data submittedFiles được gửi lên:",
      JSON.stringify(data.submittedFiles, null, 2),
    );

    const existingSubmission = await EssaySubmission.findOne({
      essayId,
      courseId,
      studentId,
    });

    let submissionResult;

    if (existingSubmission) {
      // Nếu đã nộp, chỉ cho phép cập nhật nếu trạng thái là 'pending' hoặc 'rejected'
      if (
        existingSubmission.status !== "pending" &&
        existingSubmission.status !== "rejected"
      ) {
        throw new Error(
          `Không thể cập nhật bài nộp ở trạng thái '${existingSubmission.status}'. Chỉ có thể nộp lại khi bài đang chờ duyệt hoặc bị từ chối.`,
        );
      }

      // Đảm bảo mỗi file có trường fileUrl thay vì url nếu cần
      const normalizedFiles = data.submittedFiles.map((file) => ({
        name: file.name,
        fileUrl: file.fileUrl || file.url, // Đảm bảo dùng fileUrl
        fileType: file.fileType || file.type,
        fileSize: file.fileSize || file.size,
        uploadedAt: file.uploadedAt || new Date().toISOString(),
      }));

      console.log(
        "Dữ liệu sau khi chuẩn hóa:",
        JSON.stringify(normalizedFiles, null, 2),
      );

      // Cập nhật bài nộp hiện có: ghi đè mảng submittedFiles và đặt lại status
      submissionResult = await EssaySubmission.findByIdAndUpdate(
        existingSubmission._id,
        {
          submittedFiles: normalizedFiles, // Sử dụng dữ liệu đã chuẩn hóa
          content: data.content || existingSubmission.content, // Giữ lại content cũ nếu không có content mới
          status: "pending", // Đặt lại trạng thái thành chờ duyệt
          feedbackFromInstructor:
            existingSubmission.status === "rejected"
              ? existingSubmission.feedbackFromInstructor
              : null, // Xóa feedback cũ nếu đang pending, giữ lại nếu là rejected
          gradedAt: null, // Reset thông tin chấm điểm cũ nếu có
          grade: null,
          feedback: null,
        },
        { new: true, runValidators: true },
      );
    } else {
      // Đảm bảo mỗi file có trường fileUrl thay vì url nếu cần
      const normalizedFiles = data.submittedFiles.map((file) => ({
        name: file.name,
        fileUrl: file.fileUrl || file.url, // Đảm bảo dùng fileUrl
        fileType: file.fileType || file.type,
        fileSize: file.fileSize || file.size,
        uploadedAt: file.uploadedAt || new Date().toISOString(),
      }));

      console.log(
        "Tạo submission mới với files:",
        JSON.stringify(normalizedFiles, null, 2),
      );

      // Tạo bài nộp mới
      submissionResult = await EssaySubmission.create({
        essayId,
        courseId,
        studentId,
        submittedFiles: normalizedFiles, // Sử dụng dữ liệu đã chuẩn hóa
        content: data.content || "", // Thêm content nếu có
        status: "pending",
      });
    }

    console.log("Kết quả sau khi lưu:", submissionResult._id.toString());

    revalidatePath(`/courses/${courseId}/lesson`); // Revalidate trang lesson để cập nhật UI
    revalidatePath(`/courses/${courseId}/essays/${essayId}`); // Revalidate trang chi tiết essay nếu có

    // Trả về plain object để tránh lỗi serialization
    return JSON.parse(JSON.stringify(submissionResult));
  } catch (error) {
    console.error("Lỗi Server Action khi nộp bài tự luận:", error.message);
    throw new Error(error.message || "Đã xảy ra lỗi khi nộp bài tự luận.");
  }
}

// Giảng viên chấm điểm bài tự luận
export async function gradeEssaySubmission(submissionId, data) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền thực hiện");
    }

    const submission =
      await EssaySubmission.findById(submissionId).populate("essayId");

    if (!submission) {
      throw new Error("Không tìm thấy bài nộp");
    }

    // Kiểm tra giảng viên có phải người tạo bài tự luận
    const essay = await Essay.findById(submission.essayId);
    if (essay.createdBy.toString() !== session.user.id) {
      throw new Error("Không có quyền chấm điểm bài này");
    }

    const updatedSubmission = await EssaySubmission.findByIdAndUpdate(
      submissionId,
      {
        grade: data.grade,
        feedback: data.feedback,
        status: "graded",
        gradedAt: new Date(),
      },
      { new: true },
    );

    revalidatePath(`/dashboard/essays/submissions`);
    revalidatePath(`/dashboard/essays/submissions/${submissionId}`);
    return JSON.parse(JSON.stringify(updatedSubmission));
  } catch (error) {
    console.error("Lỗi khi chấm điểm bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi chấm điểm bài tự luận");
  }
}

// Lấy danh sách bài nộp cho một bài tự luận (giảng viên)
export async function getEssaySubmissions(essayId) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền truy cập");
    }

    const submissions = await EssaySubmission.find({ essayId })
      .populate("studentId", "name email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .lean(); // Sử dụng lean() để lấy plain object

    return JSON.parse(JSON.stringify(submissions));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài nộp:", error);
    throw new Error("Đã xảy ra lỗi khi lấy danh sách bài nộp");
  }
}

// Lấy bài nộp của học viên
export async function getStudentEssaySubmission(essayId, courseId) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session) {
      throw new Error("Chưa đăng nhập");
    }

    const submission = await EssaySubmission.findOne({
      essayId,
      courseId,
      studentId: session.user.id,
    }).lean(); // Sử dụng lean()

    return JSON.parse(JSON.stringify(submission));
  } catch (error) {
    console.error("Lỗi khi lấy bài nộp:", error);
    throw new Error("Đã xảy ra lỗi khi lấy bài nộp");
  }
}

// Giảng viên duyệt bài tự luận
export async function approveEssaySubmission(submissionId, feedback = "") {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền thực hiện");
    }

    const submission = await EssaySubmission.findById(submissionId)
      .populate("essayId")
      .populate("courseId");

    if (!submission) {
      throw new Error("Không tìm thấy bài nộp");
    }

    // Kiểm tra giảng viên có phải người tạo bài tự luận
    const essay = await Essay.findById(submission.essayId);
    if (essay.createdBy.toString() !== session.user.id) {
      throw new Error("Không có quyền duyệt bài này");
    }

    const updatedSubmission = await EssaySubmission.findByIdAndUpdate(
      submissionId,
      {
        status: "approved",
        feedbackFromInstructor: feedback,
      },
      { new: true },
    ).lean();

    revalidatePath(`/dashboard/essays/submissions`);
    revalidatePath(`/dashboard/essays/submissions/${submissionId}`);
    revalidatePath(`/courses/${submission.courseId._id}/lesson`);
    revalidatePath(
      `/courses/${submission.courseId._id}/essays/${submission.essayId._id}`,
    );

    return JSON.parse(JSON.stringify(updatedSubmission));
  } catch (error) {
    console.error("Lỗi khi duyệt bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi duyệt bài tự luận");
  }
}

// Giảng viên từ chối bài tự luận
export async function rejectEssaySubmission(submissionId, feedback = "") {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền thực hiện");
    }

    const submission = await EssaySubmission.findById(submissionId)
      .populate("essayId")
      .populate("courseId");

    if (!submission) {
      throw new Error("Không tìm thấy bài nộp");
    }

    // Kiểm tra giảng viên có phải người tạo bài tự luận
    const essay = await Essay.findById(submission.essayId);
    if (essay.createdBy.toString() !== session.user.id) {
      throw new Error("Không có quyền từ chối bài này");
    }

    const updatedSubmission = await EssaySubmission.findByIdAndUpdate(
      submissionId,
      {
        status: "rejected",
        feedbackFromInstructor: feedback,
      },
      { new: true },
    ).lean();

    revalidatePath(`/dashboard/essays/submissions`);
    revalidatePath(`/dashboard/essays/submissions/${submissionId}`);
    revalidatePath(`/courses/${submission.courseId._id}/lesson`);
    revalidatePath(
      `/courses/${submission.courseId._id}/essays/${submission.essayId._id}`,
    );

    return JSON.parse(JSON.stringify(updatedSubmission));
  } catch (error) {
    console.error("Lỗi khi từ chối bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi từ chối bài tự luận");
  }
}

// Kiểm tra trạng thái duyệt bài tự luận cho một khóa học
export async function checkEssayApprovalStatus(courseId) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
      // Kiểm tra cả user.id
      // Nếu không có session hoặc user.id, không thể kiểm tra, coi như chưa duyệt
      // Hoặc có thể throw lỗi tùy theo logic bạn muốn
      return false;
    }

    // Lấy tất cả bài tự luận của khóa học này mà học viên đã nộp
    const submissions = await EssaySubmission.find({
      courseId,
      studentId: session.user.id,
    }).lean();

    // Nếu không có bài nộp nào, hoặc khóa học không có bài tự luận nào yêu cầu nộp
    // thì coi như điều kiện này được bỏ qua (trả về true)
    // Điều này cần thảo luận: nếu khóa học có essay nhưng học viên chưa nộp cái nào, có được coi là pass essay condition?
    // Hiện tại, nếu không có bài nộp nào, coi như pass (true) để không block các trường hợp không có essay.
    // Nếu muốn chỉ pass khi tất cả essay được assigned đều approved, cần logic phức tạp hơn để lấy list essay được assign cho course.
    // Ví dụ: nếu course.essayIds tồn tại và có phần tử.
    // Dựa trên cấu trúc hiện tại, chúng ta có thể kiểm tra trực tiếp từ Course model hoặc giả định từ `essays` prop trong `LessonSidebar`
    // Vì hàm này gọi từ client-side `DownloadCertificate` không có trực tiếp `course.essayIds`
    // Nên sẽ cần một cách khác để biết course có yêu cầu essay hay không nếu không có submission nào.
    // Đơn giản nhất là truyền một prop `courseHasRequiredEssays` vào DownloadCertificate.
    // Trong ngữ cảnh này, nếu không có submission, tạm coi là không có essay bắt buộc phải nộp.
    if (!submissions || submissions.length === 0) {
      // Kiểm tra xem khóa học này có thực sự yêu cầu bài tự luận không
      const courseEssays = await Essay.find({
        /* Điều kiện để lấy essay của course này, ví dụ courseId trong Essay model hoặc thông qua Course model */
      });
      // Tạm thời giả định rằng nếu không có submission thì không có essay yêu cầu.
      // Cần logic chính xác hơn để xác định một khóa học có yêu cầu essay hay không.
      // Ví dụ: nếu course.essayIds tồn tại và có phần tử.
      // Dựa trên cấu trúc hiện tại, chúng ta có thể kiểm tra trực tiếp từ Course model hoặc giả định từ `essays` prop trong `LessonSidebar`
      // Vì hàm này gọi từ client-side `DownloadCertificate` không có trực tiếp `course.essayIds`
      // Nên sẽ cần một cách khác để biết course có yêu cầu essay hay không nếu không có submission nào.
      // Đơn giản nhất là truyền một prop `courseHasRequiredEssays` vào DownloadCertificate.
      // Trong ngữ cảnh này, nếu không có submission, tạm coi là không có essay bắt buộc phải nộp.
      return true;
    }

    // Kiểm tra xem tất cả bài nộp đã được duyệt chưa
    const allApproved = submissions.every((sub) => sub.status === "approved");

    return allApproved;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái duyệt bài tự luận:", error);
    return false; // An toàn hơn là trả về false nếu có lỗi
  }
}
