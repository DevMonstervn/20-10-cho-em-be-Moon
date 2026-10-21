/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - LƯU CÂU TRẢ LỜI 20/10 CỦA MOON VÀO GOOGLE SHEETS
 * ============================================================================
 * 
 * HƯỚNG DẪN THIẾT LẬP TỪNG BƯỚC (RẤT ĐƠN GIẢN):
 * 
 * BƯỚC 1: TẠO GOOGLE SHEET
 * 1. Truy cập https://sheets.new để tạo một trang tính mới.
 * 2. Đặt tên Google Sheet (ví dụ: "Câu trả lời 20-10 của Moon").
 * 3. Ở Dòng 1, tạo các tiêu đề cột sau:
 *    - Cột A: Thời gian gửi
 *    - Cột B: Mã phiên (Session ID)
 *    - Cột C: Người nhận
 *    - Cột D: Câu 1 (Nơi thư giãn)
 *    - Cột E: Câu 2 (Loài hoa)
 *    - Cột F: Câu 3 (Đồ uống)
 *    - Cột G: Câu 4 (Khi mệt mỏi)
 *    - Cột H: Câu 5 (Kiểu quà tặng)
 *    - Cột I: Câu 6 (Phong cách)
 *    - Cột J: Câu 7 (Ngày lý tưởng)
 *    - Cột K: Câu 8 (Điều khiến vui)
 *    - Cột L: Câu 9 (Ngày rảnh rỗi)
 *    - Cột M: Câu 10 (Lời nhắn gửi)
 * 
 * BƯỚC 2: MỞ APPS SCRIPT
 * 1. Trên thanh menu của Google Sheet, chọn: Tiện ích mở rộng (Extensions) > Apps Script.
 * 2. Xóa hết code mặc định trong file `Code.gs`.
 * 3. Sao chép và dán toàn bộ nội dung trong file này vào `Code.gs`.
 * 4. Nhấn biểu tượng Đĩa mềm (Ctrl + S) để lưu dự án.
 * 
 * BƯỚC 3: TRIỂN KHAI WEB APP (DEPLOY)
 * 1. Nhấn nút "Triển khai" (Deploy) màu xanh ở góc trên bên phải > Chọn "Lượt triển khai mới" (New deployment).
 * 2. Chọn loại: "Ứng dụng web" (Web app).
 * 3. Cấu hình chính xác như sau:
 *    - Mô tả: "20-10 Moon Responses"
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 *      (Lưu ý: Bắt buộc chọn "Bất kỳ ai" để trình duyệt của Moon có thể gửi câu trả lời mà không cần đăng nhập tài khoản Google).
 * 4. Nhấn nút "Triển khai" (Deploy).
 * 5. Google có thể yêu cầu bạn cấp quyền truy cập: Nhấn "Ủy quyền truy cập" (Authorize access) > Chọn tài khoản Google của bạn > Chọn "Nâng cao" (Advanced) > Nhấn "Đi tới [Tên dự án] (không an toàn)" > Nhấn "Cho phép" (Allow).
 * 6. Sao chép đường dẫn "URL ứng dụng web" (Web App URL) có dạng:
 *    https://script.google.com/macros/s/AKfycb.../exec
 * 
 * BƯỚC 4: DÁN URL VÀO CONFIG.JS CỦA WEBSITE
 * 1. Mở file `config.js` trong thư mục website của bạn.
 * 2. Tìm đến mục `googleSheets: { webAppUrl: "..." }`.
 * 3. Dán URL bạn vừa sao chép vào giữa hai dấu ngoặc kép.
 * 4. Lưu file `config.js` lại là xong!
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Khóa trong 10 giây để tránh xung đột ghi dữ liệu đồng thời
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Nếu sheet chưa có tiêu đề cột ở dòng 1 thì tự động tạo
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian gửi",
        "Mã phiên",
        "Người nhận",
        "Câu 1 (Nơi thư giãn)",
        "Câu 2 (Loài hoa)",
        "Câu 3 (Đồ uống)",
        "Câu 4 (Khi mệt mỏi)",
        "Câu 5 (Kiểu quà tặng)",
        "Câu 6 (Phong cách)",
        "Câu 7 (Ngày lý tưởng)",
        "Câu 8 (Điều khiến vui)",
        "Câu 9 (Ngày rảnh rỗi)",
        "Câu 10 (Lời nhắn gửi)"
      ]);
      // Định dạng dòng tiêu đề in đậm, nền hồng nhạt
      var headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#ffe5ec");
      headerRange.setFontColor("#591a35");
    }

    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    // Thời gian hiện tại theo múi giờ Việt Nam
    var formattedDate = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    var sessionId = sanitizeInput(data.sessionId || "");
    var recipient = sanitizeInput(data.recipient || "Moon");
    var answers = data.answers || {};

    // Ghi dữ liệu vào dòng mới
    sheet.appendRow([
      formattedDate,
      sessionId,
      recipient,
      sanitizeInput(answers.cau_1 || ""),
      sanitizeInput(answers.cau_2 || ""),
      sanitizeInput(answers.cau_3 || ""),
      sanitizeInput(answers.cau_4 || ""),
      sanitizeInput(answers.cau_5 || ""),
      sanitizeInput(answers.cau_6 || ""),
      sanitizeInput(answers.cau_7 || ""),
      sanitizeInput(answers.cau_8 || ""),
      sanitizeInput(answers.cau_9 || ""),
      sanitizeInput(answers.cau_10 || "")
    ]);

    // Trả về JSON thành công
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã lưu câu trả lời thành công!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // Trả về thông báo trạng thái khi kiểm tra URL Web App bằng trình duyệt
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Google Apps Script 20/10 cho Moon đang hoạt động bình thường! 🌸"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Hàm lọc sạch dữ liệu đầu vào cơ bản để đảm bảo an toàn cho bảng tính
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return String(str || '');
  // Cắt ngắn tối đa 1000 ký tự để tránh dữ liệu quá tải
  var clean = str.substring(0, 1000);
  // Ngăn chặn Formula Injection trong Sheets nếu ký tự đầu là '=', '+', '-', '@'
  if (clean.charAt(0) === '=' || clean.charAt(0) === '+' || clean.charAt(0) === '-' || clean.charAt(0) === '@') {
    clean = "'" + clean;
  }
  return clean;
}
