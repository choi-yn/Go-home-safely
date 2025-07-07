// 이미지 경로
const IMAGE_PATH = 'image/';
const SOUND_PATH = 'sound/';

// 캔버스 및 컨텍스트
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 오브젝트 이미지
const images = {
  safy: new Image(),
  kindergarden: new Image(),
  home: new Image(),
  viruses: [],
  additives: []
};
images.safy.src = IMAGE_PATH + 'safy_re.png';
images.kindergarden.src = IMAGE_PATH + 'kindergarden.png';
images.home.src = IMAGE_PATH + 'home.png';
for (let i = 1; i <= 7; i++) {
  const img = new Image();
  img.src = IMAGE_PATH + `virus${i}.png`;
  images.viruses.push(img);
}
for (let i = 1; i <= 2; i++) {
  const img = new Image();
  img.src = IMAGE_PATH + `additives${i}.png`;
  images.additives.push(img);
}

// 사운드
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');

// 게임 오브젝트 크기
const SAFY_SIZE = 60;
const VIRUS_SIZE = 50;
const ADDITIVE_SIZE = 50;
const KINDERGARDEN_SIZE = 80;
const HOME_SIZE = 80;

// 위치
const kindergardenPos = { x: 30, y: 30 };
const homePos = { x: 600 - HOME_SIZE - 30, y: canvas.height - HOME_SIZE - 30 };

// 세이피(플레이어)
let safy = {
  x: kindergardenPos.x + KINDERGARDEN_SIZE / 2 - SAFY_SIZE / 2 + 40,
  y: kindergardenPos.y + KINDERGARDEN_SIZE / 2 - SAFY_SIZE / 2,
  vx: 0,
  vy: 0
};

// 장애물(세균, 첨가물)
function randomPos(size) {
  // 유치원, 집과 겹치지 않게
  let x, y;
  do {
    x = Math.random() * (canvas.width - size);
    y = Math.random() * (canvas.height - size);
  } while (
    (x < kindergardenPos.x + KINDERGARDEN_SIZE && y < kindergardenPos.y + KINDERGARDEN_SIZE) ||
    (x + size > homePos.x && y + size > homePos.y)
  );
  return { x, y };
}

let viruses = Array.from({ length: 5 }, (_, i) => ({
  x: randomPos(VIRUS_SIZE).x,
  y: randomPos(VIRUS_SIZE).y,
  vx: (Math.random() - 0.5) * 1.5,
  vy: (Math.random() - 0.5) * 1.5,
  img: images.viruses[i % images.viruses.length]
}));

let additives = Array.from({ length: 2 }, (_, i) => ({
  x: randomPos(ADDITIVE_SIZE).x,
  y: randomPos(ADDITIVE_SIZE).y,
  vx: (Math.random() - 0.5) * 1.2,
  vy: (Math.random() - 0.5) * 1.2,
  img: images.additives[i % images.additives.length]
}));

// 자이로 센서(모바일)
window.addEventListener('deviceorientation', function(event) {
  // gamma: 좌우, beta: 앞뒤
  safy.vx = event.gamma * 0.2;
  safy.vy = event.beta * 0.2;
});

// PC 테스트용(키보드)
document.addEventListener('keydown', function(e) {
  const speed = 5;
  if (e.key === 'ArrowLeft') safy.x -= speed;
  if (e.key === 'ArrowRight') safy.x += speed;
  if (e.key === 'ArrowUp') safy.y -= speed;
  if (e.key === 'ArrowDown') safy.y += speed;
});

function resetSafy() {
  safy.x = kindergardenPos.x + KINDERGARDEN_SIZE / 2 - SAFY_SIZE / 2 + 40;
  safy.y = kindergardenPos.y + KINDERGARDEN_SIZE / 2 - SAFY_SIZE / 2;
  safy.vx = 0;
  safy.vy = 0;
}

function resetObstacles() {
  viruses.forEach(v => {
    const pos = randomPos(VIRUS_SIZE);
    v.x = pos.x;
    v.y = pos.y;
    v.vx = (Math.random() - 0.5) * 1.5;
    v.vy = (Math.random() - 0.5) * 1.5;
  });
  additives.forEach(a => {
    const pos = randomPos(ADDITIVE_SIZE);
    a.x = pos.x;
    a.y = pos.y;
    a.vx = (Math.random() - 0.5) * 1.2;
    a.vy = (Math.random() - 0.5) * 1.2;
  });
}

function isCollide(a, b, sizeA, sizeB) {
  return (
    a.x < b.x + sizeB &&
    a.x + sizeA > b.x &&
    a.y < b.y + sizeB &&
    a.y + sizeA > b.y
  );
}

let gameEnded = false;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 유치원
  ctx.drawImage(images.kindergarden, kindergardenPos.x, kindergardenPos.y, KINDERGARDEN_SIZE, KINDERGARDEN_SIZE);
  // 집
  ctx.drawImage(images.home, homePos.x, homePos.y, HOME_SIZE, HOME_SIZE);

  // 세균
  viruses.forEach(v => {
    ctx.drawImage(v.img, v.x, v.y, VIRUS_SIZE, VIRUS_SIZE);
  });
  // 첨가물
  additives.forEach(a => {
    ctx.drawImage(a.img, a.x, a.y, ADDITIVE_SIZE, ADDITIVE_SIZE);
  });
  // 세이피
  ctx.drawImage(images.safy, safy.x, safy.y, SAFY_SIZE, SAFY_SIZE);
}

function update() {
  if (gameEnded) return;
  // 세이피 이동
  safy.x += safy.vx;
  safy.y += safy.vy;
  // 화면 밖 방지
  safy.x = Math.max(0, Math.min(canvas.width - SAFY_SIZE, safy.x));
  safy.y = Math.max(0, Math.min(canvas.height - SAFY_SIZE, safy.y));

  // 장애물 이동
  viruses.forEach(v => {
    v.x += v.vx;
    v.y += v.vy;
    // 벽에 닿으면 튕김
    if (v.x < 0 || v.x > canvas.width - VIRUS_SIZE) v.vx *= -1;
    if (v.y < 0 || v.y > canvas.height - VIRUS_SIZE) v.vy *= -1;
  });
  additives.forEach(a => {
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < 0 || a.x > canvas.width - ADDITIVE_SIZE) a.vx *= -1;
    if (a.y < 0 || a.y > canvas.height - ADDITIVE_SIZE) a.vy *= -1;
  });

  // 충돌 체크
  for (let v of viruses) {
    if (isCollide(safy, v, SAFY_SIZE, VIRUS_SIZE)) {
      errorSound.currentTime = 0;
      errorSound.play();
      resetSafy();
      resetObstacles();
      return;
    }
  }
  for (let a of additives) {
    if (isCollide(safy, a, SAFY_SIZE, ADDITIVE_SIZE)) {
      errorSound.currentTime = 0;
      errorSound.play();
      resetSafy();
      resetObstacles();
      return;
    }
  }

  // 도착 체크
  if (isCollide(safy, homePos, SAFY_SIZE, HOME_SIZE)) {
    gameEnded = true;
    successSound.currentTime = 0;
    successSound.play();
    setTimeout(() => {
      alert('축하해요! 안전하게 집에 도착했어요!');
      location.reload();
    }, 1200);
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameEnded) requestAnimationFrame(gameLoop);
}

// 이미지 모두 로드 후 게임 시작
let loaded = 0;
const totalImages = 3 + images.viruses.length + images.additives.length;
function checkLoaded() {
  loaded++;
  if (loaded >= totalImages) {
    gameLoop();
  }
}
images.safy.onload = checkLoaded;
images.kindergarden.onload = checkLoaded;
images.home.onload = checkLoaded;
images.viruses.forEach(img => img.onload = checkLoaded);
images.additives.forEach(img => img.onload = checkLoaded);
