/**
 * Tiện ích xử lý hình ảnh cho ứng dụng
 */

// Map các loại ảnh với thư mục và ảnh mặc định
const IMAGE_CONFIG = {
  course: {
    folder: "/assets/images/courses/",
    default: "/assets/images/courses/default-course.jpg",
  },
  profile: {
    folder: "/assets/images/profiles/",
    default: "/assets/images/profiles/default-avatar.jpg",
  },
  category: {
    folder: "/assets/images/categories/",
    default: "/assets/images/categories/default-category.jpg",
  },
  default: {
    folder: "/assets/images/",
    default: "/assets/images/default.jpg",
  },
};

/**
 * Lấy URL hình ảnh hợp lệ dựa trên loại và đường dẫn đã cho
 * @param {string|Object} imageUrl - Đường dẫn hoặc object chứa thông tin hình ảnh
 * @param {string} type - Loại hình ảnh (course, profile, category, default)
 * @param {string|null} defaultImage - Đường dẫn hình ảnh mặc định tùy chọn
 * @returns {string} Đường dẫn hình ảnh hợp lệ
 */
export const getImageUrl = (imageUrl, type = "course", defaultImage = null) => {
  // Lấy cấu hình dựa vào loại
  const config = IMAGE_CONFIG[type] || IMAGE_CONFIG.default;
  const defaultImagePath = defaultImage || config.default;

  // Nếu không có URL ảnh, trả về ảnh mặc định
  if (!imageUrl) {
    return defaultImagePath;
  }

  // Xử lý trường hợp khi imageUrl là object
  if (typeof imageUrl === "object") {
    // Ưu tiên thumbnailUrl nếu có
    if (imageUrl.thumbnailUrl && !imageUrl.thumbnailUrl.includes("undefined")) {
      return imageUrl.thumbnailUrl;
    }

    // Sau đó xem xét thumbnail
    if (imageUrl.thumbnail && !imageUrl.thumbnail.includes("undefined")) {
      return `${config.folder}${imageUrl.thumbnail}`;
    }

    // Cuối cùng xem xét imageUrl trong object
    if (imageUrl.imageUrl && !imageUrl.imageUrl.includes("undefined")) {
      if (isAbsolutePath(imageUrl.imageUrl)) {
        return imageUrl.imageUrl;
      } else {
        return `${config.folder}${imageUrl.imageUrl}`;
      }
    }

    // Nếu không có giá trị nào hợp lệ, sử dụng ảnh mặc định
    return defaultImagePath;
  }

  // Kiểm tra xem URL đã là đường dẫn tuyệt đối chưa
  if (isAbsolutePath(imageUrl)) {
    return imageUrl;
  }

  // Trường hợp còn lại (giả sử đây là tên file) -> ghép với thư mục tương ứng
  return `${config.folder}${imageUrl}`;
};

/**
 * Kiểm tra xem một đường dẫn có phải là đường dẫn tuyệt đối không
 * @param {string} path - Đường dẫn cần kiểm tra
 * @returns {boolean} Đường dẫn có phải tuyệt đối không
 */
function isAbsolutePath(path) {
  return (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/uploads") ||
    path.startsWith("/api") ||
    (path.startsWith("/") && !path.startsWith("/assets/"))
  );
}

/**
 * Xác định có hiển thị ảnh hay không dựa trên URL ảnh
 * @param {string} imageUrl - URL ảnh cần kiểm tra
 * @returns {boolean} Có hiển thị ảnh hay không
 */
export const shouldDisplayImage = (imageUrl) => {
  return (
    !!imageUrl &&
    imageUrl !== "" &&
    imageUrl !== "undefined" &&
    !imageUrl.includes("undefined")
  );
};
