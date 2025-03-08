const styleElement = document.createElement("style");
document.head.appendChild(styleElement);
const styleSheet = styleElement.sheet;

// CSS cho hiệu ứng paper line
styleSheet.insertRule(":root { --line-color: 180 100 255; }", 0); // Màu tím neon làm mặc định
styleSheet.insertRule(
	".paper-line { position: absolute; width: 2px; height: 20px; background: rgb(var(--line-color)); transform-origin: center; pointer-events: none; opacity: 0; animation-fill-mode: forwards; }",
	1
);
styleSheet.insertRule(
	"@keyframes draw-1 { 0% { transform: translate(0px, 0px) rotate(0deg); height: 0; opacity: 1; } 50% { transform: translate(10px, -10px) rotate(45deg); height: 25px; opacity: 1; } 100% { transform: translate(15px, 30px) rotate(90deg); height: 0; opacity: 0; } }",
	2
);
styleSheet.insertRule(
	"@keyframes draw-2 { 0% { transform: translate(0px, 0px) rotate(0deg); height: 0; opacity: 1; } 50% { transform: translate(-15px, -5px) rotate(-30deg); height: 20px; opacity: 1; } 100% { transform: translate(-20px, 25px) rotate(-60deg); height: 0; opacity: 0; } }",
	3
);
styleSheet.insertRule(
	"@keyframes draw-3 { 0% { transform: translate(0px, 0px) rotate(0deg); height: 0; opacity: 1; } 50% { transform: translate(5px, 10px) rotate(60deg); height: 30px; opacity: 1; } 100% { transform: translate(10px, 40px) rotate(120deg); height: 0; opacity: 0; } }",
	4
);

let start = new Date().getTime();
const originPosition = { x: 0, y: 0 };
const last = {
	lineTimestamp: start,
	linePosition: originPosition,
	mousePosition: originPosition,
};
const config = {
	lineAnimationDuration: 700, // Nhanh hơn để giống nét vẽ
	minimumTimeBetweenLines: 150,
	minimumDistanceBetweenLines: 50,
	colors: ["180 100 255", "50 255 180", "255 150 200"], // Tím, xanh ngọc, hồng phấn
	animations: ["draw-1", "draw-2", "draw-3"],
};

let count = 0;

// Hàm tiện ích
const rand = (t, e) => Math.floor(Math.random() * (e - t + 1)) + t;
const selectRandom = (t) => t[rand(0, t.length - 1)];
const withUnit = (t, e) => `${t}${e}`;
const px = (t) => withUnit(t, "px");
const ms = (t) => withUnit(t, "ms");
const calcDistance = (t, e) => {
	let a = e.x - t.x,
		o = e.y - t.y;
	return Math.sqrt(Math.pow(a, 2) + Math.pow(o, 2));
};
const calcElapsedTime = (t, e) => e - t;
const appendElement = (t) => document.body.appendChild(t);
const removeElement = (t, e) =>
	setTimeout(() => document.body.removeChild(t), e);

// Tạo đường nét paper line
const createLine = (t) => {
	let e = document.createElement("div");
	let a = selectRandom(config.colors);
	e.className = "paper-line";
	e.style.left = px(t.x - 1); // Căn giữa đường nét
	e.style.top = px(t.y - 10); // Điểm bắt đầu từ giữa
	e.style.background = `rgb(${a})`; // Áp dụng màu
	e.style.animationName = config.animations[count++ % 3];
	e.style.animationDuration = ms(config.lineAnimationDuration);
	appendElement(e);
	removeElement(e, config.lineAnimationDuration);
};

// Cập nhật vị trí
const updateLastLine = (t) => {
	last.lineTimestamp = new Date().getTime();
	last.linePosition = t;
};

const updateLastMousePosition = (t) => (last.mousePosition = t);

const adjustLastMousePosition = (t) => {
	if (last.mousePosition.x === 0 && last.mousePosition.y === 0) {
		last.mousePosition = t;
	}
};

// Xử lý di chuyển chuột với scroll
const handleOnMove = (e) => {
	const scrollX = window.scrollX || window.pageXOffset;
	const scrollY = window.scrollY || window.pageYOffset;
	const mouseX = e.clientX + scrollX;
	const mouseY = e.clientY + scrollY;

	let position = { x: mouseX, y: mouseY };

	adjustLastMousePosition(position);

	let now = new Date().getTime();
	let distanceOk =
		calcDistance(last.linePosition, position) >=
		config.minimumDistanceBetweenLines;
	let timeOk =
		calcElapsedTime(last.lineTimestamp, now) >
		config.minimumTimeBetweenLines;

	if (distanceOk || timeOk) {
		createLine(position);
		updateLastLine(position);
	}

	updateLastMousePosition(position);
};

// Thêm sự kiện
window.onmousemove = (e) => handleOnMove(e);
window.ontouchmove = (e) => handleOnMove(e.touches[0]);
document.body.onmouseleave = () => updateLastMousePosition(originPosition);
