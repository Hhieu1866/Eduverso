"use client";

const ErrorComponent = () => {
  return (
    <section className="container py-20 text-center">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">
        Đã xảy ra lỗi
      </h2>
      <p className="mb-8 text-gray-600">
        Không thể tải danh sách khóa học. Vui lòng thử lại sau.
      </p>
      <div className="flex justify-center">
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          Tải lại trang
        </button>
      </div>
    </section>
  );
};

export default ErrorComponent;
