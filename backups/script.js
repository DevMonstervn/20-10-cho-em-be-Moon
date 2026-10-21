/**
 * SCRIPT.JS - ĐIỀU KHIỂN TRÒ CHƠI, CÂU HỎI, CANVAS TRÁI TIM & HIỆU ỨNG 20/10
 * Dành riêng cho Moon 🌙
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. KHỞI TẠO BIẾN TRẠNG THÁI (STATE MANAGEMENT)
     ========================================================================== */
  const state = {
    currentScreen: 'welcome', // welcome | quiz | summary | heart | card
    currentQuestionIndex: 0,
    answers: {}, // { [questionId]: { value: string, text: string, isSkipped: boolean, isOther: boolean, otherText: string } }
    sessionId: 'moon_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
    isMusicPlaying: false,
    isShattering: false,
    isSubmitting: false, // Trạng thái đang gửi đáp án (chống spam click)
    hasSubmitted: false, // Đã gửi thành công hay chưa (chỉ gửi 1 lần mỗi phiên)
    imagesLoaded: [],
    imagesReady: false
  };

  /* ==========================================================================
     2. THAM CHIẾU DOM ELEMENTS
     ========================================================================== */
  const dom = {
    // Screens
    screenWelcome: document.getElementById('screen-welcome'),
    screenQuiz: document.getElementById('screen-quiz'),
    screenSummary: document.getElementById('screen-summary'),
    screenHeart: document.getElementById('screen-heart'),
    screenCard: document.getElementById('screen-card'),

    // Welcome Screen
    btnStartGame: document.getElementById('btn-start-game'),

    // Quiz Screen
    quizStepBadge: document.getElementById('quiz-step-badge'),
    quizPercent: document.getElementById('quiz-percent'),
    quizProgressFill: document.getElementById('quiz-progress-fill'),
    quizProgressbar: document.getElementById('quiz-progressbar'),
    quizQuestionTitle: document.getElementById('quiz-question-title'),
    quizOptionsContainer: document.getElementById('quiz-options-container'),
    quizCustomBox: document.getElementById('quiz-custom-input-box'),
    quizCustomInput: document.getElementById('quiz-custom-input'),
    quizCustomLabel: document.getElementById('quiz-custom-label'),
    charCurrent: document.getElementById('char-current'),
    inputErrorMsg: document.getElementById('input-error-msg'),
    qTag: document.getElementById('q-tag'),
    btnPrevQuestion: document.getElementById('btn-prev-question'),
    btnSkipQuestion: document.getElementById('btn-skip-question'),
    btnNextQuestion: document.getElementById('btn-next-question'),

    // Summary Screen
    summaryList: document.getElementById('summary-list'),
    summarySendNotice: document.getElementById('summary-send-notice'),
    summaryStatusBox: document.getElementById('summary-status-box'),
    summaryErrorActions: document.getElementById('summary-error-actions'),
    btnRetrySend: document.getElementById('btn-retry-send'),
    btnSkipSend: document.getElementById('btn-skip-send'),
    btnReviewAnswers: document.getElementById('btn-review-answers'),
    btnFinishSummary: document.getElementById('btn-finish-summary'),
    btnFinishSummaryText: document.getElementById('btn-finish-summary-text'),

    // Heart Screen
    canvasContainer: document.getElementById('canvas-container'),
    heartCanvas: document.getElementById('heart-canvas'),
    heartPromptText: document.getElementById('heart-prompt-text'),

    // Card Screen
    cardTitle: document.getElementById('card-title'),
    letterContent: document.getElementById('letter-content'),
    letterSignature: document.getElementById('letter-signature'),
    letterFooterWish: document.getElementById('letter-footer-wish'),
    btnReplayHeart: document.getElementById('btn-replay-heart'),
    btnShareGift: document.getElementById('btn-share-gift'),
    btnRestartGame: document.getElementById('btn-restart-game'),

    // Ambient & Music
    petalsContainer: document.getElementById('petals-container'),
    musicToggleBtn: document.getElementById('music-toggle-btn'),
    musicTooltip: document.getElementById('music-tooltip'),
    bgMusic: document.getElementById('bg-music'),
    toast: document.getElementById('toast')
  };

  /* ==========================================================================
     3. ĐIỀU HƯỚNG MÀN HÌNH (SCREEN TRANSITIONS)
     ========================================================================== */
  function showScreen(screenName) {
    const screens = [
      { name: 'welcome', el: dom.screenWelcome },
      { name: 'quiz', el: dom.screenQuiz },
      { name: 'summary', el: dom.screenSummary },
      { name: 'heart', el: dom.screenHeart },
      { name: 'card', el: dom.screenCard }
    ];

    screens.forEach(s => {
      if (s.name === screenName) {
        s.el.classList.add('active');
        s.el.scrollTop = 0;
      } else {
        s.el.classList.remove('active');
      }
    });

    state.currentScreen = screenName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Khi vào màn hình trái tim, render lại canvas
    if (screenName === 'heart') {
      initHeartCanvas();
    }
  }

  /* ==========================================================================
     4. HIỂN THỊ THÔNG BÁO TOAST
     ========================================================================== */
  let toastTimeout = null;
  function showToast(message, duration = 2600) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, duration);
  }

  /* ==========================================================================
     5. CÁNH HOA BAY NHẸ NHÀNG (AMBIENT PETALS)
     ========================================================================== */
  function initPetals() {
    if (!dom.petalsContainer) return;
    // Kiểm tra cài đặt giảm chuyển động
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const PETAL_COUNT = 14;
    for (let i = 0; i < PETAL_COUNT; i++) {
      createPetal(i);
    }
  }

  function createPetal(index) {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = Math.random() * 12 + 10;
    const startLeft = Math.random() * 100;
    const duration = Math.random() * 8 + 9;
    const delay = (index * 0.8) + (Math.random() * 2);

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.3}px`;
    petal.style.left = `${startLeft}%`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;

    dom.petalsContainer.appendChild(petal);
  }

  /* ==========================================================================
     6. ĐIỀU KHIỂN NHẠC NỀN (MUSIC CONTROLLER)
     ========================================================================== */
  function initMusic() {
    const musicConfig = window.APP_CONFIG?.music;
    if (!musicConfig || !dom.bgMusic || !dom.musicToggleBtn) return;

    dom.bgMusic.src = musicConfig.src;
    dom.bgMusic.volume = musicConfig.defaultVolume || 0.35;

    // Hiển thị tooltip gợi ý 4 giây đầu
    setTimeout(() => {
      if (!state.isMusicPlaying && dom.musicTooltip) {
        dom.musicTooltip.classList.add('show');
        setTimeout(() => dom.musicTooltip.classList.remove('show'), 3500);
      }
    }, 1500);

    dom.musicToggleBtn.addEventListener('click', toggleMusic);
  }

  function toggleMusic() {
    if (!dom.bgMusic) return;

    if (state.isMusicPlaying) {
      dom.bgMusic.pause();
      state.isMusicPlaying = false;
      dom.musicToggleBtn.classList.remove('playing');
      dom.musicToggleBtn.setAttribute('aria-label', 'Bật nhạc nền');
      showToast('Đã tạm dừng nhạc 🎵');
    } else {
      const playPromise = dom.bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            state.isMusicPlaying = true;
            dom.musicToggleBtn.classList.add('playing');
            dom.musicToggleBtn.setAttribute('aria-label', 'Tắt nhạc nền');
            if (dom.musicTooltip) dom.musicTooltip.classList.remove('show');
            showToast('Đang phát nhạc du dương 🎶');
          })
          .catch(err => {
            console.warn('Chưa phát được nhạc (có thể chưa thêm file nhạc):', err);
            showToast('Chưa có file nhạc tại assets/music/bgm.mp3 🌸');
          });
      }
    }
  }

  /* ==========================================================================
     7. LOGIC TRÒ CHƠI HỎI ĐÁP (10 CÂU HỎI)
     ========================================================================== */
  function loadQuestion(index) {
    const questions = window.APP_CONFIG?.quizQuestions || [];
    if (!questions[index]) return;

    const q = questions[index];
    state.currentQuestionIndex = index;

    // Cập nhật thẻ và tiến trình
    const totalQ = questions.length;
    const progressPercent = Math.round(((index + 1) / totalQ) * 100);

    dom.quizStepBadge.textContent = `Câu ${index + 1}/${totalQ}`;
    dom.quizPercent.textContent = `${progressPercent}%`;
    dom.quizProgressFill.style.width = `${progressPercent}%`;
    dom.quizProgressbar.setAttribute('aria-valuenow', index + 1);
    dom.qTag.textContent = `Câu hỏi ${index + 1}`;
    dom.quizQuestionTitle.textContent = q.question;

    // Nút lùi lại
    dom.btnPrevQuestion.disabled = (index === 0);

    // Xóa lỗi cũ
    dom.inputErrorMsg.classList.add('hidden');

    // Lấy câu trả lời hiện tại nếu có
    const currentAnswer = state.answers[q.id];

    // Xóa danh sách options cũ
    dom.quizOptionsContainer.innerHTML = '';

    if (q.isTextInput) {
      // Câu 10: Nhập văn bản tự do
      dom.quizOptionsContainer.style.display = 'none';
      dom.quizCustomBox.classList.remove('hidden');
      dom.quizCustomLabel.textContent = 'Lời nhắn của Moon gửi đến anh:';
      dom.quizCustomInput.placeholder = q.placeholder || 'Nhập lời nhắn ở đây...';
      dom.quizCustomInput.maxLength = q.maxLength || 500;
      dom.quizCustomInput.value = currentAnswer?.text || '';
      dom.charCurrent.textContent = dom.quizCustomInput.value.length;
    } else {
      dom.quizOptionsContainer.style.display = 'flex';
      let isOtherSelected = false;

      q.options.forEach((optText, optIdx) => {
        const isOtherOption = q.hasOther && (optIdx === q.options.length - 1);
        const isSelected = currentAnswer && (currentAnswer.value === optText || (isOtherOption && currentAnswer.isOther));

        if (isSelected && isOtherOption) {
          isOtherSelected = true;
        }

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `option-item ${isSelected ? 'selected' : ''}`;
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');

        const labelSpan = document.createElement('span');
        labelSpan.textContent = optText;

        const checkSpan = document.createElement('span');
        checkSpan.className = 'option-check';
        checkSpan.innerHTML = '✔';

        btn.appendChild(labelSpan);
        btn.appendChild(checkSpan);

        btn.addEventListener('click', () => {
          selectOption(q, optText, isOtherOption);
        });

        dom.quizOptionsContainer.appendChild(btn);
      });

      // Hiển thị hoặc ẩn ô nhập nếu chọn "Khác"
      if (isOtherSelected) {
        dom.quizCustomBox.classList.remove('hidden');
        dom.quizCustomLabel.textContent = 'Ý kiến riêng của Moon:';
        dom.quizCustomInput.placeholder = q.otherPlaceholder || 'Nhập câu trả lời của em nhé...';
        dom.quizCustomInput.maxLength = 150;
        dom.quizCustomInput.value = currentAnswer?.otherText || '';
        dom.charCurrent.textContent = dom.quizCustomInput.value.length;
      } else {
        dom.quizCustomBox.classList.add('hidden');
      }
    }
  }

  function selectOption(question, optionText, isOther) {
    // Đánh dấu active trên giao diện
    const allBtns = dom.quizOptionsContainer.querySelectorAll('.option-item');
    allBtns.forEach(btn => {
      btn.classList.remove('selected');
      btn.setAttribute('aria-checked', 'false');
    });

    // Tìm và active nút được chọn
    allBtns.forEach(btn => {
      if (btn.firstChild.textContent === optionText) {
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      }
    });

    if (isOther) {
      dom.quizCustomBox.classList.remove('hidden');
      dom.quizCustomLabel.textContent = 'Ý kiến riêng của Moon:';
      dom.quizCustomInput.placeholder = question.otherPlaceholder || 'Nhập câu trả lời của em nhé...';
      dom.quizCustomInput.maxLength = 150;
      dom.quizCustomInput.focus();
      state.answers[question.id] = {
        value: optionText,
        text: dom.quizCustomInput.value.trim() ? `Khác: ${dom.quizCustomInput.value.trim()}` : optionText,
        isSkipped: false,
        isOther: true,
        otherText: dom.quizCustomInput.value.trim()
      };
    } else {
      dom.quizCustomBox.classList.add('hidden');
      state.answers[question.id] = {
        value: optionText,
        text: optionText,
        isSkipped: false,
        isOther: false
      };
    }

    dom.inputErrorMsg.classList.add('hidden');
  }

  // Lắng nghe nhập liệu trong ô textarea
  if (dom.quizCustomInput) {
    dom.quizCustomInput.addEventListener('input', (e) => {
      const val = e.target.value;
      dom.charCurrent.textContent = val.length;

      const questions = window.APP_CONFIG?.quizQuestions || [];
      const q = questions[state.currentQuestionIndex];
      if (!q) return;

      if (q.isTextInput) {
        state.answers[q.id] = {
          value: val.trim(),
          text: val.trim() || '(Bỏ qua không nhắn)',
          isSkipped: val.trim() === '',
          isOther: false
        };
      } else if (state.answers[q.id]?.isOther) {
        state.answers[q.id].otherText = val.trim();
        state.answers[q.id].text = val.trim() ? `Khác: ${val.trim()}` : state.answers[q.id].value;
      }
    });
  }

  function handleNext() {
    const questions = window.APP_CONFIG?.quizQuestions || [];
    const q = questions[state.currentQuestionIndex];
    if (!q) return;

    // Kiểm tra câu trả lời
    const answer = state.answers[q.id];

    // Nếu chưa chọn gì mà bấm "Tiếp tục"
    if (!answer || (!answer.isSkipped && !answer.text)) {
      if (q.isTextInput && q.optional) {
        // Cho phép bỏ qua câu 10 nếu là câu tự chọn
        state.answers[q.id] = {
          value: '',
          text: '(Không nhắn thêm)',
          isSkipped: true,
          isOther: false
        };
      } else {
        // Hiển thị nhắc nhẹ hoặc hướng dẫn bấm "Bỏ qua"
        dom.inputErrorMsg.textContent = 'Moon hãy chọn 1 đáp án hoặc bấm "Bỏ qua" nhé 🌸';
        dom.inputErrorMsg.classList.remove('hidden');
        return;
      }
    }

    // Nếu là "Khác" nhưng chưa nhập nội dung, lấy chữ "Lựa chọn khác"
    if (answer && answer.isOther && !answer.otherText) {
      answer.text = answer.value;
    }

    // Chuyển câu tiếp theo hoặc sang Tổng kết
    if (state.currentQuestionIndex < questions.length - 1) {
      loadQuestion(state.currentQuestionIndex + 1);
    } else {
      renderSummaryScreen();
      showScreen('summary');
    }
  }

  function handleSkip() {
    const questions = window.APP_CONFIG?.quizQuestions || [];
    const q = questions[state.currentQuestionIndex];
    if (!q) return;

    // Lưu trạng thái đã bỏ qua
    state.answers[q.id] = {
      value: '',
      text: 'Đã bỏ qua câu này',
      isSkipped: true,
      isOther: false
    };

    if (state.currentQuestionIndex < questions.length - 1) {
      loadQuestion(state.currentQuestionIndex + 1);
    } else {
      renderSummaryScreen();
      showScreen('summary');
    }
  }

  function handlePrev() {
    if (state.currentQuestionIndex > 0) {
      loadQuestion(state.currentQuestionIndex - 1);
    }
  }

  /* ==========================================================================
     8. MÀN HÌNH TỔNG KẾT (SUMMARY SCREEN)
     ========================================================================== */
  function renderSummaryScreen() {
    const questions = window.APP_CONFIG?.quizQuestions || [];
    dom.summaryList.innerHTML = '';

    questions.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'summary-item';

      const qText = document.createElement('div');
      qText.className = 'summary-q-text';
      qText.textContent = `Câu ${idx + 1}: ${q.question}`;

      const ansObj = state.answers[q.id];
      const aText = document.createElement('div');
      aText.className = `summary-a-text ${ansObj?.isSkipped ? 'skipped' : ''}`;
      aText.textContent = ansObj?.text || 'Chưa trả lời';

      item.appendChild(qText);
      item.appendChild(aText);
      dom.summaryList.appendChild(item);
    });

    // Reset trạng thái hiển thị của thông báo và nút gửi
    if (dom.summaryStatusBox) dom.summaryStatusBox.classList.add('hidden');
    if (dom.summaryErrorActions) dom.summaryErrorActions.classList.add('hidden');
    if (dom.btnFinishSummary) dom.btnFinishSummary.disabled = false;
    if (dom.btnFinishSummaryText) {
      dom.btnFinishSummaryText.textContent = state.hasSubmitted ? 'Xem lại quà 3D 🎁' : 'Tiếp tục mở quà 🎁';
    }
  }

  /* ==========================================================================
     9. GỬI ĐÁP ÁN ĐẾN GOOGLE SHEETS & CHUYỂN TIẾP TRÁI TIM ẢNH 3D
     ========================================================================== */
  async function handleFinishSummary() {
    // Ngăn chặn nhấn liên tục khi đang xử lý
    if (state.isSubmitting) return;

    // Nếu trong phiên này đã gửi thành công rồi, không gửi lại để tránh trùng dữ liệu
    if (state.hasSubmitted) {
      showScreen('heart');
      return;
    }

    const sheetsConfig = window.APP_CONFIG?.googleSheets;
    const webAppUrl = sheetsConfig?.webAppUrl?.trim();

    // KIỂM TRA: Dịch vụ Google Sheets đã được cấu hình hay chưa
    if (!webAppUrl) {
      // Trung thực thông báo chưa cấu hình, không giả mạo thành công
      dom.summaryStatusBox.className = 'summary-status-box warning';
      dom.summaryStatusBox.textContent = 'Chưa cấu hình URL Google Sheets trong file config.js để lưu câu trả lời.';
      dom.summaryStatusBox.classList.remove('hidden');
      dom.summaryErrorActions.classList.remove('hidden');
      dom.btnFinishSummary.disabled = false;
      return;
    }

    // TIẾN HÀNH GỬI: Đánh dấu đang xử lý và hiển thị trạng thái
    state.isSubmitting = true;
    dom.btnFinishSummary.disabled = true;
    if (dom.btnFinishSummaryText) dom.btnFinishSummaryText.textContent = 'Đang gửi câu trả lời... ⏳';

    dom.summaryStatusBox.className = 'summary-status-box info';
    dom.summaryStatusBox.textContent = 'Đang gửi câu trả lời của Moon đến anh... 💌';
    dom.summaryStatusBox.classList.remove('hidden');
    dom.summaryErrorActions.classList.add('hidden');

    // Chuẩn bị payload câu trả lời
    const payload = {
      timestamp: new Date().toISOString(),
      sessionId: state.sessionId,
      recipient: window.APP_CONFIG?.recipientName || 'Moon',
      answers: {}
    };

    const questions = window.APP_CONFIG?.quizQuestions || [];
    questions.forEach(q => {
      const a = state.answers[q.id];
      payload.answers[`cau_${q.id}`] = a?.isSkipped ? '[Đã bỏ qua]' : (a?.text || '');
    });

    const timeoutMs = sheetsConfig?.timeoutMs || 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Gửi bằng text/plain để tránh preflight CORS request bị Google Apps Script chặn
      const res = await fetch(webAppUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      clearTimeout(timeoutId);

      let isSuccess = res.ok;
      try {
        const json = await res.json();
        if (json && json.status === 'success') {
          isSuccess = true;
        }
      } catch (e) {
        if (res.ok) isSuccess = true;
      }

      if (isSuccess) {
        state.hasSubmitted = true;
        state.isSubmitting = false;
        dom.summaryStatusBox.className = 'summary-status-box success';
        dom.summaryStatusBox.textContent = 'Gửi câu trả lời thành công! Đang chuyển sang trái tim ảnh 3D... 🎁';
        setTimeout(() => {
          showScreen('heart');
        }, 700);
      } else {
        throw new Error('Máy chủ Google Sheets phản hồi không thành công.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      state.isSubmitting = false;
      dom.btnFinishSummary.disabled = false;
      if (dom.btnFinishSummaryText) dom.btnFinishSummaryText.textContent = 'Tiếp tục mở quà 🎁';

      dom.summaryStatusBox.className = 'summary-status-box warning';
      dom.summaryStatusBox.textContent = 'Có lỗi khi gửi dữ liệu (lỗi mạng hoặc URL). Em có thể thử gửi lại hoặc tiếp tục mở quà nhé 💗';
      dom.summaryErrorActions.classList.remove('hidden');
    }
  }

  /* ==========================================================================
     10. TRÁI TIM GHÉP ẢNH & HIỆU ỨNG VỠ TRÁI TIM (CANVAS & PARTICLES)
     ========================================================================== */
  let heartTiles = [];
  let shatterParticles = [];
  let animationFrameId = null;

  // Tọa độ chuẩn hóa của 26 ô ảnh tạo nên hình trái tim hoàn mỹ
  const HEART_LAYOUT = [
    // Hàng 1 (hai vòm trên của trái tim)
    { x: -0.44, y: -0.66, w: 0.22, h: 0.22 },
    { x: -0.22, y: -0.74, w: 0.22, h: 0.22 },
    { x:  0.22, y: -0.74, w: 0.22, h: 0.22 },
    { x:  0.44, y: -0.66, w: 0.22, h: 0.22 },

    // Hàng 2
    { x: -0.66, y: -0.42, w: 0.22, h: 0.22 },
    { x: -0.44, y: -0.43, w: 0.22, h: 0.22 },
    { x: -0.22, y: -0.46, w: 0.22, h: 0.22 },
    { x:  0.00, y: -0.48, w: 0.22, h: 0.22 },
    { x:  0.22, y: -0.46, w: 0.22, h: 0.22 },
    { x:  0.44, y: -0.43, w: 0.22, h: 0.22 },
    { x:  0.66, y: -0.42, w: 0.22, h: 0.22 },

    // Hàng 3 (vùng rộng nhất)
    { x: -0.68, y: -0.15, w: 0.22, h: 0.22 },
    { x: -0.45, y: -0.16, w: 0.22, h: 0.22 },
    { x: -0.22, y: -0.18, w: 0.22, h: 0.22 },
    { x:  0.00, y: -0.20, w: 0.22, h: 0.22 },
    { x:  0.22, y: -0.18, w: 0.22, h: 0.22 },
    { x:  0.45, y: -0.16, w: 0.22, h: 0.22 },
    { x:  0.68, y: -0.15, w: 0.22, h: 0.22 },

    // Hàng 4 (thuôn dần vào trong)
    { x: -0.46, y:  0.10, w: 0.22, h: 0.22 },
    { x: -0.23, y:  0.10, w: 0.22, h: 0.22 },
    { x:  0.00, y:  0.10, w: 0.22, h: 0.22 },
    { x:  0.23, y:  0.10, w: 0.22, h: 0.22 },
    { x:  0.46, y:  0.10, w: 0.22, h: 0.22 },

    // Hàng 5 (gần chóp nhọn)
    { x: -0.26, y:  0.36, w: 0.22, h: 0.22 },
    { x:  0.00, y:  0.37, w: 0.22, h: 0.22 },
    { x:  0.26, y:  0.36, w: 0.22, h: 0.22 },

    // Hàng 6 (chóp nhọn đáy trái tim)
    { x:  0.00, y:  0.64, w: 0.24, h: 0.24 }
  ];

  // Danh sách toàn bộ ảnh khả dụng lấy từ Manifest hoặc cấu hình
  let allAvailablePhotos = [];
  let currentHeartPhotos = [];

  // Lấy danh sách ảnh từ Manifest (ưu tiên window.PHOTO_MANIFEST hoặc fetch json)
  async function loadPhotoManifest() {
    // 1. Kiểm tra biến toàn cục từ assets/photos-manifest.js (hoạt động kể cả file:/// không bị CORS)
    if (window.PHOTO_MANIFEST && Array.isArray(window.PHOTO_MANIFEST.photos) && window.PHOTO_MANIFEST.photos.length > 0) {
      allAvailablePhotos = window.PHOTO_MANIFEST.photos;
      return allAvailablePhotos;
    }

    // 2. Thử fetch file JSON nếu đang chạy trên HTTP/HTTPS
    try {
      const res = await fetch('assets/photos-manifest.json');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.photos) && data.photos.length > 0) {
          allAvailablePhotos = data.photos;
          return allAvailablePhotos;
        }
      }
    } catch (e) {
      // Bỏ qua lỗi fetch khi mở bằng file://
    }

    // 3. Dự phòng danh sách từ photos.js
    if (window.PHOTO_LIST && Array.isArray(window.PHOTO_LIST) && window.PHOTO_LIST.length > 0) {
      allAvailablePhotos = window.PHOTO_LIST;
      return allAvailablePhotos;
    }

    allAvailablePhotos = [];
    return allAvailablePhotos;
  }

  // Thuật toán xáo trộn mảng Fisher-Yates
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Chọn 26 ảnh độc nhất cho 26 ô trái tim (không lặp ảnh khi có nhiều ảnh)
  function selectPhotosForHeart(targetCount = 26) {
    if (!allAvailablePhotos || allAvailablePhotos.length === 0) {
      return [];
    }

    const shuffled = shuffleArray(allAvailablePhotos);

    // Nếu số ảnh khả dụng lớn hơn hoặc bằng 26, chọn 26 ảnh hoàn toàn khác nhau
    if (shuffled.length >= targetCount) {
      return shuffled.slice(0, targetCount);
    }

    // Nếu ít hơn 26 ảnh, phân bổ tuần hoàn sao cho các ô liền kề không trùng lặp
    const result = [];
    for (let i = 0; i < targetCount; i++) {
      result.push(shuffled[i % shuffled.length]);
    }
    return result;
  }

  // Tải trước ảnh bất đồng bộ với cơ chế tự phục hồi nếu ảnh lỗi
  async function preloadHeartImages() {
    await loadPhotoManifest();
    currentHeartPhotos = selectPhotosForHeart(HEART_LAYOUT.length);

    const fallbacks = window.FALLBACK_PLACEHOLDERS || [];
    const pool = shuffleArray(allAvailablePhotos);
    let poolIndex = currentHeartPhotos.length;

    const loadSingleImage = (item, idx) => {
      return new Promise(resolve => {
        if (!item || !item.src) {
          const fallback = fallbacks[idx % fallbacks.length];
          const canvas = createFallbackTileCanvas(fallback);
          return resolve({ isLoaded: false, img: canvas, data: item, fallback });
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Tự động thử nạp ảnh
        img.onload = () => {
          resolve({ isLoaded: true, img: img, data: item });
        };

        img.onerror = () => {
          // Nếu ảnh lỗi, thử lấy 1 ảnh chưa dùng trong kho ảnh (nếu còn)
          if (poolIndex < pool.length) {
            const alternativeItem = pool[poolIndex++];
            const altImg = new Image();
            altImg.crossOrigin = 'anonymous';
            altImg.onload = () => resolve({ isLoaded: true, img: altImg, data: alternativeItem });
            altImg.onerror = () => {
              const fallback = fallbacks[idx % fallbacks.length];
              const canvas = createFallbackTileCanvas(fallback);
              resolve({ isLoaded: false, img: canvas, data: item, fallback });
            };
            altImg.src = alternativeItem.src || alternativeItem.originalPath;
          } else {
            // Dùng thẻ pastel nghệ thuật nếu không còn ảnh nào khác
            const fallback = fallbacks[idx % fallbacks.length];
            const canvas = createFallbackTileCanvas(fallback);
            resolve({ isLoaded: false, img: canvas, data: item, fallback });
          }
        };

        // Sử dụng thumbnail đã tối ưu hoặc đường dẫn gốc
        img.src = item.src || item.thumbnailPath || item.originalPath;
      });
    };

    const loadPromises = currentHeartPhotos.map((item, idx) => loadSingleImage(item, idx));
    const results = await Promise.all(loadPromises);

    state.imagesLoaded = results;
    state.imagesReady = true;

    if (state.currentScreen === 'heart') {
      drawIntactHeart();
    }
  }

  // Vẽ thẻ ảnh pastel nghệ thuật làm fallback
  function createFallbackTileCanvas(fallback) {
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 120;
    const ctx = c.getContext('2d');

    // Nền gradient
    const grad = ctx.createLinearGradient(0, 0, 120, 120);
    grad.addColorStop(0, '#ffd1dc');
    grad.addColorStop(0.5, '#fde2e4');
    grad.addColorStop(1, '#e2d4f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 120, 120);

    // Biểu tượng icon ở giữa
    ctx.font = '40px "Quicksand", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallback.icon || '🌸', 60, 56);

    // Tiêu đề nhỏ bên dưới
    ctx.fillStyle = '#6b3e52';
    ctx.font = 'bold 13px "Quicksand", sans-serif';
    ctx.fillText(fallback.title || 'Moon', 60, 94);

    return c;
  }

  function initHeartCanvas() {
    const canvas = dom.heartCanvas;
    if (!canvas) return;

    const container = dom.canvasContainer;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const size = Math.floor(Math.min(rect.width, rect.height, 400));
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    state.isShattering = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Xây dựng danh sách ô ảnh trái tim
    buildHeartTiles(size * dpr);
    drawIntactHeart();
  }

  function buildHeartTiles(canvasSize) {
    heartTiles = [];
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const scale = canvasSize * 0.46; // Hệ số tỷ lệ kích thước trái tim

    const images = state.imagesLoaded;
    const fallbacks = window.FALLBACK_PLACEHOLDERS || [];

    HEART_LAYOUT.forEach((layout, idx) => {
      const tilePixelW = layout.w * scale * 1.05;
      const tilePixelH = layout.h * scale * 1.05;
      const tileX = centerX + layout.x * scale - tilePixelW / 2;
      const tileY = centerY + layout.y * scale - tilePixelH / 2;

      let imgObj = null;
      if (images && images.length > 0 && images[idx % images.length]) {
        imgObj = images[idx % images.length].img;
      } else {
        imgObj = createFallbackTileCanvas(fallbacks[idx % fallbacks.length]);
      }

      heartTiles.push({
        x: tileX,
        y: tileY,
        w: tilePixelW,
        h: tilePixelH,
        img: imgObj,
        idx: idx
      });
    });
  }

  function drawIntactHeart() {
    const canvas = dom.heartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    heartTiles.forEach(tile => {
      ctx.save();

      // Đổ bóng nhẹ cho từng ô ảnh
      ctx.shadowColor = 'rgba(255, 117, 143, 0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Bo góc ô ảnh
      const r = Math.min(tile.w, tile.h) * 0.22;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(tile.x, tile.y, tile.w, tile.h, r);
      } else {
        ctx.rect(tile.x, tile.y, tile.w, tile.h);
      }
      ctx.clip();

      // Vẽ ảnh fit vuông
      if (tile.img) {
        ctx.drawImage(tile.img, tile.x, tile.y, tile.w, tile.h);
      } else {
        ctx.fillStyle = '#fbc4ab';
        ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
      }

      // Viền sáng mềm mại
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    });
  }

  /* ==========================================================================
     11. KÍCH HOẠT HIỆU ỨNG VỠ TRÁI TIM (SHATTER ANIMATION)
     ========================================================================== */
  function triggerHeartShatter() {
    if (state.isShattering) return;
    state.isShattering = true;

    // Rung nhẹ điện thoại nếu hỗ trợ
    if (navigator.vibrate) {
      try { navigator.vibrate([40, 50, 60]); } catch (e) { /* ignore */ }
    }

    // Nếu người dùng chọn giảm chuyển động, chuyển màn hình ngay
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => {
        renderCardScreen();
        showScreen('card');
      }, 300);
      return;
    }

    const canvas = dom.heartCanvas;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    shatterParticles = [];

    // Chuyển từng tile thành các mảnh bay
    heartTiles.forEach(tile => {
      // Chia mỗi tile thành 2 mảnh nhỏ
      for (let s = 0; s < 2; s++) {
        const dx = (tile.x + tile.w / 2) - centerX;
        const dy = (tile.y + tile.h / 2) - centerY;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = (Math.random() * 8 + 6);

        shatterParticles.push({
          type: 'tile',
          x: tile.x + (s * tile.w * 0.2),
          y: tile.y + (s * tile.h * 0.2),
          w: tile.w * 0.65,
          h: tile.h * 0.65,
          vx: (dx / dist) * speed + (Math.random() * 4 - 2),
          vy: (dy / dist) * speed - (Math.random() * 5 + 3),
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          scale: 1,
          alpha: 1,
          img: tile.img
        });
      }
    });

    // Thêm các hạt hoa, trái tim và sao lấp lánh nổ ra
    const SPARKLE_COUNT = 45;
    const sparkleEmojis = ['💖', '✨', '🌸', '🌷', '🤍', '⭐'];

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      shatterParticles.push({
        type: 'sparkle',
        emoji: sparkleEmojis[i % sparkleEmojis.length],
        x: centerX + (Math.random() * 40 - 20),
        y: centerY + (Math.random() * 40 - 20),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 3 + 2),
        size: Math.random() * 16 + 14,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        scale: 1,
        alpha: 1
      });
    }

    const startTime = performance.now();
    const DURATION = 1400; // 1.4s chuyển cảnh hoàn hảo

    function animateShatter(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shatterParticles.forEach(p => {
        // Cập nhật vị trí và vật lý
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Trọng lực nhẹ
        p.rot += p.vRot;
        p.scale = Math.max(0, 1 - progress * 0.85);
        p.alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = p.alpha;

        if (p.type === 'tile') {
          if (p.img) {
            ctx.drawImage(p.img, -p.w / 2, -p.h / 2, p.w, p.h);
          }
        } else if (p.type === 'sparkle') {
          ctx.font = `${p.size}px "Quicksand", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
        }

        ctx.restore();
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateShatter);
      } else {
        // Kết thúc animation -> chuyển sang màn hình thiệp
        renderCardScreen();
        showScreen('card');
      }
    }

    animationFrameId = requestAnimationFrame(animateShatter);
  }

  /* ==========================================================================
     12. MÀN HÌNH THIỆP CHÚC MỪNG 20/10
     ========================================================================== */
  function renderCardScreen() {
    const cardConfig = window.APP_CONFIG?.card;
    if (!cardConfig) return;

    dom.cardTitle.textContent = cardConfig.title || '🌷 Chúc Moon ngày 20/10 thật vui vẻ!';
    dom.letterSignature.textContent = cardConfig.signature || '— Anh —';
    dom.letterFooterWish.textContent = cardConfig.footerWish || 'Happy Vietnamese Women\'s Day • 20.10 ✨';

    // Nội dung các đoạn văn trong thiệp
    dom.letterContent.innerHTML = '';
    (cardConfig.paragraphs || []).forEach(pText => {
      const p = document.createElement('p');
      p.textContent = pText;
      dom.letterContent.appendChild(p);
    });
  }

  function handleShareGift() {
    const shareData = {
      title: window.APP_CONFIG?.appTitle || 'Món quà 20/10 dành cho Moon 🌙',
      text: 'Món quà nho nhỏ anh gửi tặng Moon ngày 20/10 💗',
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {
        copyGiftUrl();
      });
    } else {
      copyGiftUrl();
    }
  }

  function copyGiftUrl() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => showToast('Đã sao chép link quà tặng 💖'))
        .catch(() => showToast('Vui lòng sao chép link trên thanh địa chỉ nhé!'));
    } else {
      showToast('Vui lòng sao chép link trên thanh địa chỉ nhé!');
    }
  }

  function restartGame() {
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.isSubmitting = false;
    state.hasSubmitted = false;
    state.sessionId = 'moon_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    loadQuestion(0);
    showScreen('welcome');
    showToast('Đã bắt đầu lại trò chơi 🌸');
  }

  /* ==========================================================================
     13. ĐĂNG KÝ SỰ KIỆN TƯƠNG TÁC (EVENT LISTENERS)
     ========================================================================== */
  function registerEvents() {
    // Welcome
    dom.btnStartGame.addEventListener('click', () => {
      loadQuestion(0);
      showScreen('quiz');
    });

    // Quiz
    dom.btnPrevQuestion.addEventListener('click', handlePrev);
    dom.btnNextQuestion.addEventListener('click', handleNext);
    dom.btnSkipQuestion.addEventListener('click', handleSkip);

    // Summary
    dom.btnReviewAnswers.addEventListener('click', () => {
      loadQuestion(0);
      showScreen('quiz');
    });
    dom.btnFinishSummary.addEventListener('click', handleFinishSummary);
    if (dom.btnRetrySend) dom.btnRetrySend.addEventListener('click', handleFinishSummary);
    if (dom.btnSkipSend) dom.btnSkipSend.addEventListener('click', () => { showScreen('heart'); });

    // Heart Canvas (hỗ trợ cả click và chạm trên mobile)
    dom.heartCanvas.addEventListener('click', triggerHeartShatter);
    dom.heartCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      triggerHeartShatter();
    }, { passive: false });

    // Hiệu ứng tương tác nghiêng 3D theo ngón tay / con trỏ chuột
    if (dom.canvasContainer) {
      const handleTilt = (clientX, clientY) => {
        if (state.currentScreen !== 'heart' || state.isShattering) return;
        const rect = dom.canvasContainer.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        const rotateX = -(y / (rect.height / 2)) * 10;
        const rotateY = (x / (rect.width / 2)) * 12;
        dom.heartCanvas.style.transform = `rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale(1.02)`;
      };

      dom.canvasContainer.addEventListener('mousemove', (e) => {
        handleTilt(e.clientX, e.clientY);
      });
      dom.canvasContainer.addEventListener('mouseleave', () => {
        dom.heartCanvas.style.transform = '';
      });
      dom.canvasContainer.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          handleTilt(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      dom.canvasContainer.addEventListener('touchend', () => {
        dom.heartCanvas.style.transform = '';
      }, { passive: true });
    }

    // Prompt text below canvas can also be tapped
    dom.heartPromptText.addEventListener('click', triggerHeartShatter);

    // Card Screen
    dom.btnReplayHeart.addEventListener('click', () => {
      initHeartCanvas();
      showScreen('heart');
    });
    dom.btnShareGift.addEventListener('click', handleShareGift);
    dom.btnRestartGame.addEventListener('click', () => {
      restartGame();
      preloadHeartImages(); // Tải tập ảnh mới ngẫu nhiên cho lượt chơi mới
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      if (state.currentScreen === 'heart' && !state.isShattering) {
        initHeartCanvas();
      }
    });
  }

  /* ==========================================================================
     14. KHỞI CHẠY ỨNG DỤNG (APPLICATION BOOTSTRAP)
     ========================================================================== */
  function initApp() {
    initPetals();
    initMusic();
    preloadHeartImages();
    registerEvents();
    showScreen('welcome');
  }

  // Khởi động khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
