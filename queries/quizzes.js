import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { Quizset } from "@/model/quizset-model";
import { Quiz } from "@/model/quizzes-model";
import { dbConnect } from "@/service/mongo";

/**
 * Hàm helper để thử lại thao tác khi gặp lỗi
 * @param {Function} operation - Hàm thực hiện thao tác
 * @param {number} retries - Số lần thử lại
 * @param {number} delay - Thời gian chờ giữa các lần thử lại (ms)
 */
const withRetry = async (operation, retries = 3, delay = 300) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Nếu không phải lần đầu tiên, chờ một khoảng thời gian
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }

      return await operation();
    } catch (error) {
      console.error(`Lỗi lần thử ${attempt}/${retries}:`, error.message);
      lastError = error;

      // Nếu là lỗi timeout kết nối, đảm bảo kết nối lại
      if (error.message && error.message.includes("buffering timed out")) {
        try {
          // Kết nối lại trước lần thử tiếp theo
          await dbConnect();
        } catch (connError) {
          console.error("Lỗi kết nối lại:", connError.message);
        }
      }
    }
  }

  throw lastError;
};

export async function getAllQuizSets(excludeUnPublished) {
  try {
    // Đảm bảo kết nối MongoDB đã được thiết lập
    await dbConnect();

    // Thực hiện truy vấn với cơ chế thử lại
    return await withRetry(async () => {
      let quizSets = [];
      if (excludeUnPublished) {
        quizSets = await Quizset.find({ active: true }).lean();
      } else {
        quizSets = await Quizset.find().lean();
      }
      return replaceMongoIdInArray(quizSets);
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách quiz sets:", error.message);
    // Trả về mảng rỗng thay vì throw lỗi để tránh crash trang
    return [];
  }
}

export async function getQuizSetById(id) {
  try {
    // Đảm bảo kết nối MongoDB đã được thiết lập
    await dbConnect();

    return await withRetry(async () => {
      const quizSet = await Quizset.findById(id)
        .populate({
          path: "quizIds",
          model: Quiz,
          match: { active: true },
        })
        .lean();
      return replaceMongoIdInObject(quizSet);
    });
  } catch (error) {
    console.error(`Lỗi lấy quiz set id=${id}:`, error.message);
    return null;
  }
}

export async function getQuizSetByIdForInstructor(id) {
  try {
    // Đảm bảo kết nối MongoDB đã được thiết lập
    await dbConnect();

    return await withRetry(async () => {
      const quizSet = await Quizset.findById(id)
        .populate({
          path: "quizIds",
          model: Quiz,
        })
        .lean();
      return replaceMongoIdInObject(quizSet);
    });
  } catch (error) {
    console.error(`Lỗi lấy quiz set cho instructor id=${id}:`, error.message);
    return null;
  }
}

export async function createQuiz(quizData) {
  try {
    // Đảm bảo kết nối MongoDB đã được thiết lập
    await dbConnect();

    return await withRetry(async () => {
      const quiz = await Quiz.create(quizData);
      return quiz._id.toString();
    });
  } catch (error) {
    console.error("Lỗi tạo quiz mới:", error.message);
    throw new Error(`Không thể tạo quiz: ${error.message}`);
  }
}
