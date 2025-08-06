const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Загрузка картинок игрока
const playerImgDefault = new Image();
playerImgDefault.src = "ham_smile.png"; // Основная картинка
const playerImgHappy = new Image();
playerImgHappy.src = "ham_eat.png"; // При столкновении с ХА
const playerImgSad = new Image();
playerImgSad.src = "ham_lose.png"; // При столкновении с ХИ

let currentPlayerImg = playerImgDefault; // Текущая картинка

// Игрок
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 170,
    width: 200,
    height: 200,
    speed: 10
};

// Объекты
const objects = [];
const goodItems = ["ХА"];
const badItems = ["ХИ"];

let score = 0;
let missed = 0;
let gameOver = false;
let lastCollisionTime = 0;
const imageChangeDuration = 500; // Время показа картинки в мс (0.5 сек)

// Создание объектов
function spawnObject() {
    const isGood = Math.random() > 0.3;
    objects.push({
        x: Math.random() * (canvas.width + 30) - 15,
        y: -30,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 3,
        item: isGood ? goodItems[0] : badItems[0],
        isGood: isGood
    });
}

// Управление (клавиши и касания остаются без изменений)
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "ArrowRight") player.x += player.speed;
    if (player.x < -player.width/2) player.x = -player.width/2;
    if (player.x > canvas.width - player.width/2) player.x = canvas.width - player.width/2;
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX - canvas.offsetLeft;
    player.x = touchX - player.width / 2;
    if (player.x < -player.width/2) player.x = -player.width/2;
    if (player.x > canvas.width - player.width/2) player.x = canvas.width - player.width/2;
});

// Проверка столкновений
function checkCollision(obj) {
    const shrinkFactor = 0.3;
    const playerLeft = player.x + player.width * shrinkFactor;
    const playerRight = player.x + player.width * (1 - shrinkFactor);
    const playerTop = player.y + player.height * shrinkFactor;
    const playerBottom = player.y + player.height * (1 - shrinkFactor);

    const objLeft = obj.x + obj.width * shrinkFactor;
    const objRight = obj.x + obj.width * (1 - shrinkFactor);
    const objTop = obj.y + obj.height * shrinkFactor;
    const objBottom = obj.y + obj.height * (1 - shrinkFactor);

    return (
        playerRight > objLeft &&
        playerLeft < objRight &&
        playerBottom > objTop &&
        playerTop < objBottom
    );
}

// Игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Возвращаем стандартную картинку, если прошло достаточно времени
    if (Date.now() - lastCollisionTime > imageChangeDuration) {
        currentPlayerImg = playerImgDefault;
    }

    // Рисуем игрока (текущая картинка)
    if (currentPlayerImg.complete) {
        ctx.drawImage(currentPlayerImg, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = "#FF5733";
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Создаем объекты
    if (Math.random() < 0.02) spawnObject();

    // Двигаем и рисуем объекты
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        obj.y += obj.speed;

        ctx.font = "30px Arial";
        ctx.fillText(obj.item, obj.x, obj.y + 30);

        // Столкновение
        if (checkCollision(obj)) {
            if (obj.isGood) {
                score++;
                currentPlayerImg = playerImgHappy; // Меняем на happy.png
            } else {
                gameOver = true;
                currentPlayerImg = playerImgSad; // Меняем на sad.png
            }
            lastCollisionTime = Date.now();
            objects.splice(i, 1);
        }

        // Пропущенный объект
        if (obj.y > canvas.height) {
            if (obj.isGood) missed++;
            objects.splice(i, 1);
        }
    }

    // Очки и пропущенные
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText(`Очки: ${score}`, 10, 30);
    ctx.fillText(`Пропущено: ${missed}/8`, 10, 60);

    // Конец игры
    if (missed >= 8 || gameOver) {
        ctx.fillStyle = "#FF0000";
        ctx.font = "40px Arial";
        ctx.fillText("Игра окончена!", canvas.width / 2 - 140, canvas.height / 2);
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Запуск игры
window.onload = function() {
    // Ждем загрузки всех картинок
    Promise.all([
        new Promise(resolve => { playerImgDefault.onload = resolve; }),
        new Promise(resolve => { playerImgHappy.onload = resolve; }),
        new Promise(resolve => { playerImgSad.onload = resolve; })
    ]).then(gameLoop);
};