import { auth } from "@/auth";
import {
  getCourseDetails,
  getCourseDetailsByInstructor,
} from "@/queries/courses";
import { getReport } from "@/queries/reports";
import { getUserByEmail, getUserDetails } from "@/queries/users";

export const COURSE_DATA = "course";
export const ENROLLMENT_DATA = "enrollment";
export const REVIEW_DATA = "review";

const populateReviewData = async (reviews) => {
  const populatedReviews = await Promise.all(
    reviews.map(async (review) => {
      const student = await getUserDetails(review?.user?._id);
      review["studentName"] = `${student?.firstName} ${student?.lastName}`;
      review["studentAvatar"] = student?.profilePicture || null;
      review["studentEmail"] = student?.email || null;
      return review;
    }),
  );
  return populatedReviews;
};

export async function getInstructorDashboardData(dataType) {
  try {
    const session = await auth();
    const instructor = await getUserByEmail(session?.user?.email);
    //console.log(instructor);
    const data = await getCourseDetailsByInstructor(instructor?.id, true);

    switch (dataType) {
      case COURSE_DATA:
        return data?.courses;

      case REVIEW_DATA:
        return populateReviewData(data?.reviews);

      case ENROLLMENT_DATA:
        return populateEnrollmentData(data?.enrollments);

      default: {
        // Tính lại avgRating nếu cần
        let avgRating = 0;
        if (Array.isArray(data?.reviews) && data.reviews.length > 0) {
          const total = data.reviews.reduce(
            (acc, r) => acc + (r.rating || 0),
            0,
          );
          avgRating = total / data.reviews.length;
        }
        return {
          ...data,
          ratings: Number(avgRating.toFixed(2)),
        };
      }
    }
  } catch (error) {
    throw new Error(error);
  }
}

const populateEnrollmentData = async (enrollments) => {
  //console.log(enrollments);

  const populatedEnrollments = await Promise.all(
    enrollments.map(async (enrollment) => {
      //console.log(enrollment);
      // Update student information
      const student = await getUserDetails(enrollment?.student?._id);
      // console.log(student);
      enrollment["studentName"] = `${student?.firstName} ${student?.lastName}`;
      enrollment["studentEmail"] = student?.email;

      // Update quiz and Progress info
      const filter = {
        course: enrollment?.course?._id,
        student: enrollment?.student?._id,
      };

      const report = await getReport(filter);
      //console.log(report);
      enrollment["progress"] = 0;
      enrollment["quizMark"] = 0;

      if (report) {
        // Calculate Progress
        const course = await getCourseDetails(enrollment?.course?._id);
        //console.log(course);
        const totalModules = course?.modules?.length || 1; // Tránh chia cho 0
        const totalCompletedModules =
          report?.totalCompletedModeules?.length || 0;

        // Tính tiến trình và làm tròn đến 2 chữ số thập phân
        const progressRaw = (totalCompletedModules / totalModules) * 100;
        // Làm tròn để tránh số thập phân dài
        const progress = Math.round(progressRaw * 100) / 100;
        enrollment["progress"] = progress;

        /// Calculate Quiz Marks
        const quizzes = report?.quizAssessment?.assessments || [];
        const quizzesTaken = quizzes.filter((q) => q.attempted);
        // find how many quizzes answered correct
        const totalCorrect = quizzesTaken
          .map((quiz) => {
            const item = quiz.options || [];
            return (
              item.filter((o) => {
                return o.isCorrect === true && o.isSelected === true;
              }) || []
            );
          })
          .filter((elem) => elem.length > 0)
          .flat();
        const marksFromQuizzes = totalCorrect?.length * 5;
        enrollment["quizMark"] = marksFromQuizzes;
      }
      return enrollment;
    }),
  );
  return populatedEnrollments;
};
