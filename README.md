# 🌸 Món Quà Tương Tác 20/10 Dành Riêng Cho Moon 🌙

Một website quà tặng tương tác lãng mạn, tinh tế và ấm áp nhân ngày Phụ nữ Việt Nam 20/10, được thiết kế theo triết lý **Mobile-First** (tối ưu hoàn hảo cho iPhone và Android).

---

## ✨ Điểm Nổi Bật Của Website

1. **Trải nghiệm kể chuyện tương tác**: Bắt đầu bằng lời chào riêng biệt gửi Moon, dẫn dắt qua 10 câu hỏi trắc nghiệm nhẹ nhàng để thấu hiểu sở thích và tính cách của cô ấy.
2. **Tôn trọng quyền riêng tư**: Có màn hình xin phép rõ ràng trước khi lưu câu trả lời. Nếu Moon từ chối, website vẫn tiếp tục mở quà bình thường mà không hề gây áp lực.
3. **Trái tim ghép ảnh nghệ thuật (Canvas Mosaic)**: Nhiều bức ảnh kỷ niệm được xếp vừa vặn thành một hình trái tim lung linh. Khi Moon chạm vào, trái tim vỡ tan thành những mảnh ảnh nhỏ và cánh hoa bay trước khi mở ra thiệp chúc mừng.
4. **Cơ chế dự phòng thông minh (Zero-Break Fallback)**: Nếu bạn chưa kịp thêm ảnh thật hoặc chưa có file nhạc, website vẫn hiển thị các tấm thẻ pastel nghệ thuật (trăng, hoa, boba, hoàng hôn) tuyệt đẹp, không bao giờ bị lỗi icon ảnh hỏng.
5. **Thiết kế Mobile-First**: Chuẩn giao diện cho màn hình 320px, 360px, 375px, 390px, 430px, tablet và desktop; hỗ trợ vùng an toàn tai thỏ iPhone (`env(safe-area)`).
6. **Không phụ thuộc thư viện nặng**: Sử dụng HTML5, CSS3 và Vanilla JavaScript thuần, nhẹ tênh và tải tức thì trên mọi mạng di động 4G/5G/Wi-Fi.

---

## 📁 Cấu Trúc Thư Mục

```text
20-10-cho-em-be-Moon/
├── index.html               # Giao diện chính của toàn bộ 6 màn hình
├── style.css                # CSS thiết kế màu pastel, chuyển động mượt & responsive
├── script.js               # Logic trò chơi hỏi đáp, Canvas trái tim & hiệu ứng vỡ
├── config.js               # File cấu hình: Lời chúc, tên Moon, tên bạn, câu hỏi, nhạc
├── photos.js               # Danh sách hình ảnh ghép thành hình trái tim
├── assets/
│   ├── photos/             # Nơi bạn đặt các file ảnh kỷ niệm (.jpg, .png)
│   └── music/              # Nơi bạn đặt file nhạc nền (.mp3)
├── google-apps-script/
│   └── Code.gs             # Mã nguồn Google Apps Script để lưu câu trả lời vào Google Sheets
├── README.md               # Hướng dẫn chi tiết
└── .gitignore              # Bỏ qua các file rác hệ thống
```

---

## 🚀 Hướng Dẫn Tùy Chỉnh Nhanh (Dành Cho Bạn)

### 1. Thay đổi tên và Lời chúc 20/10

Mở file `config.js`, bạn sẽ thấy các mục cấu hình rất rõ ràng:

```javascript
window.APP_CONFIG = {
  // Thay đổi tên nếu muốn
  recipientName: "Moon",
  senderName: "Anh",

  // Thay đổi lời chúc ở thiệp cuối cùng
  card: {
    title: "🌷 Chúc Moon ngày 20/10 thật vui vẻ!",
    paragraphs: [
      "Chúc em luôn xinh đẹp, bình an và gặp thật nhiều điều tốt đẹp.",
      "Mong rằng mỗi ngày của em đều có những khoảnh khắc khiến em mỉm cười.",
      "Cảm ơn Moon đã dành chút thời gian chơi trò chơi nhỏ này cùng anh nhé! 💗"
    ],
    signature: "— Anh —"
  }
};
```

---

### 2. Tự Động Quét Ảnh & Tạo Trái Tim Kỷ Niệm

Website được trang bị **Công cụ quét ảnh tự động thông minh** (`scripts/scan-photos.js`), bạn **không cần phải gõ tên từng ảnh vào code**:

1. Khi bạn muốn thêm ảnh mới, chỉ cần thả ảnh vào thư mục `assets/photos/`.
2. Mở terminal và chạy lệnh duy nhất:
   ```bash
   npm run scan:photos
   ```
3. Công cụ sẽ tự động:
   - Quét toàn bộ ảnh trong `assets/photos/` (hỗ trợ JPG, PNG, WebP, và tự động chuyển đổi HEIC từ iPhone sang web).
   - Tự động phát hiện và cảnh báo các file đặc biệt (như file video `.MOV` dung lượng lớn).
   - Tự động tạo bản thumbnail siêu nhẹ (~20KB - 30KB) trong `assets/generated-thumbnails/` để điện thoại của Moon tải mượt mà, không bị nóng máy hay giật lag.
   - Tự động cập nhật `assets/photos-manifest.json` và `assets/photos-manifest.js`.
   - Xuất báo cáo chi tiết tại `reports/photo-scan-report.md`.
4. Khi mở website, hệ thống sẽ tự động bốc ngẫu nhiên 26 bức ảnh độc nhất từ kho ảnh của bạn để ghép thành hình trái tim hoàn mỹ! Khi Moon chơi lại hoặc xem lại trái tim, website sẽ tự động xáo trộn để hiển thị thêm các bức ảnh kỷ niệm khác.

---

### 3. Thêm nhạc nền du dương

1. Chuẩn bị 1 bài hát MP3 nhẹ nhàng, lãng mạn mà Moon thích.
2. Đổi tên bài hát thành `bgm.mp3` và sao chép vào thư mục `assets/music/`.
3. Kiểm tra file `config.js`:
   ```javascript
   music: {
     src: "assets/music/bgm.mp3",
     defaultVolume: 0.35 // Âm lượng êm dịu
   }
   ```
4. Khi Moon mở website, nút nhạc ở góc trên bên phải sẽ hiển thị. Moon chỉ cần chạm nhẹ vào nút là nhạc sẽ cất lên du dương.

---

### 4. Thiết lập Google Sheets để xem câu trả lời của Moon (Tùy chọn)

Nếu bạn muốn lưu lại những câu trả lời trắc nghiệm của Moon để hiểu sở thích của cô ấy hơn:

1. Truy cập [Google Sheets](https://sheets.new) để tạo 1 bảng tính mới.
2. Vào **Tiện ích mở rộng (Extensions)** > **Apps Script**.
3. Mở file `google-apps-script/Code.gs` trong dự án này, sao chép toàn bộ nội dung và dán vào Apps Script.
4. Nhấn **Lưu** (Ctrl + S).
5. Nhấn **Triển khai (Deploy)** > **Lượt triển khai mới (New deployment)**:
   - Chọn loại: **Ứng dụng web (Web app)**.
   - Thực thi dưới dạng (Execute as): **Tôi (Me)**.
   - Ai có quyền truy cập (Who has access): **Bất kỳ ai (Anyone)** *(Bắt buộc chọn cái này)*.
6. Cấp quyền truy cập cho tài khoản của bạn và sao chép **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`).
7. Mở file `config.js` trong website, dán URL vào:
   ```javascript
   googleSheets: {
     webAppUrl: "https://script.google.com/macros/s/AKfycb.../exec",
     timeoutMs: 8000
   }
   ```
8. **Quyền riêng tư**: Khi chơi xong, website sẽ hỏi Moon có đồng ý gửi câu trả lời hay không. Chỉ khi Moon bấm "Đồng ý", dữ liệu mới được chuyển lên Google Sheet của bạn!

---

## 🌐 Hướng Dẫn Đưa Website Lên Mạng (Miễn Phí 100%)

Để Moon có thể mở bằng một đường link trên điện thoại:

### Cách 1: Triển khai qua Vercel (Khuyên dùng - Nhanh nhất & Dễ nhất)

1. Tải toàn bộ thư mục dự án lên tài khoản GitHub của bạn (hoặc cài công cụ Vercel CLI).
2. Hoặc truy cập [vercel.com](https://vercel.com), đăng nhập bằng GitHub.
3. Kéo thả thư mục dự án hoặc chọn repository GitHub `20-10-cho-em-be-Moon`.
4. Nhấn **Deploy**.
5. Sau 10 giây, Vercel sẽ cấp cho bạn một đường link miễn phí dạng: `https://moon-2010.vercel.app`. Bạn chỉ cần gửi link này cho Moon!

### Cách 2: Triển khai qua GitHub Pages

1. Đẩy code lên repository GitHub cá nhân:
   ```bash
   git add .
   git commit -m "Qua tang 20/10 cho Moon"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/20-10-cho-moon.git
   git push -u origin main
   ```
2. Vào trang GitHub của repository > **Settings** > **Pages**.
3. Tại phần **Build and deployment** > Source chọn **Deploy from a branch**.
4. Chọn branch **main** và thư mục **/ (root)** > Nhấn **Save**.
5. Sau khoảng 1–2 phút, bạn sẽ nhận được đường link: `https://<tai-khoan-cua-ban>.github.io/20-10-cho-moon/`.

---

## 📱 Kiểm Tra & Trải Nghiệm Thử

Mở file `index.html` trực tiếp bằng trình duyệt trên máy tính (hoặc dùng tiện ích Live Server trong VS Code / chạy máy chủ cục bộ) để trải nghiệm toàn bộ luồng quà tặng trước khi gửi cho Moon.

Chúc bạn và Moon có một ngày 20/10 thật đáng nhớ và nhiều niềm vui! 🌷💖
