// Thiết lập font mặc định cho trang
document.body.style.fontFamily = "Arial, sans-serif";

// Thêm font "Comic Neue" từ Google Fonts để trông dễ thương
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Tạo tiêu đề (có thể bỏ nếu không cần)
const title = document.createElement("h1");
title.textContent = "Tốc độ FPS";
document.body.appendChild(title);

// Tạo ô hiển thị FPS với phong cách Glassmorphism
const fpsDisplay = document.createElement("div");
fpsDisplay.id = "fps"; // Đặt ID để dễ nhận diện
fpsDisplay.textContent = "FPS: 0"; // Giá trị ban đầu của FPS
fpsDisplay.style.fontFamily = "'Comic Neue', cursive"; // Font chữ vui nhộn
fpsDisplay.style.fontSize = "16px"; // Kích thước chữ nhỏ gọn
fpsDisplay.style.color = "#ff6f91"; // Màu hồng phấn nổi bật
fpsDisplay.style.position = "fixed"; // Cố định vị trí trên màn hình
fpsDisplay.style.top = "40px"; // Cách mép trên 10px
fpsDisplay.style.right = "10px"; // Cách mép phải 10px
fpsDisplay.style.backgroundColor = "rgba(255, 255, 255, 0.1)"; // Nền kính mờ (trắng trong suốt)
fpsDisplay.style.backdropFilter = "blur(8px)"; // Hiệu ứng mờ phía sau
fpsDisplay.style.padding = "3px 8px"; // Khoảng đệm nhỏ gọn
fpsDisplay.style.borderRadius = "12px"; // Bo góc tròn cho mềm mại
fpsDisplay.style.border = "1px solid rgba(255, 255, 255, 0.2)"; // Viền kính mờ
fpsDisplay.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Bóng đổ nhẹ
fpsDisplay.style.zIndex = "99999"; // Đặt lên trên cùng mọi thứ
document.body.appendChild(fpsDisplay); // Thêm ô FPS vào trang

// Biến để tính FPS
let lastTime = performance.now(); // Thời điểm cuối cùng (ms)
let frameCount = 0; // Đếm số khung hình
let fps = 0; // Giá trị FPS

// Hàm cập nhật FPS
function updateFPS(currentTime) {
  frameCount++; // Tăng số khung hình lên 1

  // Tính thời gian trôi qua kể từ lần cập nhật trước
  const deltaTime = currentTime - lastTime;

  // Cập nhật FPS mỗi 100ms
  if (deltaTime >= 100) {
    fps = Math.round((frameCount * 1000) / deltaTime); // Tính FPS (khung/giây)
    fpsDisplay.textContent = `FPS: ${fps}`; // Hiển thị FPS mới

    // Đặt lại để tính cho 10ms tiếp theo
    frameCount = 0;
    lastTime = currentTime;
  }

  // Tiếp tục chạy vòng lặp
  requestAnimationFrame(updateFPS);
}

// Bắt đầu tính FPS
requestAnimationFrame(updateFPS);
