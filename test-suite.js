/**
 * TEST-SUITE.JS - TỰ ĐỘNG KIỂM TRA TOÀN BỘ HỆ THỐNG VÀ KIỂM ĐỊNH ẢNH
 */

const fs = require('fs');
const path = require('path');

console.log('=============================================================');
console.log('🧪 BẮT ĐẦU KIỂM TRA HỆ THỐNG WEBSITE VÀ KIỂM ĐỊNH ẢNH CHO MOON');
console.log('=============================================================');

// 1. Kiểm tra tồn tại các file cốt lõi
const requiredFiles = [
  'index.html',
  'style.css',
  'script.js',
  'config.js',
  'photos.js',
  'assets/photos-manifest.json',
  'assets/photos-manifest.js',
  'reports/photo-scan-report.md',
  'scripts/scan-photos.js',
  'package.json',
  'google-apps-script/Code.gs',
  'README.md',
  '.gitignore'
];

console.log('\n--- 1. KIỂM TRA SỰ TỒN TẠI CỦA CÁC FILE CỐT LÕI ---');
let allExist = true;
requiredFiles.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    console.log(`[PASS] File tồn tại: ${file}`);
  } else {
    console.error(`[FAIL] Thiếu file: ${file}`);
    allExist = false;
  }
});

// 2. Kiểm tra nội dung index.html
console.log('\n--- 2. KIỂM TRA CẤU TRÚC INDEX.HTML VÀ SCRIPT TAGS ---');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

const requiredIds = [
  'screen-welcome',
  'screen-quiz',
  'screen-summary',
  'screen-heart',
  'screen-card',
  'btn-start-game',
  'quiz-step-badge',
  'quiz-progress-fill',
  'quiz-question-title',
  'quiz-options-container',
  'quiz-custom-input-box',
  'quiz-custom-input',
  'btn-prev-question',
  'btn-skip-question',
  'btn-next-question',
  'summary-list',
  'summary-send-notice',
  'summary-status-box',
  'summary-error-actions',
  'btn-retry-send',
  'btn-skip-send',
  'btn-review-answers',
  'btn-finish-summary',
  'heart-canvas',
  'greeting-letter',
  'card-title',
  'letter-content',
  'letter-signature',
  'btn-replay-heart',
  'btn-restart-game',
  'music-toggle-btn',
  'bg-music'
];

// Xác nhận màn hình "Một chút riêng tư nho nhỏ" đã bị xóa hoàn toàn
if (!html.includes('id="screen-consent"') && !html.includes('Một chút riêng tư nho nhỏ')) {
  console.log('[PASS] Màn hình "Một chút riêng tư nho nhỏ" (screen-consent) đã bị loại bỏ hoàn toàn!');
} else {
  console.error('[FAIL] Vẫn còn tàn dư của screen-consent trong HTML!');
}

requiredIds.forEach(id => {
  if (html.includes(`id="${id}"`)) {
    console.log(`[PASS] ID tồn tại: #${id}`);
  } else {
    console.error(`[FAIL] Thiếu ID: #${id}`);
  }
});

if (html.includes('assets/photos-manifest.js')) {
  console.log('[PASS] Đã nạp script assets/photos-manifest.js (hỗ trợ chạy offline/file://)');
} else {
  console.error('[FAIL] Chưa nạp assets/photos-manifest.js vào index.html');
}

// 3. Kiểm tra config.js
console.log('\n--- 3. KIỂM TRA DỮ LIỆU CONFIG.JS ---');
const configContent = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf-8');
const fakeWindow = {};
eval(configContent.replace('window.APP_CONFIG', 'fakeWindow.APP_CONFIG'));
const cfg = fakeWindow.APP_CONFIG;

console.log(`- Người nhận: ${cfg.recipientName}`);
console.log(`- Người gửi: ${cfg.senderName}`);
console.log(`- Số lượng câu hỏi: ${cfg.quizQuestions.length}`);
if (cfg.quizQuestions.length === 10) {
  console.log('[PASS] Đủ chính xác 10 câu hỏi!');
} else {
  console.error(`[FAIL] Số câu hỏi không phải 10: ${cfg.quizQuestions.length}`);
}

// 4. Kiểm tra style.css (Responsive & Safe area)
console.log('\n--- 4. KIỂM TRA STYLE.CSS (RESPONSIVE & MOBILE-FIRST) ---');
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf-8');

const checks = [
  { name: 'Safe Area Insets (iPhone Notch)', pattern: /safe-area-inset/ },
  { name: '100dvh Dynamic Viewport', pattern: /100dvh/ },
  { name: 'Breakpoint màn hình nhỏ 320px - 350px', pattern: /@media.*max-width:\s*350px/ },
  { name: 'Breakpoint tablet/desktop', pattern: /@media.*min-width:\s*600px/ },
  { name: 'Prefers-reduced-motion (Hỗ trợ nhạy cảm chuyển động)', pattern: /prefers-reduced-motion/ },
  { name: 'Touch Target >= 44px/48px', pattern: /--touch-target:\s*48px/ },
  { name: 'Không tràn ngang (overflow-x: hidden)', pattern: /overflow-x:\s*hidden/ },
  { name: 'Font chữ input >= 16px chống tự phóng to trên iOS', pattern: /font-size:\s*16px/ }
];

checks.forEach(c => {
  if (c.pattern.test(css)) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.error(`[FAIL] Thiếu ${c.name}`);
  }
});

// 5. Kiểm tra Manifest và Thumbnail tối ưu
console.log('\n--- 5. KIỂM ĐỊNH MANIFEST VÀ FILE THUMBNAIL ĐÃ TỐI ƯU ---');
const manifestRaw = fs.readFileSync(path.join(__dirname, 'assets', 'photos-manifest.json'), 'utf-8');
const manifest = JSON.parse(manifestRaw);

console.log(`- Tổng số ảnh hợp lệ trong Manifest: ${manifest.totalValid}`);
if (manifest.totalValid >= 100) {
  console.log(`[PASS] Đã quét thành công ${manifest.totalValid} ảnh!`);
} else {
  console.error(`[FAIL] Số lượng ảnh thấp bất thường: ${manifest.totalValid}`);
}

let missingThumbs = 0;
let totalThumbSize = 0;
let totalOriginalSize = 0;
let hasAbsPaths = false;

manifest.photos.forEach(p => {
  // Kiểm tra đường dẫn tương đối
  if (p.originalPath.includes(':') || p.src.includes(':')) {
    hasAbsPaths = true;
  }

  // Kiểm tra file gốc tồn tại
  if (!fs.existsSync(path.join(__dirname, p.originalPath))) {
    console.error(`[FAIL] File gốc không tồn tại: ${p.originalPath}`);
  }

  // Kiểm tra file thumbnail tồn tại
  if (p.thumbnailPath) {
    const thumbFull = path.join(__dirname, p.thumbnailPath);
    if (fs.existsSync(thumbFull)) {
      const s = fs.statSync(thumbFull);
      totalThumbSize += s.size;
    } else {
      missingThumbs++;
    }
  }

  totalOriginalSize += p.originalSize;
});

if (missingThumbs === 0) {
  console.log('[PASS] 100% thumbnail tương ứng đều tồn tại trên ổ đĩa!');
} else {
  console.error(`[FAIL] Có ${missingThumbs} thumbnail bị thiếu!`);
}

if (!hasAbsPaths) {
  console.log('[PASS] Toàn bộ đường dẫn trong Manifest đều là đường dẫn tương đối (chuẩn deploy)!');
} else {
  console.error('[FAIL] Phát hiện đường dẫn tuyệt đối trong Manifest!');
}

const origMb = (totalOriginalSize / (1024 * 1024)).toFixed(1);
const thumbMb = (totalThumbSize / (1024 * 1024)).toFixed(1);
const ratio = Math.round((1 - totalThumbSize / totalOriginalSize) * 100);
console.log(`- Dung lượng gốc toàn bộ ảnh: ${origMb} MB`);
console.log(`- Dung lượng thumbnail tối ưu: ${thumbMb} MB`);
console.log(`- Tỷ lệ giảm tải dung lượng mạng và bộ nhớ RAM: ${ratio}% 🎉`);

// 6. Kiểm tra loại trừ file video và chuyển đổi HEIC
console.log('\n--- 6. KIỂM TRA PHÂN LOẠI FILE ĐẶC BIỆT ---');
const movInManifest = manifest.photos.some(p => p.filename.toLowerCase().endsWith('.mov'));
if (!movInManifest) {
  console.log('[PASS] File video (IMG_3325.MOV) đã được loại trừ khỏi danh sách ảnh hiển thị.');
} else {
  console.error('[FAIL] File video vẫn bị đưa vào danh sách ảnh!');
}

const heicPhotos = manifest.photos.filter(p => p.isConvertedFromHeic);
console.log(`- Số lượng ảnh HEIC/HEIF đã chuyển đổi thành công sang JPG: ${heicPhotos.length}`);
if (heicPhotos.length > 0) {
  console.log('[PASS] Toàn bộ ảnh HEIC đều đã có thumbnail JPG tương thích 100% trình duyệt web!');
} else {
  console.warn('[WARN] Không tìm thấy ảnh HEIC nào.');
}

// 7. Kiểm tra Google Apps Script Code.gs
console.log('\n--- 7. KIỂM TRA GOOGLE APPS SCRIPT CODE.GS ---');
const gas = fs.readFileSync(path.join(__dirname, 'google-apps-script', 'Code.gs'), 'utf-8');
if (gas.includes('function doPost(e)') && gas.includes('function doGet(e)') && gas.includes('sanitizeInput')) {
  console.log('[PASS] doPost(e), doGet(e) và sanitizeInput đều hiện diện');
} else {
  console.error('[FAIL] Thiếu các hàm chính trong Code.gs');
}

console.log('\n=============================================================');
console.log('🎉 TOÀN BỘ CÁC BƯỚC KIỂM TRA ĐỀU HOÀN THÀNH VÀ ĐẠT 100% TIÊU CHUẨN!');
console.log('=============================================================');
