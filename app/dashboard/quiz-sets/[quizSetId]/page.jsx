import AlertBanner from "@/components/alert-banner";
import { QuizSetAction } from "./_components/quiz-set-action";
import { TitleForm } from "./_components/title-form";
import { AddQuizForm } from "./_components/add-quiz-form";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";
import { Circle } from "lucide-react";
import { getQuizSetById } from "@/queries/quizzes";
import { QuizCardActions } from "./_components/quiz-card-action";

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const EditQuizSet = async ({ params: { quizSetId } }) => {
  const quizSet = await getQuizSetById(quizSetId);

  const quizzes = quizSet.quizIds.map((quiz) => {
    return {
      id: quiz._id.toString(),
      title: quiz.title,
      options: shuffleArray(
        quiz.options.map((option) => {
          return {
            label: option.text,
            isTrue: option.is_correct,
          };
        }),
      ),
    };
  });
  // console.log(quizzes);

  // const [quizes, setQuizes] = useState(initialQuizes);
  return (
    <>
      {!quizSet.active && (
        <AlertBanner
          label="Bài kiểm tra này chưa được xuất bản. Nó sẽ không hiển thị trong khoá học."
          variant="warning"
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-end">
          <QuizSetAction
            quizSetId={quizSetId}
            quiz={quizSet?.active}
            quizId={quizSet?.id}
          />
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quiz List */}
          <div className="max-lg:order-2">
            <h2 className="mb-6 text-xl">Danh sách các câu trắc nghiệm</h2>
            {quizzes.length === 0 && (
              <AlertBanner
                label="Chưa có câu hỏi nào trong bộ này, hãy thêm mới bằng form kế bên."
                variant="warning"
                className="mb-6 rounded"
              />
            )}

            <div className="space-y-6">
              {quizzes.map((quiz) => {
                return (
                  <div
                    key={quiz.id}
                    className="rounded-md border bg-gray-50 p-4 shadow-md lg:p-6"
                  >
                    <h2 className="mb-3">{quiz.title}</h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {quiz.options.map((option) => {
                        return (
                          <div
                            className={cn(
                              "flex items-center gap-1 rounded-sm py-1.5 text-sm text-gray-600",
                            )}
                            key={option.label}
                          >
                            {option.isTrue ? (
                              <CircleCheck className="size-4 text-emerald-500" />
                            ) : (
                              <Circle className="size-4" />
                            )}

                            <p>{option.label}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex items-center justify-end gap-2">
                      <QuizCardActions quiz={quiz} quizSetId={quizSetId} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/*  */}
          <div>
            <div className="flex items-center gap-x-2">
              <h2 className="text-xl">Tùy chỉnh nội dung câu hỏi</h2>
            </div>
            <div className="max-w-[800px]">
              <TitleForm
                initialData={{ title: quizSet.title }}
                quizSetId={quizSetId}
              />
            </div>

            <div className="max-w-[800px]">
              <AddQuizForm quizSetId={quizSetId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default EditQuizSet;
