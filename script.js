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
    imagesReady: false,
    currentLightboxIndex: 0
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
    heart3dStage: document.getElementById('heart-3d-stage'),
    heart3dInner: document.getElementById('heart-3d-inner'),
    heartPromptText: document.getElementById('heart-prompt-text'),
    heartPhotoCount: document.getElementById('heart-photo-count'),
    btnShatterGift: document.getElementById('btn-shatter-gift'),

    // Lightbox Modal
    photoLightbox: document.getElementById('photo-lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxCounter: document.getElementById('lightbox-counter'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxBtnClose: document.getElementById('lightbox-btn-close'),
    lightboxBtnPrev: document.getElementById('lightbox-btn-prev'),
    lightboxBtnNext: document.getElementById('lightbox-btn-next'),
    lightboxBackdrop: document.getElementById('lightbox-backdrop'),
    lightboxLoader: document.getElementById('lightbox-loader'),

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

    // Khi vào màn hình trái tim, mở rộng app container trên desktop và render
    const appContainer = document.querySelector('.app-container');
    if (screenName === 'heart') {
      if (appContainer) appContainer.classList.add('heart-mode');
      initHeartCanvas();
      buildHeart3D();
      startGalaxy();
    } else {
      if (appContainer) appContainer.classList.remove('heart-mode');
      stopGalaxy();
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
     10. TRÁI TIM GHÉP ẢNH 3D & NỀN THIÊN HÀ (3D HEART & GALAXY)
     ========================================================================== */
  let heartTiles = [];
  let shatterParticles = [];
  let galaxyStars = [];
  let galaxyDust = [];
  let galaxyAnimId = null;
  let shatterAnimId = null;

  // 27 vị trí đối xứng tạo nên đường cong trái tim hoàn mỹ với chiều sâu 3D (Z-depth)
  const HEART_LAYOUT = [
    // Hàng 1 (4 ảnh - đỉnh 2 vòm trên của trái tim)
    { x: -0.42, y: -0.62, w: 0.20, h: 0.20, z: -8,  rx: 8,   ry: -12 },
    { x: -0.20, y: -0.72, w: 0.20, h: 0.20, z: -4,  rx: 10,  ry: -6 },
    { x:  0.20, y: -0.72, w: 0.20, h: 0.20, z: -4,  rx: 10,  ry: 6 },
    { x:  0.42, y: -0.62, w: 0.20, h: 0.20, z: -8,  rx: 8,   ry: 12 },

    // Hàng 2 (7 ảnh)
    { x: -0.64, y: -0.40, w: 0.20, h: 0.20, z: -6,  rx: 4,   ry: -14 },
    { x: -0.42, y: -0.41, w: 0.20, h: 0.20, z: 8,   rx: 5,   ry: -8 },
    { x: -0.21, y: -0.44, w: 0.20, h: 0.20, z: 18,  rx: 6,   ry: -4 },
    { x:  0.00, y: -0.46, w: 0.20, h: 0.20, z: 14,  rx: 4,   ry: 0 },
    { x:  0.21, y: -0.44, w: 0.20, h: 0.20, z: 18,  rx: 6,   ry: 4 },
    { x:  0.42, y: -0.41, w: 0.20, h: 0.20, z: 8,   rx: 5,   ry: 8 },
    { x:  0.64, y: -0.40, w: 0.20, h: 0.20, z: -6,  rx: 4,   ry: 14 },

    // Hàng 3 (7 ảnh - vùng rộng nhất & trung tâm trái tim)
    { x: -0.66, y: -0.14, w: 0.20, h: 0.20, z: -4,  rx: -2,  ry: -14 },
    { x: -0.43, y: -0.15, w: 0.20, h: 0.20, z: 16,  rx: 0,   ry: -8 },
    { x: -0.21, y: -0.17, w: 0.20, h: 0.20, z: 28,  rx: 0,   ry: -4 },
    { x:  0.00, y: -0.18, w: 0.21, h: 0.21, z: 32,  rx: 0,   ry: 0 },
    { x:  0.21, y: -0.17, w: 0.20, h: 0.20, z: 28,  rx: 0,   ry: 4 },
    { x:  0.43, y: -0.15, w: 0.20, h: 0.20, z: 16,  rx: 0,   ry: 8 },
    { x:  0.66, y: -0.14, w: 0.20, h: 0.20, z: -4,  rx: -2,  ry: 14 },

    // Hàng 4 (5 ảnh - thuôn dần vào trong)
    { x: -0.44, y:  0.10, w: 0.20, h: 0.20, z: 6,   rx: -6,  ry: -10 },
    { x: -0.22, y:  0.10, w: 0.20, h: 0.20, z: 22,  rx: -4,  ry: -4 },
    { x:  0.00, y:  0.10, w: 0.20, h: 0.20, z: 26,  rx: -4,  ry: 0 },
    { x:  0.22, y:  0.10, w: 0.20, h: 0.20, z: 22,  rx: -4,  ry: 4 },
    { x:  0.44, y:  0.10, w: 0.20, h: 0.20, z: 6,   rx: -6,  ry: 10 },

    // Hàng 5 (3 ảnh - gần chóp nhọn)
    { x: -0.24, y:  0.34, w: 0.20, h: 0.20, z: 8,   rx: -10, ry: -6 },
    { x:  0.00, y:  0.35, w: 0.21, h: 0.21, z: 18,  rx: -8,  ry: 0 },
    { x:  0.24, y:  0.34, w: 0.20, h: 0.20, z: 8,   rx: -10, ry: 6 },

    // Hàng 6 (1 ảnh - chóp nhọn đáy trái tim)
    { x:  0.00, y:  0.60, w: 0.22, h: 0.22, z: 10,  rx: -14, ry: 0 }
  ];

  let allAvailablePhotos = [];
  let currentHeartPhotos = [];

  // Nạp danh sách ảnh từ Manifest
  async function loadPhotoManifest() {
    if (window.PHOTO_MANIFEST && Array.isArray(window.PHOTO_MANIFEST.photos) && window.PHOTO_MANIFEST.photos.length > 0) {
      allAvailablePhotos = window.PHOTO_MANIFEST.photos;
      return allAvailablePhotos;
    }

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

    if (window.PHOTO_LIST && Array.isArray(window.PHOTO_LIST) && window.PHOTO_LIST.length > 0) {
      allAvailablePhotos = window.PHOTO_LIST;
      return allAvailablePhotos;
    }

    allAvailablePhotos = [];
    return allAvailablePhotos;
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function selectPhotosForHeart(targetCount = 27) {
    if (!allAvailablePhotos || allAvailablePhotos.length === 0) {
      return [];
    }

    const shuffled = shuffleArray(allAvailablePhotos);
    if (shuffled.length >= targetCount) {
      return shuffled.slice(0, targetCount);
    }

    const result = [];
    for (let i = 0; i < targetCount; i++) {
      result.push(shuffled[i % shuffled.length]);
    }
    return result;
  }

  async function preloadHeartImages() {
    await loadPhotoManifest();
    currentHeartPhotos = selectPhotosForHeart(HEART_LAYOUT.length);

    if (dom.heartPhotoCount) {
      dom.heartPhotoCount.textContent = `${allAvailablePhotos.length} bức ảnh kỷ niệm đong đầy yêu thương 💖`;
    }

    state.imagesReady = true;

    if (state.currentScreen === 'heart') {
      buildHeart3D();
    }
  }

  // Khởi tạo Canvas thiên hà & sao lấp lánh
  function initHeartCanvas() {
    const canvas = dom.heartCanvas;
    if (!canvas) return;

    const container = dom.canvasContainer;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Khởi tạo các ngôi sao thiên hà
    galaxyStars = [];
    const STAR_COUNT = 65;
    const starColors = ['#ffffff', '#ffd1dc', '#ffe5ec', '#f3d9fa', '#fff0f3', '#ffeaa7'];

    for (let i = 0; i < STAR_COUNT; i++) {
      galaxyStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.8 + 0.6) * dpr,
        baseAlpha: Math.random() * 0.45 + 0.35,
        pulseSpeed: Math.random() * 0.03 + 0.012,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // Khởi tạo bụi vũ trụ / hạt stardust bay bổng
    galaxyDust = [];
    const DUST_COUNT = 28;
    const dustColors = ['rgba(255, 182, 193, ', 'rgba(255, 223, 186, ', 'rgba(226, 212, 240, ', 'rgba(255, 209, 220, '];

    for (let i = 0; i < DUST_COUNT; i++) {
      galaxyDust.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 2.2 + 1) * dpr,
        vx: (Math.random() - 0.5) * 0.28 * dpr,
        vy: (-Math.random() * 0.45 - 0.15) * dpr,
        alpha: Math.random() * 0.45 + 0.2,
        color: dustColors[Math.floor(Math.random() * dustColors.length)]
      });
    }
  }

  function startGalaxy() {
    stopGalaxy();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderGalaxyFrame();
      return;
    }

    function loopGalaxy() {
      if (state.currentScreen !== 'heart' || state.isShattering) return;
      renderGalaxyFrame();
      galaxyAnimId = requestAnimationFrame(loopGalaxy);
    }
    galaxyAnimId = requestAnimationFrame(loopGalaxy);
  }

  function stopGalaxy() {
    if (galaxyAnimId) {
      cancelAnimationFrame(galaxyAnimId);
      galaxyAnimId = null;
    }
  }

  function renderGalaxyFrame() {
    const canvas = dom.heartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Vầng hào quang tinh vân hồng tím mềm mại
    const radialGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.min(w, h) * 0.55);
    radialGrad.addColorStop(0, 'rgba(255, 135, 168, 0.22)');
    radialGrad.addColorStop(0.45, 'rgba(181, 106, 219, 0.12)');
    radialGrad.addColorStop(0.85, 'rgba(255, 215, 235, 0.05)');
    radialGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, w, h);

    // Vẽ sao lấp lánh
    galaxyStars.forEach(s => {
      s.phase += s.pulseSpeed;
      const alpha = s.baseAlpha + Math.sin(s.phase) * 0.35;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Vẽ bụi vũ trụ lơ lửng
    galaxyDust.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.y < 0) d.y = h;
      if (d.x < 0) d.x = w;
      if (d.x > w) d.x = 0;
      ctx.fillStyle = d.color + d.alpha + ')';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  // Xây dựng các thẻ ảnh 3D nổi bật trong không gian
  function buildHeart3D() {
    if (!dom.heart3dInner || !dom.canvasContainer) return;
    dom.heart3dInner.innerHTML = '';

    const rect = dom.canvasContainer.getBoundingClientRect();
    const scale = Math.min(rect.width * 0.46, rect.height * 0.49);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2 - 6;

    // Kích thước ô ảnh lớn, rõ nét
    const tileW = Math.max(58, Math.min(115, scale * 0.42));
    const tileH = tileW;

    if (!currentHeartPhotos || currentHeartPhotos.length === 0) {
      currentHeartPhotos = selectPhotosForHeart(HEART_LAYOUT.length);
    }

    const fallbacks = window.FALLBACK_PLACEHOLDERS || [];

    HEART_LAYOUT.forEach((layout, idx) => {
      const posX = centerX + layout.x * scale - tileW / 2;
      const posY = centerY + layout.y * scale - tileH / 2;
      const posZ = layout.z || 0;
      const rx = layout.rx || 0;
      const ry = layout.ry || 0;

      const card = document.createElement('div');
      card.className = 'heart-card-3d';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Xem ảnh kỷ niệm ${idx + 1}`);
      card.dataset.index = idx;

      card.style.width = `${tileW.toFixed(1)}px`;
      card.style.height = `${tileH.toFixed(1)}px`;
      card.style.setProperty('--tx', `${posX.toFixed(1)}px`);
      card.style.setProperty('--ty', `${posY.toFixed(1)}px`);
      card.style.setProperty('--tz', `${posZ}px`);
      card.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, ${posZ}px) rotateX(${rx}deg) rotateY(${ry}deg)`;

      const photoItem = currentHeartPhotos[idx];
      if (photoItem && (photoItem.thumbnailPath || photoItem.src || photoItem.originalPath)) {
        const img = document.createElement('img');
        img.src = photoItem.thumbnailPath || photoItem.src || photoItem.originalPath;
        img.alt = `Kỷ niệm Moon ${idx + 1}`;
        img.loading = 'eager';
        card.appendChild(img);
      } else {
        const fb = fallbacks[idx % fallbacks.length] || { icon: '🌸', title: 'Moon' };
        const fbWrap = document.createElement('div');
        fbWrap.className = 'fallback-tile-wrap';
        fbWrap.innerHTML = `<span class="fallback-icon">${fb.icon}</span><span class="fallback-title">${fb.title}</span>`;
        card.appendChild(fbWrap);
      }

      const glow = document.createElement('div');
      glow.className = 'card-glow-overlay';
      card.appendChild(glow);

      const zoomBadge = document.createElement('div');
      zoomBadge.className = 'card-zoom-badge';
      zoomBadge.setAttribute('aria-hidden', 'true');
      zoomBadge.textContent = '🔍';
      card.appendChild(zoomBadge);

      // Nhấn vào ảnh mở Lightbox Modal
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(idx);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });

      dom.heart3dInner.appendChild(card);
    });

    state.isShattering = false;
  }

  // Khôi phục trạng thái nguyên vẹn của trái tim 3D (khi Moon nhấn "Xem lại trái tim")
  function reset3DHeart() {
    state.isShattering = false;
    if (!dom.heart3dInner) return;

    const cards = dom.heart3dInner.querySelectorAll('.heart-card-3d');
    cards.forEach((card, idx) => {
      const layout = HEART_LAYOUT[idx] || { rx: 0, ry: 0 };
      const tx = card.style.getPropertyValue('--tx');
      const ty = card.style.getPropertyValue('--ty');
      const tz = card.style.getPropertyValue('--tz');

      card.style.transition = 'transform 0.85s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-in';
      card.style.transform = `translate3d(${tx}, ${ty}, ${tz}) rotateX(${layout.rx || 0}deg) rotateY(${layout.ry || 0}deg)`;
      card.style.opacity = '1';
    });

    startGalaxy();
  }

  /* ==========================================================================
     11. KÍCH HOẠT HIỆU ỨNG VỠ NỔ 3D (SHATTER EXPLOSION)
     ========================================================================== */
  function triggerHeartShatter() {
    if (state.isShattering) return;
    state.isShattering = true;
    stopGalaxy();

    // Rung nhẹ điện thoại nếu hỗ trợ
    if (navigator.vibrate) {
      try { navigator.vibrate([40, 60, 90]); } catch (e) { /* ignore */ }
    }

    // Nếu người dùng chọn giảm chuyển động, chuyển màn hình ngay
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => {
        renderCardScreen();
        showScreen('card');
      }, 300);
      return;
    }

    const cards = dom.heart3dInner ? dom.heart3dInner.querySelectorAll('.heart-card-3d') : [];
    const rect = dom.canvasContainer.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Các thẻ ảnh bay vút ra không gian 3D
    cards.forEach(card => {
      const tx = parseFloat(card.style.getPropertyValue('--tx')) || centerX;
      const ty = parseFloat(card.style.getPropertyValue('--ty')) || centerY;
      const dx = (tx + card.offsetWidth / 2) - centerX;
      const dy = (ty + card.offsetHeight / 2) - centerY;
      const angle = Math.atan2(dy, dx);
      const blastDist = Math.random() * 300 + 240;

      const targetX = dx * 1.6 + Math.cos(angle) * blastDist;
      const targetY = dy * 1.6 + Math.sin(angle) * blastDist + (Math.random() * 120 - 60);
      const targetZ = (Math.random() - 0.4) * 500;
      const rotX = (Math.random() - 0.5) * 850;
      const rotY = (Math.random() - 0.5) * 850;
      const rotZ = (Math.random() - 0.5) * 650;

      card.style.transition = 'transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.75s ease-out';
      card.style.transform = `translate3d(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px, ${targetZ.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(0.2)`;
      card.style.opacity = '0';
    });

    // Bắn pháo hoa hạt trên Canvas
    launchCanvasShatterBurst(rect.width, rect.height);

    // Chuyển sang màn hình thiệp sau khi hiệu ứng hoàn tất
    setTimeout(() => {
      renderCardScreen();
      showScreen('card');
    }, 900);
  }

  function launchCanvasShatterBurst(w, h) {
    const canvas = dom.heartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cX = canvas.width / 2;
    const cY = canvas.height / 2;

    shatterParticles = [];
    const SPARKLE_COUNT = 65;
    const emojis = ['💖', '✨', '🌸', '🌷', '🤍', '⭐', '💫', '🎉'];

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 11 + 4) * dpr;
      shatterParticles.push({
        emoji: emojis[i % emojis.length],
        x: cX,
        y: cY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 4 + 2) * dpr,
        size: (Math.random() * 18 + 14) * dpr,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        alpha: 1
      });
    }

    const startTime = performance.now();
    const DURATION = 950;

    function animateShatter(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shatterParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3 * dpr;
        p.rot += p.vRot;
        p.alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px "Quicksand", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      if (progress < 1) {
        shatterAnimId = requestAnimationFrame(animateShatter);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    shatterAnimId = requestAnimationFrame(animateShatter);
  }

  /* ==========================================================================
     12. XEM CHI TIẾT ẢNH (LIGHTBOX MODAL)
     ========================================================================== */
  function openLightbox(index) {
    if (!dom.photoLightbox || !currentHeartPhotos || currentHeartPhotos.length === 0) return;
    if (index < 0 || index >= currentHeartPhotos.length) return;

    state.currentLightboxIndex = index;
    const item = currentHeartPhotos[index];
    if (!item) return;

    // Ưu tiên hiển thị ảnh gốc chất lượng cao
    const fullSrc = item.originalPath || item.src || item.thumbnailPath;

    if (dom.lightboxLoader) dom.lightboxLoader.classList.remove('hidden');
    if (dom.lightboxImg) dom.lightboxImg.style.opacity = '0.3';

    const tempImg = new Image();
    tempImg.onload = () => {
      if (dom.lightboxImg) {
        dom.lightboxImg.src = fullSrc;
        dom.lightboxImg.style.opacity = '1';
      }
      if (dom.lightboxLoader) dom.lightboxLoader.classList.add('hidden');
    };
    tempImg.onerror = () => {
      if (dom.lightboxImg) {
        dom.lightboxImg.src = item.thumbnailPath || item.src;
        dom.lightboxImg.style.opacity = '1';
      }
      if (dom.lightboxLoader) dom.lightboxLoader.classList.add('hidden');
    };
    tempImg.src = fullSrc;

    if (dom.lightboxCounter) {
      dom.lightboxCounter.textContent = `${index + 1} / ${currentHeartPhotos.length}`;
    }
    if (dom.lightboxCaption) {
      dom.lightboxCaption.textContent = item.filename ? `Kỷ niệm: ${item.filename}` : 'Khoảnh khắc cùng Moon 🌸';
    }

    dom.photoLightbox.classList.remove('hidden');
    document.body.classList.add('modal-open');

    if (dom.lightboxBtnClose) dom.lightboxBtnClose.focus();
  }

  function closeLightbox() {
    if (!dom.photoLightbox) return;
    dom.photoLightbox.classList.add('hidden');
    document.body.classList.remove('modal-open');

    // Trả lại focus cho thẻ ảnh đang chọn
    if (dom.heart3dInner) {
      const activeCard = dom.heart3dInner.querySelector(`[data-index="${state.currentLightboxIndex}"]`);
      if (activeCard) activeCard.focus();
    }
  }

  function nextLightboxPhoto() {
    if (!currentHeartPhotos || currentHeartPhotos.length === 0) return;
    openLightbox((state.currentLightboxIndex + 1) % currentHeartPhotos.length);
  }

  function prevLightboxPhoto() {
    if (!currentHeartPhotos || currentHeartPhotos.length === 0) return;
    openLightbox((state.currentLightboxIndex - 1 + currentHeartPhotos.length) % currentHeartPhotos.length);
  }

  /* ==========================================================================
     13. MÀN HÌNH THIỆP CHÚC MỪNG 20/10
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
     14. ĐĂNG KÝ SỰ KIỆN TƯƠNG TÁC (EVENT LISTENERS)
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

    // Dedicated Gift Shatter Button (Tách biệt hoàn toàn việc mở quà với xem ảnh)
    if (dom.btnShatterGift) {
      dom.btnShatterGift.addEventListener('click', triggerHeartShatter);
    }

    // Hiệu ứng tương tác nghiêng 3D theo con trỏ chuột / chạm ngón tay
    if (dom.canvasContainer && dom.heart3dStage) {
      const handleTilt = (clientX, clientY) => {
        if (state.currentScreen !== 'heart' || state.isShattering) return;
        const rect = dom.canvasContainer.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        const rotateX = -(y / (rect.height / 2)) * 12;
        const rotateY = (x / (rect.width / 2)) * 14;
        dom.heart3dStage.style.transform = `rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg)`;
      };

      dom.canvasContainer.addEventListener('mousemove', (e) => {
        handleTilt(e.clientX, e.clientY);
      });
      dom.canvasContainer.addEventListener('mouseleave', () => {
        dom.heart3dStage.style.transform = '';
      });
      dom.canvasContainer.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          handleTilt(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      dom.canvasContainer.addEventListener('touchend', () => {
        dom.heart3dStage.style.transform = '';
      }, { passive: true });
    }

    // Lightbox modal controls
    if (dom.lightboxBtnClose) {
      dom.lightboxBtnClose.addEventListener('click', closeLightbox);
    }
    if (dom.lightboxBackdrop) {
      dom.lightboxBackdrop.addEventListener('click', closeLightbox);
    }
    if (dom.lightboxBtnNext) {
      dom.lightboxBtnNext.addEventListener('click', nextLightboxPhoto);
    }
    if (dom.lightboxBtnPrev) {
      dom.lightboxBtnPrev.addEventListener('click', prevLightboxPhoto);
    }

    // Keyboard navigation cho Lightbox (Esc, ArrowLeft, ArrowRight)
    window.addEventListener('keydown', (e) => {
      if (!dom.photoLightbox || dom.photoLightbox.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextLightboxPhoto();
      else if (e.key === 'ArrowLeft') prevLightboxPhoto();
    });

    // Touch swipe navigation cho Lightbox trên mobile
    if (dom.photoLightbox) {
      let touchStartX = 0;
      let touchStartY = 0;
      dom.photoLightbox.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      dom.photoLightbox.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
            if (deltaX < 0) nextLightboxPhoto();
            else prevLightboxPhoto();
          }
        }
      }, { passive: true });
    }

    // Card Screen actions
    dom.btnReplayHeart.addEventListener('click', () => {
      showScreen('heart');
      reset3DHeart();
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
        buildHeart3D();
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
