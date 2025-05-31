import { getAllQuizSets } from "@/queries/quizzes";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const QuizSets = async () => {
  try {
    // Thêm cơ chế timeout cho toàn bộ quá trình lấy dữ liệu
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout khi lấy dữ liệu")), 15000),
    );

    // Lấy dữ liệu với promise race để đảm bảo không bị treo quá lâu
    const quzSetsall = await Promise.race([getAllQuizSets(), timeoutPromise]);

    // Xử lý trường hợp không có dữ liệu
    if (!quzSetsall || quzSetsall.length === 0) {
      return (
        <div className="p-6">
          <Alert className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Chưa có dữ liệu</AlertTitle>
            <AlertDescription>
              Hiện chưa có bộ câu hỏi nào. Bạn có thể thêm mới bằng nút bên
              dưới.
            </AlertDescription>
          </Alert>
          <DataTable columns={columns} data={[]} />
        </div>
      );
    }

    const mappedQuizSets = quzSetsall.map((q) => {
      return {
        id: q.id,
        title: q.title || "Không có tiêu đề",
        isPublished: q.active || false,
        totalQuiz: q.quizIds ? q.quizIds.length : 0,
      };
    });

    return (
      <div className="p-6">
        <DataTable columns={columns} data={mappedQuizSets} />
      </div>
    );
  } catch (error) {
    console.error("Lỗi khi tải danh sách quiz sets:", error);
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Đã xảy ra lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách bộ câu hỏi. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
        <DataTable columns={columns} data={[]} />
      </div>
    );
  }
};

export default QuizSets;
