import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { getReport } from "@/queries/reports";
import { formatMyDate } from "@/lib/date";
import fs from "fs";
import path from "path";

export async function GET(request) {
  try {
    /* -----------------
     *
     * Configuratios
     *
     *-------------------*/
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const course = await getCourseDetails(courseId);
    const loggedInUser = await getLoggedInUser();

    const report = await getReport({
      course: courseId,
      student: loggedInUser.id,
    });

    const completionDate = report?.completion_date
      ? formatMyDate(report?.completion_date)
      : formatMyDate(Date.now());

    // Tạo ID chứng chỉ
    const certificateId = Math.floor(
      10000000 + Math.random() * 90000000,
    ).toString();

    // Chuẩn hóa tên học viên: viết hoa chữ cái đầu mỗi từ
    const studentFirstName = loggedInUser?.firstName || "";
    const studentLastName = loggedInUser?.lastName || "";

    const capitalizeWord = (word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };

    const capitalizedFirstName = studentFirstName
      .split(" ")
      .map(capitalizeWord)
      .join(" ");
    const capitalizedLastName = studentLastName
      .split(" ")
      .map(capitalizeWord)
      .join(" ");

    const studentName = `${capitalizedFirstName} ${capitalizedLastName}`.trim();

    const completionInfo = {
      name: studentName,
      completionDate: completionDate,
      courseName: course.title,
      instructor: `${course?.instructor?.firstName} ${course?.instructor?.lastName}`,
      instructorDesignation: `${course?.instructor?.designation || "Course Instructor"}`,
      sign: "/sign.webp",
      certificateId: certificateId,
    };

    const pdfDoc = await PDFDocument.create();

    // Sử dụng các font tiêu chuẩn
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(
      StandardFonts.TimesRomanBold,
    );
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold,
    );

    // Tạo trang ngang (landscape)
    const page = pdfDoc.addPage([842, 595]); // A4 ngang
    const { width, height } = page.getSize();

    /* -----------------
     *
     * Nền sóng và viền
     *
     *-------------------*/
    try {
      // Vẽ nền sóng màu xám nhạt
      const backgroundUrl = new URL(
        "/pattern.jpg",
        "http://localhost:3000",
      ).toString();
      const backgroundBytes = await fetch(backgroundUrl).then((res) =>
        res.arrayBuffer(),
      );
      const backgroundImage = await pdfDoc.embedJpg(backgroundBytes);

      // Vẽ nền trắng cho chứng chỉ với viền
      page.drawImage(backgroundImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // Vẽ viền chứng chỉ
      page.drawRectangle({
        x: 50,
        y: 50,
        width: width - 100,
        height: height - 100,
        borderColor: rgb(0.1, 0.4, 0.7),
        borderWidth: 2,
        color: rgb(1, 1, 1),
        opacity: 0.9,
      });

      // Gỡ bỏ hai ô màu xanh ở góc dưới
    } catch (error) {
      console.error("Could not load background:", error);
    }

    /* -----------------
     *
     * Logo Eduverse
     *
     *-------------------*/
    try {
      // Thử tải logo từ public folder
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      // console.log("Logo path:", logoPath);

      let logo;
      let logoBytes;

      // Ưu tiên đọc từ file system trước
      if (fs.existsSync(logoPath)) {
        // console.log("Đang tải logo từ file system...");
        logoBytes = fs.readFileSync(logoPath);
        logo = await pdfDoc.embedPng(logoBytes);
      } else {
        // Nếu không có file, thử tải từ URL
        // console.log("Đang tải logo từ URL...");
        const logoUrl = new URL(
          "/logo.png",
          "http://localhost:3000",
        ).toString();
        const logoResponse = await fetch(logoUrl);

        if (!logoResponse.ok) {
          throw new Error(`Failed to fetch logo: ${logoResponse.status}`);
        }

        logoBytes = await logoResponse.arrayBuffer();
        logo = await pdfDoc.embedPng(logoBytes);
      }

      // Hiển thị logo với kích thước phù hợp và ở giữa trang
      const logoWidth = 70;
      const logoHeight = 70;

      page.drawImage(logo, {
        x: width / 2 - 90, // Căn giữa
        y: height - 140, // Đặt cao hơn
        width: logoWidth,
        height: logoHeight,
      });

      // Thêm tên Eduverse bên cạnh logo
      page.drawText("Eduverse", {
        x: width / 2 - 10,
        y: height - 105,
        size: 28,
        font: helveticaBoldFont,
        color: rgb(0.08, 0.49, 0.5), // Màu #147e7f
      });

      // console.log("Đã tải và hiển thị logo thành công");
    } catch (error) {
      console.error("Lỗi khi tải logo:", error);
      // Nếu không tải được logo, hiển thị chỉ tên Eduverse
      page.drawText("Eduverse", {
        x: width / 2 - 70,
        y: height - 120,
        size: 32,
        font: helveticaBoldFont,
        color: rgb(0.08, 0.49, 0.5), // Màu #147e7f
      });
    }

    /* -----------------
     *
     * Title - Tiêu đề chính
     *
     *-------------------*/
    const titleFontSize = 60; // Kích thước font chữ lớn
    const titleText = "CERTIFICATE";
    const titleTextWidth = helveticaBoldFont.widthOfTextAtSize(
      titleText,
      titleFontSize,
    );

    page.drawText(titleText, {
      x: width / 2 - titleTextWidth / 2,
      y: height - 210, // Điều chỉnh vị trí xuống thấp hơn để cân đối với logo
      size: titleFontSize,
      font: helveticaBoldFont,
      color: rgb(0.05, 0.3, 0.6),
    });

    // Thêm "OF COMPLETION" và gạch ngang
    const subTitleFontSize = 18;
    const subTitleText = "OF COMPLETION";
    const subTitleTextWidth = helveticaFont.widthOfTextAtSize(
      subTitleText,
      subTitleFontSize,
    );

    // Tăng khoảng cách giữa tiêu đề chính và phụ
    const subTitleY = height - 240;

    // Vẽ gạch ngang trước
    page.drawLine({
      start: { x: width / 2 - 180, y: subTitleY - 5 },
      end: { x: width / 2 - 30, y: subTitleY - 5 },
      thickness: 1,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Vẽ text
    page.drawText(subTitleText, {
      x: width / 2 - subTitleTextWidth / 2,
      y: subTitleY, // Điều chỉnh vị trí để tạo khoảng cách với thanh ngang
      size: subTitleFontSize,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Vẽ gạch ngang sau
    page.drawLine({
      start: { x: width / 2 + 30, y: subTitleY - 5 },
      end: { x: width / 2 + 180, y: subTitleY - 5 },
      thickness: 1,
      color: rgb(0.4, 0.4, 0.4),
    });

    /* -----------------
     *
     * Presentation Text
     *
     *-------------------*/
    const presentTextFontSize = 14;
    const presentText = "WE PROUDLY PRESENT THIS CERTIFICATE TO";
    const presentTextWidth = helveticaFont.widthOfTextAtSize(
      presentText,
      presentTextFontSize,
    );

    page.drawText(presentText, {
      x: width / 2 - presentTextWidth / 2,
      y: height - 290, // Điều chỉnh vị trí
      size: presentTextFontSize,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    /* -----------------
     *
     * Name
     *
     *-------------------*/
    const nameText = completionInfo.name;
    const nameFontSize = 36;
    const nameTextWidth = timesRomanBoldFont.widthOfTextAtSize(
      nameText,
      nameFontSize,
    );

    page.drawText(nameText, {
      x: width / 2 - nameTextWidth / 2,
      y: height - 340, // Điều chỉnh vị trí
      size: nameFontSize,
      font: timesRomanBoldFont,
      color: rgb(0.05, 0.3, 0.6),
    });

    /* -----------------
     *
     * Course Details
     *
     *-------------------*/
    const detailsText = `for completing the course ${completionInfo.courseName}`;
    const detailsFontSize = 16;
    const detailsTextWidth = helveticaFont.widthOfTextAtSize(
      detailsText,
      detailsFontSize,
    );

    page.drawText(detailsText, {
      x: width / 2 - detailsTextWidth / 2,
      y: height - 380, // Điều chỉnh vị trí
      size: detailsFontSize,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    /* -----------------
     *
     * Signatures & Bottom Info
     *
     *-------------------*/
    // Chữ ký
    try {
      // Ưu tiên đọc chữ ký từ file system trước
      const signaturePath = path.join(process.cwd(), "public", "sign.webp");
      let signature;
      let signatureBytes;

      if (fs.existsSync(signaturePath)) {
        // console.log("Đang tải chữ ký từ file system...");
        signatureBytes = fs.readFileSync(signaturePath);
        signature = await pdfDoc.embedPng(signatureBytes);
      } else {
        // console.log("Đang tải chữ ký từ URL...");
        const signatureUrl = new URL(
          "/sign.webp",
          "http://localhost:3000",
        ).toString();
        const signatureResponse = await fetch(signatureUrl);

        if (!signatureResponse.ok) {
          throw new Error(
            `Failed to fetch signature: ${signatureResponse.status}`,
          );
        }

        signatureBytes = await signatureResponse.arrayBuffer();
        signature = await pdfDoc.embedPng(signatureBytes);
      }

      const signDimns = signature.scale(0.25); // Tăng kích thước chữ ký

      page.drawImage(signature, {
        x: 230,
        y: 120,
        width: signDimns.width,
        height: signDimns.height,
      });

      // console.log("Đã tải và hiển thị chữ ký thành công");
    } catch (error) {
      console.error("Không thể tải chữ ký:", error);
    }

    // Tên người ký và chức danh
    page.drawText(completionInfo.instructor.toUpperCase(), {
      x: 220,
      y: 100,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawLine({
      start: { x: 220, y: 95 },
      end: { x: 380, y: 95 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    page.drawText("COURSE INSTRUCTOR", {
      x: 220,
      y: 80,
      size: 12,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Ngày cấp và ID chứng chỉ
    page.drawText(`ISSUING DATE - ${completionInfo.completionDate}`, {
      x: width - 350,
      y: 100,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`CERTIFICATE ID - ${completionInfo.certificateId}`, {
      x: width - 350,
      y: 80,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });

    /* -----------------
     *
     * Generate and send Response
     *
     *-------------------*/
    const pdfBytes = await pdfDoc.save();
    return new Response(pdfBytes, {
      headers: { "content-type": "application/pdf" },
    });
  } catch (error) {
    console.log(error);
    // Trả về lỗi
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
