// Hàm để tìm bài học tiếp theo dựa trên module và bài học hiện tại
export const findNextLesson = (modules, currentModuleId, currentLessonId) => {
  if (!modules || modules.length === 0) return null;

  // Sắp xếp modules theo thứ tự
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  // Tìm module hiện tại
  const currentModuleIndex = sortedModules.findIndex(
    (module) => module.id.toString() === currentModuleId.toString(),
  );

  if (currentModuleIndex === -1) return null;

  const currentModule = sortedModules[currentModuleIndex];

  // Sắp xếp bài học trong module hiện tại theo thứ tự
  if (!currentModule.lessonIds || currentModule.lessonIds.length === 0)
    return null;

  const sortedLessons = [...currentModule.lessonIds].sort(
    (a, b) => a.order - b.order,
  );

  // Tìm bài học hiện tại
  const currentLessonIndex = sortedLessons.findIndex(
    (lesson) => lesson.id.toString() === currentLessonId.toString(),
  );

  if (currentLessonIndex === -1) return null;

  // Nếu có bài học tiếp theo trong cùng module
  if (currentLessonIndex < sortedLessons.length - 1) {
    return {
      lesson: sortedLessons[currentLessonIndex + 1],
      module: currentModule,
    };
  }

  // Nếu là bài học cuối cùng trong module, tìm module tiếp theo
  if (currentModuleIndex < sortedModules.length - 1) {
    const nextModule = sortedModules[currentModuleIndex + 1];

    // Lấy bài học đầu tiên trong module tiếp theo
    if (nextModule.lessonIds && nextModule.lessonIds.length > 0) {
      const nextModuleLessons = [...nextModule.lessonIds].sort(
        (a, b) => a.order - b.order,
      );

      return {
        lesson: nextModuleLessons[0],
        module: nextModule,
      };
    }
  }

  // Không tìm thấy bài học tiếp theo
  return null;
};
