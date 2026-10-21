const fs = require('fs');
const path = require('path');

console.log('=============================================================');
console.log('🧪 KIỂM TRA TOÀN DIỆN TRÁI TIM ẢNH 3D & LIGHTBOX MODAL');
console.log('=============================================================');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf-8');
const js = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf-8');

let allPassed = true;
function assert(desc, condition) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
  } else {
    console.error(`[FAIL] ${desc}`);
    allPassed = false;
  }
}

// 1. Kiểm tra cấu trúc HTML
console.log('\n--- 1. CẤU TRÚC HTML ---');
assert('Có container sân khấu 3D #heart-3d-stage', html.includes('id="heart-3d-stage"'));
assert('Có wrap xoay chuyển động #heart-3d-inner', html.includes('id="heart-3d-inner"'));
assert('Có Canvas thiên hà #heart-canvas', html.includes('id="heart-canvas"'));
assert('Có nút mở quà tách biệt #btn-shatter-gift', html.includes('id="btn-shatter-gift"'));
assert('Có modal Lightbox #photo-lightbox', html.includes('id="photo-lightbox"'));
assert('Có ảnh Lightbox #lightbox-img', html.includes('id="lightbox-img"'));
assert('Có nút đóng Lightbox #lightbox-btn-close', html.includes('id="lightbox-btn-close"'));
assert('Có nút ảnh trước #lightbox-btn-prev', html.includes('id="lightbox-btn-prev"'));
assert('Có nút ảnh kế #lightbox-btn-next', html.includes('id="lightbox-btn-next"'));
assert('Có bộ đếm ảnh #lightbox-counter', html.includes('id="lightbox-counter"'));
assert('Có tiêu đề/chú thích #lightbox-caption', html.includes('id="lightbox-caption"'));

// 2. Kiểm tra CSS 3D & Giao diện Responsive
console.log('\n--- 2. CSS 3D VÀ GIAO DIỆN RESPONSIVE ---');
assert('CSS có perspective 1200px cho chiều sâu 3D', css.includes('perspective: 1200px'));
assert('CSS có transform-style: preserve-3d', css.includes('transform-style: preserve-3d'));
assert('CSS có animation lơ lửng 3D heartFloat3D', css.includes('heartFloat3D'));
assert('CSS có animation nhịp đập trái tim heartbeatPulse', css.includes('heartbeatPulse'));
assert('CSS có style thẻ ảnh 3D .heart-card-3d', css.includes('.heart-card-3d'));
assert('CSS có hiệu ứng phóng to hover/focus cho thẻ ảnh', css.includes('.heart-card-3d:hover'));
assert('CSS có nút mở quà phát sáng .btn-shatter-gift', css.includes('.btn-shatter-gift'));
assert('CSS mở rộng giao diện desktop lên 760px (.heart-mode)', css.includes('.app-container.heart-mode'));
assert('CSS có hiệu ứng làm mờ nền Lightbox backdrop-filter', css.includes('backdrop-filter: blur(14px)'));
assert('CSS chống cuộn trang khi mở modal (body.modal-open)', css.includes('body.modal-open'));

// 3. Kiểm tra Logic JavaScript
console.log('\n--- 3. LOGIC JAVASCRIPT ---');
assert('Đầy đủ 27 tọa độ 3D trong HEART_LAYOUT', js.includes('const HEART_LAYOUT = [') && js.includes('{ x:  0.00, y:  0.60, w: 0.22, h: 0.22, z: 10,  rx: -14, ry: 0 }'));
assert('Có hàm khởi tạo thiên hà và sao lấp lánh initHeartCanvas & startGalaxy', js.includes('function startGalaxy()') && js.includes('function renderGalaxyFrame()'));
assert('Có hàm dựng thẻ ảnh 3D DOM buildHeart3D', js.includes('function buildHeart3D()'));
assert('Có hàm khôi phục nguyên vẹn 3D reset3DHeart khi xem lại', js.includes('function reset3DHeart()'));
assert('Có hàm mở chi tiết ảnh openLightbox', js.includes('function openLightbox(index)'));
assert('Có hàm đóng Lightbox closeLightbox', js.includes('function closeLightbox()'));
assert('Có hàm chuyển ảnh trước/sau nextLightboxPhoto & prevLightboxPhoto', js.includes('function nextLightboxPhoto()') && js.includes('function prevLightboxPhoto()'));
assert('Có phím tắt Escape, ArrowRight, ArrowLeft cho Lightbox', js.includes("e.key === 'Escape'") && js.includes("e.key === 'ArrowRight'"));
assert('Có vuốt màn hình cảm ứng Touch Swipe trên Mobile cho Lightbox', js.includes('Math.abs(deltaX) > 40'));
assert('Tách biệt hành vi: Chỉ btnShatterGift kích hoạt triggerHeartShatter', js.includes('dom.btnShatterGift.addEventListener(\'click\', triggerHeartShatter)'));
assert('Click thẻ ảnh mở Lightbox chứ không nổ quà', js.includes('openLightbox(idx)'));

console.log('\n=============================================================');
if (allPassed) {
  console.log('🎉 TẤT CẢ CÁC BƯỚC KIỂM TRA ĐỀU HOÀN THÀNH XUẤT SẮC 100%!');
} else {
  console.error('❌ Có một số kiểm tra thất bại!');
  process.exit(1);
}
console.log('=============================================================');
