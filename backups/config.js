/**
 * CONFIG.JS - CẤU HÌNH DÀNH RIÊNG CHO MÓN QUÀ 20/10 CỦA MOON
 * 
 * Bạn có thể dễ dàng thay đổi các thông tin tại đây:
 * - Tên người nhận (Moon)
 * - Tên người gửi (Anh)
 * - Nội dung thiệp chúc mừng 20/10
 * - Đường dẫn Google Sheets Web App (nếu sử dụng)
 * - Thiết lập nhạc nền
 */

window.APP_CONFIG = {
  // Thông tin người nhận và người gửi
  recipientName: "Moon",
  senderName: "Anh",
  appTitle: "Món quà 20/10 dành riêng cho Moon 🌙",

  // Cấu hình nhạc nền
  music: {
    // Đặt file mp3 của bạn vào assets/music/ rồi đổi tên file ở đây (ví dụ: 'assets/music/moon-song.mp3')
    src: "assets/music/bgm.mp3",
    // Âm lượng mặc định (0.0 đến 1.0, khuyến nghị 0.3 - 0.5 để êm dịu)
    defaultVolume: 0.35,
    // Thông báo gợi ý bật nhạc
    hintText: "Bật nhạc du dương"
  },

  // Cấu hình Google Sheets để lưu câu trả lời (Tùy chọn)
  // Sau khi triển khai Google Apps Script theo hướng dẫn trong README.md, dán URL Web App vào đây
  googleSheets: {
    // Để trống "" nếu chưa cấu hình. Hệ thống sẽ xử lý trung thực và nhẹ nhàng.
    webAppUrl: "",
    timeoutMs: 8000
  },

  // Nội dung thiệp chúc mừng 20/10 hiển thị ở màn hình cuối cùng
  card: {
    title: "🌷 Chúc Moon ngày 20/10 thật vui vẻ!",
    paragraphs: [
      "Chúc em luôn xinh đẹp, bình an và gặp thật nhiều điều tốt đẹp.",
      "Mong rằng mỗi ngày của em đều có những khoảnh khắc khiến em mỉm cười và cảm thấy hạnh phúc.",
      "Cảm ơn Moon đã dành chút thời gian chơi trò chơi nhỏ này cùng anh nhé! 💗"
    ],
    signature: "— Anh —",
    footerWish: "Happy Vietnamese Women's Day • 20.10 ✨"
  },

  // 10 câu hỏi để tìm hiểu sở thích và tính cách của Moon
  quizQuestions: [
    {
      id: 1,
      question: "Nếu được chọn một nơi để thư giãn, Moon thích nơi nào nhất?",
      options: [
        "Một quán cà phê xinh xắn ☕",
        "Đi dạo ở nơi có nhiều cây xanh 🌿",
        "Đi biển ngắm hoàng hôn 🌅",
        "Ở nhà nghỉ ngơi thật thoải mái 🛋️",
        "Một nơi khác"
      ],
      hasOther: true,
      otherPlaceholder: "Chia sẻ nơi thư giãn lý tưởng của Moon nhé..."
    },
    {
      id: 2,
      question: "Moon thích loài hoa nào nhất?",
      options: [
        "Hoa hồng 🌹",
        "Hoa tulip 🌷",
        "Hoa hướng dương 🌻",
        "Hoa baby 🌸",
        "Loài hoa khác"
      ],
      hasOther: true,
      otherPlaceholder: "Tên loài hoa Moon thích là gì nè..."
    },
    {
      id: 3,
      question: "Nếu được chọn một món đồ uống ngay bây giờ, Moon sẽ chọn gì?",
      options: [
        "Trà sữa ngọt ngào 🧋",
        "Trà trái cây thanh mát 🍹",
        "Cà phê thơm lừng ☕",
        "Nước ép bổ dưỡng 🥤",
        "Một món khác"
      ],
      hasOther: true,
      otherPlaceholder: "Món đồ uống chân ái của Moon hôm nay là..."
    },
    {
      id: 4,
      question: "Khi buồn hoặc mệt mỏi, Moon thường muốn làm gì nhất?",
      options: [
        "Có người ngồi nghe mình tâm sự 🤍",
        "Ở một mình một lúc để sạc lại năng lượng 🎧",
        "Đi ăn một món thật ngon 🍰",
        "Nghe nhạc hoặc xem bộ phim yêu thích 🎬",
        "Một điều khác"
      ],
      hasOther: true,
      otherPlaceholder: "Cách Moon thường tự dỗ dành bản thân là..."
    },
    {
      id: 5,
      question: "Moon thích kiểu quà tặng nào hơn?",
      options: [
        "Một món quà bất ngờ 🎁",
        "Một món đồ mình tự chọn theo sở thích 🛍️",
        "Một món quà nhỏ nhưng chứa nhiều ý nghĩa 💌",
        "Một trải nghiệm hoặc kỷ niệm đáng nhớ 🎡"
      ],
      hasOther: false
    },
    {
      id: 6,
      question: "Moon cảm thấy phong cách nào giống với mình nhất?",
      options: [
        "Dễ thương, nhẹ nhàng 🎀",
        "Thanh lịch, tinh tế ✨",
        "Năng động, cá tính 🧢",
        "Thay đổi tùy tâm trạng và thời tiết 🎨"
      ],
      hasOther: false
    },
    {
      id: 7,
      question: "Một ngày cuối tuần lý tưởng của Moon sẽ như thế nào?",
      options: [
        "Đi chơi và khám phá những địa điểm mới 🗺️",
        "Ăn ngon, lượn lờ mua sắm và chụp ảnh đẹp 📸",
        "Ở nhà xem phim, nghe nhạc, tận hưởng sự yên tĩnh 🛋️",
        "Gặp gỡ và trò chuyện cùng những người mình quý mến 👫",
        "Một lựa chọn khác"
      ],
      hasOther: true,
      otherPlaceholder: "Ngày nghỉ lý tưởng trong mơ của Moon là..."
    },
    {
      id: 8,
      question: "Điều nhỏ bé nào dễ khiến Moon mỉm cười nhất?",
      options: [
        "Được ai đó chủ động quan tâm và hỏi han 💭",
        "Nhận một lời khen chân thành, đúng lúc 🌟",
        "Bất ngờ được tặng món đồ mình đang thích 🎁",
        "Có người nhớ từng điều nhỏ xíu mình từng kể 🌸",
        "Một điều khác"
      ],
      hasOther: true,
      otherPlaceholder: "Điều gì làm tim Moon rung rinh nhất nè..."
    },
    {
      id: 9,
      question: "Nếu ngày mai hoàn toàn rảnh rỗi và không có deadline nào, Moon muốn làm gì nhất?",
      options: [
        "Ngủ một giấc thật sâu không cần báo thức 😴",
        "Lên đồ và đi chơi ngay 🚗",
        "Thử làm một điều gì đó mới mẻ 🔭",
        "Dành trọn vẹn thời gian cho sở thích riêng 🎨",
        "Một lựa chọn khác"
      ],
      hasOther: true,
      otherPlaceholder: "Kế hoạch tự do tự tại của Moon sẽ là..."
    },
    {
      id: 10,
      question: "Moon có muốn nhắn gửi điều gì với người đã chuẩn bị trò chơi này không?",
      isTextInput: true,
      placeholder: "Nhập đôi lời nhắn gửi đến anh ở đây nhé (hoặc có thể bỏ qua nếu em chưa muốn nhắn gì)...",
      optional: true,
      maxLength: 500
    }
  ]
};
