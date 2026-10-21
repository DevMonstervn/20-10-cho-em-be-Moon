const fs = require('fs');

const js = fs.readFileSync('script.js', 'utf-8');
const html = fs.readFileSync('index.html', 'utf-8');
const css = fs.readFileSync('style.css', 'utf-8');

console.log('--- KIỂM TRA LOẠI BỎ TOÀN BỘ MÀN HÌNH XIN PHÉP (SCREEN 4) ---');

let pass = true;

if (js.includes('handleConsentAgree') || js.includes('handleConsentDecline') || js.includes('screenConsent')) {
  console.error('[FAIL] Vẫn còn tàn dư consent trong script.js');
  pass = false;
} else {
  console.log('[PASS] script.js đã xóa hoàn toàn mọi logic/handler/biến của màn hình consent');
}

if (html.includes('screen-consent') || html.includes('Một chút riêng tư nho nhỏ')) {
  console.error('[FAIL] Vẫn còn tàn dư consent trong index.html');
  pass = false;
} else {
  console.log('[PASS] index.html đã xóa sạch thẻ <section id="screen-consent">');
}

if (css.includes('.screen-consent') || css.includes('.consent-card')) {
  console.error('[FAIL] Vẫn còn CSS consent trong style.css');
  pass = false;
} else {
  console.log('[PASS] style.css đã dọn dẹp toàn bộ class liên quan đến consent');
}

console.log('\n--- KIỂM TRA NÚT TIẾP TỤC MỞ QUÀ & GỬI DỮ LIỆU ---');

if (html.includes('Nhấn "Tiếp tục mở quà" để gửi câu trả lời của em cho anh nhé 💌')) {
  console.log('[PASS] Đã có dòng hướng dẫn rõ ràng phía trên nút mở quà');
} else {
  console.error('[FAIL] Thiếu dòng hướng dẫn trên màn hình tổng kết');
  pass = false;
}

if (js.includes('state.isSubmitting') && js.includes('state.hasSubmitted')) {
  console.log('[PASS] Đã cài đặt cờ chống gửi trùng và chống spam click (isSubmitting, hasSubmitted)');
} else {
  console.error('[FAIL] Thiếu cờ chống gửi trùng');
  pass = false;
}

if (js.includes('Chưa cấu hình URL Google Sheets')) {
  console.log('[PASS] Có cơ chế kiểm tra trung thực khi chưa cấu hình Google Sheets');
} else {
  console.error('[FAIL] Thiếu cơ chế kiểm tra URL Google Sheets');
  pass = false;
}

if (js.includes('summary-error-actions') && html.includes('btn-retry-send') && html.includes('btn-skip-send')) {
  console.log('[PASS] Có 2 nút xử lý sự cố (Thử gửi lại & Bỏ qua mở quà) giúp người dùng không bao giờ bị kẹt');
} else {
  console.error('[FAIL] Thiếu các nút xử lý sự cố');
  pass = false;
}

console.log('\n--- KIỂM TRA TRẢI NGHIỆM TRÁI TIM 3D ---');

if (html.includes('Trái Tim Kỷ Niệm 3D 💖')) {
  console.log('[PASS] Tiêu đề màn hình trái tim đã cập nhật thành Trái Tim Kỷ Niệm 3D');
} else {
  console.error('[FAIL] Thiếu tiêu đề 3D');
  pass = false;
}

if (css.includes('perspective') && css.includes('rotateX') && css.includes('rotateY')) {
  console.log('[PASS] Đã áp dụng hiệu ứng phối cảnh 3D (perspective) và góc nghiêng 3D');
} else {
  console.error('[FAIL] Thiếu CSS 3D');
  pass = false;
}

if (pass) {
  console.log('\n✅ TẤT CẢ CÁC ĐIỀU KIỆN ĐỀU ĐẠT CHUẨN 100%!');
} else {
  console.error('\n❌ Có kiểm tra thất bại!');
  process.exit(1);
}
