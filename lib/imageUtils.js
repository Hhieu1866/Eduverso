export const getImageUrl = (imageUrl, type = "course", defaultImage = null) => {
  console.log("getImageUrl input:", { imageUrl, type, defaultImage });

  // Map các loại ảnh với thư mục tương ứng
  const typeToFolder = {
    course: "/assets/images/courses/",
    profile: "/assets/images/profiles/",
    category: "/assets/images/categories/",
    default: "/assets/images/",
  };

  // Map các loại ảnh với ảnh mặc định
  const defaultImages = {
    course: "/assets/images/courses/default-course.jpg",
    profile: "/assets/images/profiles/default-avatar.jpg",
    category: "/assets/images/categories/default-category.jpg",
    default: "/assets/images/default.jpg",
  };

  // Nếu không có URL ảnh, trả về ảnh mặc định
  if (!imageUrl) {
    const result = defaultImage || defaultImages[type] || defaultImages.default;
    console.log("No imageUrl, returning default:", result);
    return result;
  }

  // Xử lý trường hợp khi imageUrl là object (cho phép tương thích với cách xử lý của dashboard)
  if (typeof imageUrl === "object") {
    console.log("imageUrl is an object:", imageUrl);

    // Ưu tiên thumbnailUrl nếu có
    if (imageUrl.thumbnailUrl) {
      console.log("Using thumbnailUrl from object:", imageUrl.thumbnailUrl);
      return imageUrl.thumbnailUrl;
    }

    // Sau đó xem xét thumbnail
    if (imageUrl.thumbnail && !imageUrl.thumbnail.includes("undefined")) {
      const result = `${typeToFolder[type]}${imageUrl.thumbnail}`;
      console.log("Using thumbnail from object:", result);
      return result;
    }

    // Cuối cùng xem xét imageUrl trong object
    if (imageUrl.imageUrl && !imageUrl.imageUrl.includes("undefined")) {
      if (
        imageUrl.imageUrl.startsWith("http") ||
        imageUrl.imageUrl.startsWith("/")
      ) {
        console.log(
          "Using imageUrl from object (full path):",
          imageUrl.imageUrl,
        );
        return imageUrl.imageUrl;
      } else {
        const result = `${typeToFolder[type]}${imageUrl.imageUrl}`;
        console.log("Using imageUrl from object (relative path):", result);
        return result;
      }
    }

    // Nếu không có giá trị nào hợp lệ, sử dụng ảnh mặc định
    const result = defaultImage || defaultImages[type] || defaultImages.default;
    console.log("No valid property in object, returning default:", result);
    return result;
  }

  // Nếu đã là URL đầy đủ
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    console.log("Using full URL:", imageUrl);
    return imageUrl;
  }

  // Nếu bắt đầu bằng /uploads (NextJS tự động xử lý)
  if (imageUrl.startsWith("/uploads") || imageUrl.startsWith("/api")) {
    console.log("Using uploads or API path:", imageUrl);
    return imageUrl;
  }

  // Nếu bắt đầu bằng dấu / -> đây là đường dẫn tương đối từ gốc
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("/assets/")) {
    console.log("Using relative path from root:", imageUrl);
    return imageUrl;
  }

  // Trường hợp còn lại (giả sử đây là tên file) -> ghép với thư mục tương ứng
  const folder = typeToFolder[type] || typeToFolder.default;
  const result = `${folder}${imageUrl}`;
  console.log("Using filename with folder path:", result);
  return result;
};

/**
 * Xác định có hiển thị ảnh hay không dựa trên URL ảnh
 * Kiểm tra nếu URL ảnh hợp lệ
 *
 * @param {string} imageUrl - URL ảnh cần kiểm tra
 * @returns {boolean} Có hiển thị ảnh hay không
 */
export const shouldDisplayImage = (imageUrl) => {
  const result =
    !!imageUrl &&
    imageUrl !== "" &&
    imageUrl !== "undefined" &&
    !imageUrl.includes("undefined");

  console.log("shouldDisplayImage:", { imageUrl, result });
  return result;
};
