const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Загрузка картинки игрока
const playerImg = new Image();
playerImg.src = "arsenchik.png"; // Замени на свой путь

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

// Создание объектов
function spawnObject() {
    const isGood = Math.random() > 0.3; // 70% - ХА, 30% - ХИ
    const item = isGood ? goodItems[0] : badItems[0];

    objects.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 3,
        item: item,
        isGood: isGood
    });
}

// Управление (клавиши)
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "ArrowRight") player.x += player.speed;
    
    // Новые границы с выходом за край
    if (player.x < -player.width/2) player.x = -player.width/2;
    if (player.x > canvas.width - player.width/2) player.x = canvas.width - player.width/2;
});

// Спавн объектов
function spawnObject() {
    const isGood = Math.random() > 0.3;
    objects.push({
        x: Math.random() * (canvas.width + 30) - 15, // Появляются чуть за границами
        y: -30,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 3,
        item: isGood ? goodItems[0] : badItems[0],
        isGood: isGood
    });
}

// Управление (касания)
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX - canvas.offsetLeft;
    player.x = touchX - player.width / 2;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
});

// Проверка столкновений
function checkCollision(obj) {
    // Уменьшаем зону столкновения на 30% со всех сторон
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

// И в функции spawnObject увеличим частоту появления объектов:
function spawnObject() {
    if (Math.random() < 1) { // Было 0.02, теперь чаще
        const isGood = Math.random() > 0.3;
        const item = isGood ? goodItems[0] : badItems[0];

        objects.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 3,
            item: item,
            isGood: isGood
        });
    }
}

// Игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем игрока (картинку или эмодзи)
    if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
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
            } else {
                gameOver = true;
            }
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
playerImg.onload = gameLoop; // Ждем загрузки картинки