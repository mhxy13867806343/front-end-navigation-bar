const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;

function update(deltaTime) {
    // 游戏逻辑更新
}

function draw() {
    // 渲染游戏画面
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

// 启动游戏循环
requestAnimationFrame(gameLoop);
