/**
 * Các tiện ích để chuyển đổi dữ liệu Mongoose sang định dạng thân thiện với client
 */

/**
 * Chuyển đổi mảng document MongoDB thành mảng plain objects với id chuẩn hóa
 * @param {Array} array - Mảng document MongoDB cần chuyển đổi
 * @returns {Array} Mảng plain objects đã chuyển đổi
 */
export const replaceMongoIdInArray = (array) => {
  if (!Array.isArray(array) || array.length === 0) return [];

  return array.map((item) => {
    if (!item || !item._id) return item;

    // Tạo bản sao không tham chiếu và thêm id
    const { _id, ...rest } = item;
    return {
      ...rest,
      id: typeof _id === "object" ? _id.toString() : _id,
    };
  });
};

/**
 * Chuyển đổi document MongoDB thành plain object với id chuẩn hóa
 * @param {Object} obj - Document MongoDB cần chuyển đổi
 * @returns {Object|null} Plain object đã chuyển đổi hoặc null nếu input không hợp lệ
 */
export const replaceMongoIdInObject = (obj) => {
  if (!obj || !obj._id) return obj;

  const { _id, ...rest } = obj;
  return {
    ...rest,
    id: typeof _id === "object" ? _id.toString() : _id,
  };
};

/**
 * Tạo slug từ chuỗi tiêu đề
 * @param {string} title - Chuỗi tiêu đề cần chuyển thành slug
 * @returns {string|null} Slug đã tạo hoặc null nếu input không hợp lệ
 */
export const getSlug = (title) => {
  if (!title || typeof title !== "string") return null;

  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, "") // Loại bỏ các ký tự không phải từ hoặc dấu gạch ngang
    .replace(/\-\-+/g, "-") // Thay thế nhiều dấu gạch ngang liên tiếp bằng một dấu
    .replace(/^-+/, "") // Cắt dấu gạch ngang ở đầu
    .replace(/-+$/, ""); // Cắt dấu gạch ngang ở cuối
};
