document.addEventListener("DOMContentLoaded", () => {
  // Cookie Management
  const cookieManager = {
    setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    },

    getCookie(name) {
      return document.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
      }, {})[name];
    },
  };

  // Theme Management
  const themeManager = {
    sunIcon: $(".ri-sun-line"),
    moonIcon: $(".ri-moon-clear-line"),

    setTheme(theme) {
      const html = $("html");
      if (theme === "light") {
        html.removeClass("dark").addClass("light");
        this.moonIcon.slideUp(300, () => this.sunIcon.slideDown(300));
        cookieManager.setCookie("theme", "light", 365);
      } else {
        html.removeClass("light").addClass("dark");
        this.sunIcon.slideUp(300, () => this.moonIcon.slideDown(300));
        cookieManager.setCookie("theme", "dark", 365);
      }
    },

    init() {
      const savedTheme = cookieManager.getCookie("theme");
      this.setTheme(savedTheme === "light" ? "light" : "dark");
      $("body").on("click", ".change-theme", () => {
        const isDark = $("html").hasClass("dark");
        this.setTheme(isDark ? "light" : "dark");
      });
    },
  };

  // Random Utilities
  const randomUtils = {
    generateMathString() {
      const num1 = Math.floor(100 * Math.random());
      const num2 = Math.floor(100 * Math.random());
      const operators = ["+", "-", "*", "/"];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      let result;
      switch (operator) {
        case "+":
          result = num1 + num2;
          break;
        case "-":
          result = num1 - num2;
          break;
        case "*":
          result = num1 * num2;
          break;
        case "/":
          result = num2 !== 0 ? (num1 / num2).toFixed(2) : num1;
      }
      return `${num1 < 10 ? "0" + num1 : num1}.${
        num2 < 10 ? "0" + num2 : num2
      }.${result < 10 ? "0" + result : result}`;
    },

    randomRange(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
  };

  // Toast Management
  const toastManager = {
    init() {
      if (cookieManager.getCookie("toast") === "close")
        $("#toast-prompt").hide();
      $("body").on("click", ".close-btn", () => {
        $("#toast-prompt").slideUp("fast", () => {
          cookieManager.setCookie("toast", "close", 10 / 1440); // 10 minutes
        });
        FuiToast.success("Không hiển thị lại trong 10 phút.");
      });
    },
  };

  // Music Player
  const musicPlayer = {
    playYouTubeAudio(url) {
      console.log("Bắt đầu xử lý link YouTube:", url);

      // Gọi API để lấy audio từ link YouTube
      fetch(
        `https://api.zm.io.vn/v1/social/autolink?url=${encodeURIComponent(
          url,
        )}&apikey=Gnacr`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "API request failed with status: " + response.status,
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log("Dữ liệu từ API:", data);

          // Kiểm tra nếu có lỗi trong response
          if (data.error) {
            throw new Error("API returned an error: " + data.error);
          }

          // Tìm formatId 251 trong medias
          const audioFormat = data.medias.find(
            (media) => media.formatId === 251,
          );
          if (!audioFormat) {
            throw new Error(
              "Không tìm thấy định dạng audio 251 (opus 146kb/s)",
            );
          }

          console.log("Định dạng audio 251 tìm thấy:", audioFormat);

          const audioUrl = audioFormat.url;
          console.log("URL audio sẽ phát:", audioUrl);

          const audio = new Audio(audioUrl);

          const playPromise = new Promise((resolve, reject) => {
            audio
              .play()
              .then(() => {
                console.log("Audio bắt đầu phát thành công");
                resolve(data);
              })
              .catch((error) => {
                console.error("Lỗi khi phát audio:", error);
                reject("Không thể phát audio: " + error.message);
              });

            audio.addEventListener("ended", () => {
              console.log("Audio đã kết thúc phát");
              resolve("Audio đã kết thúc.");
            });
          });

          FuiToast.promise(
            playPromise,
            {
              loading: "Đang xử lý và tải audio...",
              success: () => `Đang phát: ${data.title || "Audio từ YouTube"}`,
              error: "Có lỗi khi phát audio!",
            },
            { isClose: true },
          );
        })
        .catch((error) => {
          console.error("Lỗi tổng thể khi xử lý link YouTube:", error);
          FuiToast.error(`Có lỗi khi xử lý link YouTube: ${error.message}`);
        });
    },

    showYouTubeInputPopup() {
      console.log("Hiển thị popup nhập link YouTube");

      const popup = $(`
        <div class="youtube-popup">
            <h3>Nhập link YouTube</h3>
            <input type="text" class="youtube-input" placeholder="Dán link YouTube vào đây">
            <div class="button-container">
                <button class="cancel-btn">Hủy</button>
                <button class="submit-btn">Phát</button>
            </div>
        </div>
    `);

      const overlay = $('<div class="popup-overlay"></div>');
      $("body").append(overlay).append(popup);

      popup.find(".cancel-btn").on("click", () => {
        console.log("Người dùng nhấn Hủy");
        popup.remove();
        overlay.remove();
      });

      popup.find(".submit-btn").on("click", () => {
        const url = popup.find(".youtube-input").val().trim();
        console.log("Link YouTube được nhập:", url);
        if (url) {
          this.playYouTubeAudio(url);
          popup.remove();
          overlay.remove();
          $("#toast-prompt").slideUp("fast");
        } else {
          console.log("Không có link YouTube được nhập");
          FuiToast.error("Vui lòng nhập link YouTube!");
        }
      });

      popup.find(".youtube-input").focus();
    },

    init() {
      $("body").on("click", ".confirm-btn", () => {
        console.log("Nút Đồng ý được nhấn");
        this.showYouTubeInputPopup();
      });
    },
  };

  // Lock Screen Management
  const lockScreen = {
    init() {
      const version = randomUtils.generateMathString();
      const title = $("html").attr("data-title-loader") || "Màn Hình Khóa";
      $("body").append(`
            <div id="fui-toast"></div>
            <div class="td-lock-screen">
                <section class="td-welcome">
                    <div class="medias">
                        <video class="pc item_video" autoplay loop muted playsinline>
                            <source src="./assets/video/pc.mp4?v=${version}" type="video/mp4">
                        </video>
                        <video class="mobile item_video" autoplay loop muted playsinline>
                            <source src="./assets/video/mb.mp4?v=${version}" type="video/mp4">
                        </video>
                        <div class="date"></div>
                    </div>
                    <div class="infos">
                        <div class="logo-web-title">
                            <img class="logo-ws" src="./assets/img/iconLockScreen.jpg" alt="Vương Thanh Diệu">
                            <span class="web-title">${title}</span>
                        </div>
                        <span class="web_desc text-center"></span> <!-- Đảm bảo phần tử này tồn tại -->
                        <div><i class="ri-arrow-down-line close-lockscreen"></i></div>
                    </div>
                </section>
            </div>
        `);

      $(".td-lock-screen").click(() => {
        $(".td-welcome").slideUp("slow");
        $(".td-lock-screen")
          .animate({ opacity: 0 }, "slow")
          .css("pointer-events", "none");
      });

      $(document).on("swiperight", () => {
        $(".td-welcome").slideDown("slow");
        $(".td-lock-screen")
          .animate({ opacity: 1 }, "fast")
          .css("pointer-events", "auto");
      });

      $(document).on("swipeleft", () => {
        $(".td-welcome").slideUp("slow");
        $(".td-lock-screen")
          .animate({ opacity: 0 }, "slow")
          .css("pointer-events", "none");
      });

      $(document).on("visibilitychange", () => {
        if (!document.hidden) {
          setTimeout(() => {
            const scrollY = $(window).scrollTop();
            const windowHeight = $(window).height();
            const documentHeight = $(document).height();
            if (scrollY === 0) {
              $(".td-welcome").slideDown("slow");
              $(".td-lock-screen")
                .animate({ opacity: 1 }, "fast")
                .css("pointer-events", "auto");
            }
            if ((scrollY / (documentHeight - windowHeight)) * 100 === 100) {
              $(".td-welcome").slideUp("slow");
              $(".td-lock-screen")
                .animate({ opacity: 0 }, "slow")
                .css("pointer-events", "none");
            }
          }, 200);
        }
      });
    },
  };

  // Scroll To Top
  const scrollToTop = {
    init() {
      const button = $("#croll-to-top");
      const percentageText = button.find(".text");
      const icon = button.find("i");

      window.scrollY === 0 && button.css("display", "none");
      window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const totalHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const percentage =
          totalHeight > 0 ? Math.round((scrollY / totalHeight) * 100) : 0;
        percentageText.text(percentage);
        button.css("display", scrollY > 0 ? "block" : "none");
      });

      button.on({
        mouseenter: () => {
          percentageText.hide();
          icon.show();
        },
        mouseleave: () => {
          percentageText.show();
          icon.hide();
        },
        click: () => $("html, body").animate({ scrollTop: 0 }, "fast"),
      });
    },
  };

  // Magic Star Animation
  const starAnimation = {
    animateStar(star) {
      star.style.setProperty(
        "--star-left",
        `${randomUtils.randomRange(-10, 100)}%`,
      );
      star.style.setProperty(
        "--star-top",
        `${randomUtils.randomRange(-40, 80)}%`,
      );
      star.style.animation = "none";
      star.offsetHeight; // Trigger reflow
      star.style.animation = "";
    },

    init() {
      const stars = document.getElementsByClassName("magic-star");
      let delay = 0;
      for (const star of stars) {
        setTimeout(
          () => {
            this.animateStar(star);
            setInterval(() => this.animateStar(star), 1000);
          },
          delay++ * (1000 / 3),
        );
      }
    },
  };

  // Click Effect
  const clickEffect = {
    messages: [
      "♥️ Năm mới vui vẻ",
      "❤️ Cung hỉ phát tài",
      "💛 Tiền vô như nước",
      "💚 Vợ đẹp con ngoan",
      "💙 Tài lộc vào nhà",
      "💜 Phúc thọ vô biên",
      "🖤 Sống khoẻ đón xuân",
      "💖 Phú quý cát tường",
      "💝 Đắc lộc toàn gia",
      "💙 Hạnh phúc mạnh mang",
      "❤️ Vạn sự thành công",
      "💚 Mã đáo thành công",
      "💙 Tiền vô tỷ tỷ",
      "💜 Tài vạn công danh",
      "💛 Hạnh phúc gia an",
      "💖 Sức khoẻ như voi",
      "💛 Thông minh vượt trội",
      "💖 Phúc lộc trong tay",
      "💚 Gia chủ phát tài",
      "💚 Vạn sự như ý",
      "💚 Túi tiền nặng ký",
      "🖤 Làm ăn phát đạt",
      "💛 Vàng bạc cao sang",
      "💙 Sức khỏe an nhàn",
      "💜 Công danh hết ý",
      "🖤 Cung hỷ cung hỷ",
      "💝 Hạnh phúc triền miên",
      "🖤 Sung sướng như tiên",
    ],
    colors: [
      "#ff6651",
      "#42a5f5",
      "#66bb6a",
      "#ab47bc",
      "#ffa726",
      "#ec407a",
      "#26c6da",
      "#78909c",
      "#ffca28",
      "#5c6bc0",
      "#8d6e63",
      "#26a69a",
    ],

    init() {
      let messageIndex = 0;
      $("body").click((event) => {
        const text = $(`<span style='font-family:sans-serif;'>`).text(
          this.messages[messageIndex],
        );
        const color =
          this.colors[Math.floor(Math.random() * this.colors.length)];
        messageIndex = (messageIndex + 1) % this.messages.length;

        text.css({
          "z-index": randomUtils.randomRange(9999, 9999999),
          top: event.pageY - 20,
          left: event.pageX,
          position: "absolute",
          "font-weight": "bold",
          color,
        });

        $("body").append(text);
        text.animate({ top: event.pageY - 180, opacity: 0 }, 1500, () =>
          text.remove(),
        );
      });
    },
  };

  // Clock Class
  class Clock {
    constructor(selector) {
      this.element = $(selector);
      this.updateTime();
      setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      this.element.text(time);
    }
  }

  // Quote Manager
  const quoteManager = {
    fetchQuote() {
      $.ajax({
        url: "https://api.thanhdieu.com/cham-ngon",
        type: "get",
        dataType: "json",
        success: (data) =>
          $("#cham-ngon").fadeOut(300).text(data.msg).fadeIn(300),
        error: (err) => console.error("Error fetching quote:", err),
      });
    },

    init() {
      this.fetchQuote();
      setInterval(() => this.fetchQuote(), 5321);
    },
  };

  // Greeting Manager
  const greetingManager = {
    element: $("#waiting-loader"),
    getGreeting() {
      const hour = new Date().getHours();
      const greetings = {
        morning: [
          "Chúc các bạn có một buổi sáng vui vẻ, và may mắn 😇",
          "Sáng nay thật đẹp, hãy bắt đầu một ngày mới tràn đầy năng lượng nhé! ☀️",
          "Chào buổi sáng, đừng quên ăn sáng để có năng lượng cho cả ngày! 🍳",
          "Khi ông Mặt trời thức dậy, mẹ lên rẫy, em đến trường rồi mà sao mày vẫn còn ngủ hả, dậy mà đón lấy ánh nắng tích cực, khởi đầu ngày mới tràn đầy năng lượng đi. 🌟",
        ],
        noon: [
          "Buổi trưa này, đừng quên ăn uống đầy đủ đấy nhé 🍔",
          "Trưa nay hơi nóng, nếu có cần mua gì thì nhắn anh mua giúp cho nhé 🌞",
          "Chúc bạn có một buổi nghỉ trưa tràn đầy sức khoẻ! 💪",
        ],
        afternoon: [
          "Chúc bạn có một buổi chiều thư giãn sau những giờ làm việc căng thẳng ☕",
          "Chúc buổi chiều tràn đầy năng lượng tích cực, để tối nay có thể cày phim thả ga! 🎬",
          "Cả ngày hôm nay tôi không thể ngừng nghĩ về bạn, chúc bạn một buổi chiều vui vẻ! 🌅",
        ],
        evening: [
          "Chúc các bạn có một buổi tối tràn đầy hạnh phúc! ✨",
          "Buổi tối là lúc để thư giãn và tận hưởng cuộc sống 🌙",
          "Chào buổi tối, đừng quên dành thời gian cho gia đình nhé ❤️",
        ],
        night: [
          "Onichan~ sao giờ này chưa ngủ nữa ୧(๑•̀⌄•́๑)૭",
          "Khuya rồi, hãy đi ngủ để mơ những giấc mơ thật đẹp nhé 🌌",
          "Đêm muộn thế này, đừng quên chăm sóc sức khỏe nha 🌙",
        ],
      };
      let selectedGreetings;
      if (hour >= 3 && hour <= 10) selectedGreetings = greetings.morning;
      else if (hour >= 11 && hour <= 15) selectedGreetings = greetings.noon;
      else if (hour >= 16 && hour <= 18)
        selectedGreetings = greetings.afternoon;
      else if (hour >= 19 && hour <= 21) selectedGreetings = greetings.evening;
      else selectedGreetings = greetings.night;
      return selectedGreetings[
        Math.floor(Math.random() * selectedGreetings.length)
      ];
    },

    init() {
      setTimeout(() => this.element.text(this.getGreeting()), 111);
    },
  };

  // Description Manager
  const descriptionManager = {
    descriptions: [
      "Gọi em là công chúa vì hoàng tử đang đứng chờ em nè!",
      "Chưa được sự cho phép mà đã tự ý thích em, anh xin lỗi nhé công chúa!",
      "Em nhìn rất giống người họ hàng của anh, đó chính là con dâu của mẹ anh!",
      "Trái Đất quay quanh Mặt Trời, còn em thì quay mãi trong tâm trí anh!",
      "Vector chỉ có một chiều, anh dân chuyên toán chỉ yêu một người.",
      "Anh béo thế này là bởi vì trong lòng anh có em nữa.",
      "Nghe đây! Em đã bị bắt vì tội quá xinh đẹp.",
      "Anh chỉ muốn bên cạnh em hai lần đó là bây giờ và mãi mãi.",
      "Bao nhiêu cân thính cho vừa, bao nhiêu cân bả mới lừa được em?",
      "Vũ trụ của người ta là màu đen huyền bí, còn vũ trụ của anh bé tí, thu nhỏ lại là em.",
      "Anh rất yêu thành phố này, không phải vì nó có gì, mà vì nó có em.",
      "Anh bận với tất cả mọi điều, nhưng vẫn luôn rảnh để nhớ đến em.",
      "Cành cây còn có lá. Chú cá vẫn đang bơi, sao em cứ mải chơi. Chẳng chịu yêu anh thế!",
      "Em nhà ở đâu thế? Cứ tới lui trong tim anh không biết đường về nhà à?",
      "Cuộc đời anh vốn là một đường thẳng, chỉ vì gặp em mà rẽ ngang.",
      "Với thế giới em chỉ là một người, nhưng với anh, em là cả thế giới.",
      "Em có thể đừng cười nữa được không, da anh đen hết rồi.",
      "Anh đây chẳng thích nhiều lời, nhìn em là biết cả đời của anh.",
      "Cảm lạnh có thể do gió, nhưng, cảm nắng thì chắc chắn do em.",
      "Trứng rán cần mỡ, bắp cần bơ, yêu không cần cớ, cần em cơ!",
      "Cafe đắng thêm đường sẽ ngọt, còn cuộc đời anh thêm em sẽ hạnh phúc.",
      "Giữa cuộc đời hàng ngàn cám dỗ, nhưng, anh vẫn chỉ cần bến đỗ là em.",
      "Có người rủ anh đi ăn tối, nhưng anh từ chối vì thực đơn không có em.",
      "Em có biết vì sao đầu tuần lại bắt đầu bằng thứ hai không, bởi vì em là thứ nhất!",
      "Oxy là nguồn sống của nhân loại, còn em chính là nguồn sống của anh.",
      "Em bị cận thị à? Nếu không tại sao không nhìn thấy anh thích em chứ?",
      "Hôm qua anh gặp ác mộng vì trong giấc mộng đó không có em.",
      "Uống nhầm một ánh mắt, cơn say theo cả đời, thương nhầm một nụ cười, cả một đời phiêu lãng.",
      "Dạo này em có thấy mỏi chân không, sao cứ đi mãi trong đầu anh thế?",
      "Hình như em thích trà sữa lắm phải không, anh cũng thích em như thế đấy.",
      "Nếu em là nước mắt thì anh sẽ không bao giờ khóc để lạc mất em đâu.",
      "Đôi mắt em còn xanh hơn cả Đại Tây Dương và anh thì bị lạc trên biển cả mất rồi.",
      "Nếu nụ hôn là những bông tuyết thì anh sẽ gửi đến em một cơn bão tuyết",
      "Phải chăng em là một ảo thuật gia, bởi mỗi khi anh nhìn em là mọi thứ xung quanh đều biến mất.",
      "Anh có thể chụp ảnh em được không, để chứng minh với lũ bạn rằng thiên thần là có thật.",
      "Anh có thể đi theo em được không, bởi anh được bố mẹ dạy rằng phải theo đuổi giấc mơ của mình.",
      "Nếu khi anh nghĩ đến em mà có một ngôi sao biến mất, vậy chắc cả bầu trời này không còn sao.",
    ],
    element: null,

    updateDescription() {
      if (!this.element || !this.element.length) {
        console.error("Phần tử .web_desc không tồn tại trong DOM!");
        return;
      }
      const text =
        this.descriptions[Math.floor(Math.random() * this.descriptions.length)];
      this.element.fadeOut(500, () => this.element.html(text).fadeIn(500));
    },

    init() {
      this.element = $(".web_desc.text-center");
      if (!this.element.length) {
        console.error(
          "Không tìm thấy phần tử .web_desc.text-center trong DOM khi khởi tạo!",
        );
        return;
      }
      this.updateDescription();
      setInterval(() => this.updateDescription(), 5000);
    },
  };

  // Loading Manager
  const loadingManager = {
    endLoading() {
      $("body").removeClass("loading");
      setTimeout(() => $(".td-loading-v2").fadeOut(1200), 1000);
      $("#loading-box").fadeOut("slow");
    },

    initLoading() {
      document.body.style.overflow = "";
      $("#loading-box").removeClass("loaded");
    },

    init() {
      $(window).on("load", () => this.endLoading());
      $(document).on("pjax:send", () => this.initLoading());
      $(document).on("pjax:complete", () => this.endLoading());

      const loadingInterval = setInterval(() => {
        const progress = $(".pace-progress");
        if (progress.length) {
          const percentage = progress.attr("data-progress-text");
          $("#loading-percentage").text(percentage);
          progress.css(
            "transform",
            `translate3d(${parseInt(percentage)}%, 0px, 0px)`,
          );
          if (percentage === "100%") {
            $(".pace-active").animate({ top: "-100px" }, "slow", function () {
              $(this).hide();
            });
            $("#loading-box").is(":visible")
              ? this.endLoading()
              : $(".td-loading-v2").fadeOut(1200);
            clearInterval(loadingInterval);
          }
        }
      }, 100);
    },
  };

  // Sakura Animation Classes (Moved up to avoid initialization error)
  class Sakura {
    constructor(x, y, scale, rotation, fn) {
      this.x = x;
      this.y = y;
      this.scale = scale;
      this.rotation = rotation;
      this.fn = fn;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(
        sakuraAnimation.image,
        0,
        0,
        30 * this.scale,
        30 * this.scale,
      );
      ctx.restore();
    }

    update() {
      this.x = this.fn.x(this.x, this.y);
      this.y = this.fn.y(this.y, this.y);
      this.rotation = this.fn.r(this.rotation);
      if (
        this.x > window.innerWidth ||
        this.x < 0 ||
        this.y > window.innerHeight ||
        this.y < 0
      ) {
        this.rotation = randomUtils.randomRange(0, 6);
        if (Math.random() > 0.4) {
          this.x = randomUtils.randomRange(0, window.innerWidth);
          this.y = 0;
        } else {
          this.x = window.innerWidth;
          this.y = randomUtils.randomRange(0, window.innerHeight);
        }
        this.scale = Math.random();
      }
    }
  }

  class SakuraList {
    constructor() {
      this.list = [];
    }

    push(sakura) {
      this.list.push(sakura);
    }
    update() {
      this.list.forEach((s) => s.update());
    }
    draw(ctx) {
      this.list.forEach((s) => s.draw(ctx));
    }
  }

  // Sakura Animation
  const sakuraAnimation = {
    canvas: null,
    ctx: null,
    animationFrame: null,
    sakuraList: new SakuraList(), // Now works because SakuraList is defined above
    image: new Image(),

    initCanvas() {
      this.canvas = document.createElement("canvas");
      this.canvas.height = window.innerHeight;
      this.canvas.width = window.innerWidth;
      this.canvas.style.cssText =
        "position: fixed; left: 0; top: 0; pointer-events: none; z-index: 8888;";
      this.canvas.id = "canvas_sakura";
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
    },

    start() {
      this.initCanvas();
      this.image.src = "//i.ibb.co/CpF2yzvf/thanhdieu.png";
      this.image.onload = () => {
        for (let i = 0; i < 10; i++) {
          const sakura = new Sakura(
            randomUtils.randomRange(0, window.innerWidth),
            randomUtils.randomRange(0, window.innerHeight),
            Math.random(),
            randomUtils.randomRange(0, 6),
            {
              x: (x, y) => x + 0.5 * (-0.5 + Math.random()) - 1.7,
              y: (x, y) => y + 1.5 + 0.7 * Math.random(),
              r: (r) => r + 0.03 * Math.random(),
            },
          );
          sakura.draw(this.ctx);
          this.sakuraList.push(sakura);
        }
        this.animate();
      };
    },

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.sakuraList.update();
      this.sakuraList.draw(this.ctx);
      this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    stop() {
      if (this.canvas) {
        this.canvas.parentNode.removeChild(this.canvas);
        cancelAnimationFrame(this.animationFrame);
      }
    },
  };

  // Copy to Clipboard
  const clipboardManager = {
    init() {
      $("body").on("click", "[data-ws-copy]", (e) => {
        e.preventDefault();
        const text = $(e.currentTarget).data("ws-copy");
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(text)
            .then(() => FuiToast.success("Đã sao chép vào bộ nhớ tạm!"))
            .catch((err) => FuiToast.error("Sao chép thất bại: " + err));
        } else {
          const temp = $("<textarea>").val(text).appendTo("body").select();
          try {
            document.execCommand("copy");
            FuiToast.success("Đã sao chép vào bộ nhớ tạm!");
          } catch (err) {
            FuiToast.error("Sao chép thất bại: " + err);
          }
          temp.remove();
        }
      });
    },
  };

  // Fancybox Initialization
  const fancyboxManager = {
    init() {
      if (
        typeof Fancybox !== "undefined" &&
        document.querySelector("[data-fancybox]")
      ) {
        Fancybox.bind("[data-fancybox]", {
          trapFocus: true,
          autoFocus: false,
          on: {
            init: (fancybox) =>
              fancybox.$container?.removeAttribute("aria-hidden"),
            closing: (fancybox) => {
              const trigger =
                fancybox.$trigger ||
                document.querySelector("[data-fancybox]:focus");
              (trigger || document.body).focus();
              fancybox.$container?.setAttribute("inert", "");
            },
            closed: (fancybox) => fancybox.$container?.removeAttribute("inert"),
          },
        });
      } else {
        console.error("Fancybox not loaded or no [data-fancybox] found");
      }
    },
  };

  // Initialize all modules
  themeManager.init();
  toastManager.init();
  musicPlayer.init();
  lockScreen.init();
  scrollToTop.init();
  starAnimation.init();
  clickEffect.init();
  quoteManager.init();
  greetingManager.init();
  descriptionManager.init();
  loadingManager.init();
  sakuraAnimation.start();
  clipboardManager.init();
  fancyboxManager.init();

  new Clock("#real-time");
  new Clock(".date");

  // Prevent context menu
  $(document).on("contextmenu", (e) => {
    console.log("Context menu triggered:", e.which);
    e.preventDefault();
  });

  // Console branding
  console.log(
    "%c WELCOME - %c THIS'S MY CONSOLE LOG",
    "color:#fff;background:linear-gradient(90deg,#448bff,#44e9ff);padding:5px 0;",
    "color:#000;background:linear-gradient(90deg,#44e9ff,#ffffff);padding:5px 10px 5px 0px;",
  );
});
