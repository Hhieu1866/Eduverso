import { getLoggedInUser } from "@/lib/loggedin-user";
import { Watch } from "@/model/watch-model";
import { getLesson } from "@/queries/lessons";
import { getModuleBySlug, getModuleById } from "@/queries/modules";
import { createWatchReport } from "@/queries/reports";
import { NextRequest, NextResponse } from "next/server";
import { Course } from "@/model/course-model";
import mongoose from "mongoose";
import { dbConnect } from "@/service/mongo";
import { getCache, setCache, createCacheKey, deleteCache } from "@/lib/cache";
import { Assessment } from "@/model/assessment-model";
import { createAssessmentReport } from "@/queries/reports";

const STARTED = "started";
const COMPLETED = "completed";
const WATCH_CACHE_TTL = 5 * 60 * 1000; // 5 phút

async function updateReport(userId, courseId, moduleId, lessonId) {
  try {
    return createWatchReport({ userId, courseId, moduleId, lessonId });
  } catch (error) {
    console.error("Lỗi khi cập nhật báo cáo:", error);
    return null;
  }
}

// Hàm tìm bài học tiếp theo trong module
async function findNextLessonInModule(courseId, moduleId, currentLessonId) {
  try {
    await dbConnect();

    // Kiểm tra cache
    const cacheKey = createCacheKey(
      "findNextLessonInModule",
      courseId,
      moduleId,
      currentLessonId,
    );
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Tìm module trong course
    const course = await Course.findById(courseId)
      .populate({
        path: "modules",
        populate: {
          path: "lessonIds",
        },
      })
      .lean();

    if (!course || !course.modules) return null;

    // Tìm module hiện tại
    const currentModule = course.modules.find(
      (m) => m._id.toString() === moduleId.toString(),
    );

    if (!currentModule || !currentModule.lessonIds) return null;

    // Sắp xếp bài học theo order
    const sortedLessons = [...currentModule.lessonIds].sort(
      (a, b) => a.order - b.order,
    );

    // Tìm index của bài học hiện tại
    const currentIndex = sortedLessons.findIndex(
      (l) => l._id.toString() === currentLessonId.toString(),
    );

    let result = null;

    if (currentIndex === -1 || currentIndex === sortedLessons.length - 1) {
      // Nếu là bài cuối cùng trong module, tìm module tiếp theo
      const allModules = [...course.modules].sort((a, b) => a.order - b.order);
      const currentModuleIndex = allModules.findIndex(
        (m) => m._id.toString() === moduleId.toString(),
      );

      if (
        currentModuleIndex !== -1 &&
        currentModuleIndex < allModules.length - 1
      ) {
        const nextModule = allModules[currentModuleIndex + 1];
        if (nextModule.lessonIds && nextModule.lessonIds.length > 0) {
          // Trả về bài đầu tiên của module tiếp theo
          const nextLessons = [...nextModule.lessonIds].sort(
            (a, b) => a.order - b.order,
          );
          result = {
            lesson: nextLessons[0],
            module: nextModule,
          };
        }
      }
    } else {
      // Trả về bài học tiếp theo trong cùng module
      result = {
        lesson: sortedLessons[currentIndex + 1],
        module: currentModule,
      };
    }

    // Lưu kết quả vào cache
    setCache(cacheKey, result, WATCH_CACHE_TTL);
    return result;
  } catch (error) {
    console.error("Lỗi khi tìm bài học tiếp theo:", error);
    return null;
  }
}

export async function GET(request) {
  try {
    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thực hiện thao tác này" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");
    const checkOnly = url.searchParams.get("checkOnly") === "true";
    const fetchAssessment = url.searchParams.get("fetchAssessment") === "true";
    const quizSetId = url.searchParams.get("quizSetId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Thiếu thông tin khóa học" },
        { status: 400 },
      );
    }

    // Xử lý yêu cầu lấy kết quả assessment
    if (fetchAssessment && quizSetId) {
      try {
        await dbConnect();

        console.log(
          `Đang tìm assessment cho user ${loggedInUser.id} với quizSet ${quizSetId}`,
        );

        // Tìm assessment mới nhất của người dùng cho quizSet này
        const assessment = await Assessment.findOne({
          quizSet: quizSetId,
          user: new mongoose.Types.ObjectId(loggedInUser.id),
        })
          .sort({ attemptedAt: -1 })
          .lean();

        if (assessment) {
          console.log(
            `Đã tìm thấy assessment với ID: ${assessment._id} cho user: ${loggedInUser.id}`,
          );
          return NextResponse.json({
            assessment: {
              score: assessment.score,
              totalQuestions: assessment.totalQuestions,
              percentage: assessment.percentage,
              isPassed: assessment.isPassed,
              nextAttemptAllowed: assessment.nextAttemptAllowed,
            },
          });
        } else {
          console.log(
            `Không tìm thấy assessment cho user ${loggedInUser.id} với quizSet ${quizSetId}`,
          );
          return NextResponse.json({
            message: "Không tìm thấy kết quả assessment",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy kết quả assessment:", error);
        return NextResponse.json(
          { error: "Có lỗi xảy ra khi lấy kết quả assessment" },
          { status: 500 },
        );
      }
    }

    if (checkOnly) {
      // Kiểm tra cache
      const cacheKey = createCacheKey(
        "hasStartedLearning",
        courseId,
        loggedInUser.id,
      );
      const cachedData = getCache(cacheKey);
      if (cachedData !== null) {
        return NextResponse.json({
          hasStarted: cachedData,
        });
      }

      await dbConnect();

      // Kiểm tra xem học viên đã bắt đầu học chưa
      const watchRecord = await Watch.findOne({
        user: new mongoose.Types.ObjectId(loggedInUser.id),
      }).lean();

      const result = !!watchRecord;

      // Lưu kết quả vào cache
      setCache(cacheKey, result, WATCH_CACHE_TTL);

      return NextResponse.json({
        hasStarted: result,
      });
    }

    return NextResponse.json(
      { error: "Phương thức không được hỗ trợ" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái học tập:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi kiểm tra trạng thái học tập" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const {
      courseId,
      lessonId,
      moduleSlug,
      state,
      lastTime,
      unlockNext,
      quizSetId,
      results,
    } = await request.json();

    console.log("API lesson-watch nhận được:", {
      courseId,
      quizSetId,
      resultsData: results,
    });

    const loggedinUser = await getLoggedInUser();

    if (!loggedinUser) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thực hiện thao tác này" },
        { status: 401 },
      );
    }

    // Xử lý kết quả quiz (nếu có)
    if (quizSetId && results) {
      try {
        console.log("Bắt đầu lưu kết quả quiz...");

        // Kiểm tra kết nối database
        await dbConnect();
        console.log("Kết nối database thành công");

        // Kiểm tra dữ liệu đầu vào
        if (!results.score && results.score !== 0) {
          console.error("Thiếu trường score trong kết quả quiz");
          return NextResponse.json(
            { error: "Dữ liệu kết quả không hợp lệ: thiếu trường score" },
            { status: 400 },
          );
        }

        if (!results.totalQuestions) {
          console.error("Thiếu trường totalQuestions trong kết quả quiz");
          return NextResponse.json(
            {
              error:
                "Dữ liệu kết quả không hợp lệ: thiếu trường totalQuestions",
            },
            { status: 400 },
          );
        }

        // Kiểm tra quizSetId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(quizSetId)) {
          console.error("quizSetId không hợp lệ:", quizSetId);
          return NextResponse.json(
            { error: "ID của bộ câu hỏi không hợp lệ" },
            { status: 400 },
          );
        }

        // Tính toán phần trăm điểm số
        const percentage = Math.round(
          (results.score / results.totalQuestions) * 100,
        );

        // Kiểm tra đạt điều kiện đậu (>=90%)
        const isPassed = percentage >= 90;

        // Thiết lập thời gian làm bài tiếp theo nếu chưa đạt
        const nextAttemptAllowed = isPassed
          ? null
          : new Date(Date.now() + 15 * 60 * 1000); // 15 phút

        console.log("Chuẩn bị tạo bản ghi assessment với dữ liệu:", {
          quizSet: quizSetId,
          user: loggedinUser.id,
          score: results.score,
          totalQuestions: results.totalQuestions,
          isPassed,
          percentage,
        });

        // Tạo bản ghi đánh giá cho quiz
        const assessment = await Assessment.create({
          quizSet: quizSetId,
          score: results.score,
          totalQuestions: results.totalQuestions,
          details: results.details || [],
          user: loggedinUser.id,
          isPassed: isPassed,
          percentage: percentage,
          attemptedAt: new Date(),
          nextAttemptAllowed: nextAttemptAllowed,
        });

        console.log("Đã tạo bản ghi assessment:", assessment._id.toString());

        // Cập nhật báo cáo
        if (courseId) {
          try {
            await createAssessmentReport({
              courseId,
              userId: loggedinUser.id,
              quizAssessment: assessment._id,
            });
            console.log("Đã cập nhật báo cáo đánh giá");
          } catch (reportError) {
            console.error("Lỗi khi cập nhật báo cáo đánh giá:", reportError);
            // Không ảnh hưởng đến luồng xử lý chính
          }
        }

        // Xóa tất cả cache liên quan
        try {
          deleteCache(
            createCacheKey("hasStartedLearning", courseId, loggedinUser.id),
          );
          deleteCache(createCacheKey("report", courseId, loggedinUser.id));
          console.log("Đã xóa cache liên quan");
        } catch (cacheError) {
          console.error("Lỗi khi xóa cache:", cacheError);
          // Không ảnh hưởng đến luồng xử lý chính
        }

        return NextResponse.json(
          {
            message: "Kết quả kiểm tra đã được lưu thành công",
            assessment: {
              score: results.score,
              totalQuestions: results.totalQuestions,
              percentage: percentage,
              isPassed: isPassed,
              nextAttemptAllowed: nextAttemptAllowed,
            },
          },
          { status: 200 },
        );
      } catch (error) {
        console.error("Lỗi khi lưu kết quả kiểm tra:", error);
        console.error("Chi tiết lỗi:", {
          message: error.message,
          stack: error.stack,
        });
        return NextResponse.json(
          {
            error: "Có lỗi xảy ra khi lưu kết quả kiểm tra",
            message: error.message,
          },
          { status: 500 },
        );
      }
    }

    // Xử lý trạng thái bài học
    if (state !== STARTED && state !== COMPLETED) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Thực hiện các truy vấn song song để tăng tốc độ
    const [lesson, module] = await Promise.all([
      getLesson(lessonId),
      getModuleBySlug(moduleSlug),
    ]);

    if (!lesson) {
      return NextResponse.json(
        { error: "Không tìm thấy bài học" },
        { status: 404 },
      );
    }

    if (!module) {
      return NextResponse.json(
        { error: "Không tìm thấy module" },
        { status: 404 },
      );
    }

    const watchEntry = {
      lastTime,
      lesson: lesson.id,
      module: module.id,
      user: loggedinUser.id,
      state,
    };

    // Xóa tất cả cache liên quan
    deleteCache(
      createCacheKey("hasStartedLearning", courseId, loggedinUser.id),
    );
    deleteCache(createCacheKey("report", courseId, loggedinUser.id));

    // Tìm bản ghi watch hiện tại
    const found = await Watch.findOne({
      lesson: lessonId,
      module: module.id,
      user: loggedinUser.id,
    }).lean();

    // Danh sách các tác vụ cần thực hiện
    const tasks = [];

    if (state === STARTED) {
      if (!found) {
        watchEntry["created_at"] = Date.now();
        tasks.push(Watch.create(watchEntry));
      }
    } else if (state === COMPLETED) {
      if (!found) {
        watchEntry["created_at"] = Date.now();
        tasks.push(Watch.create(watchEntry));
        tasks.push(
          updateReport(loggedinUser.id, courseId, module.id, lessonId),
        );
      } else {
        if (found.state !== COMPLETED) {
          watchEntry["modified_at"] = Date.now();
          tasks.push(
            Watch.findByIdAndUpdate(found._id, {
              state: COMPLETED,
              modified_at: Date.now(),
            }),
          );
          tasks.push(
            updateReport(loggedinUser.id, courseId, module.id, lessonId),
          );
        }
      }

      // Nếu có yêu cầu mở khóa bài tiếp theo
      if (unlockNext) {
        // Tìm bài học tiếp theo song song với các tác vụ khác
        const nextLessonPromise = findNextLessonInModule(
          courseId,
          module.id,
          lessonId,
        );

        // Thêm vào danh sách tác vụ
        tasks.push(
          nextLessonPromise.then(async (nextLessonInfo) => {
            if (nextLessonInfo) {
              // Kiểm tra watch record cho bài tiếp theo
              const nextLessonWatch = await Watch.findOne({
                lesson: nextLessonInfo.lesson._id,
                module: nextLessonInfo.module._id,
                user: loggedinUser.id,
              }).lean();

              // Nếu chưa có, tạo mới với state="started"
              if (!nextLessonWatch) {
                return Watch.create({
                  lesson: nextLessonInfo.lesson._id,
                  module: nextLessonInfo.module._id,
                  user: loggedinUser.id,
                  state: STARTED,
                  lastTime: 0,
                  created_at: Date.now(),
                  modified_at: Date.now(),
                });
              }
              // Không tự động thay đổi trạng thái của bài học đã tồn tại
              // Chỉ cập nhật khi bài học chưa bắt đầu
              else if (
                nextLessonWatch.state !== STARTED &&
                nextLessonWatch.state !== COMPLETED
              ) {
                return Watch.findByIdAndUpdate(nextLessonWatch._id, {
                  state: STARTED,
                  modified_at: Date.now(),
                });
              }
            }
            return null;
          }),
        );
      }
    }

    // Thực hiện tất cả các tác vụ song song
    await Promise.all(tasks);

    return NextResponse.json(
      {
        message: "Watch Record added Successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái học tập:", error);
    return NextResponse.json(
      {
        error: error.message || "Có lỗi xảy ra khi cập nhật trạng thái học tập",
      },
      { status: 500 },
    );
  }
}
