// starting pos x, velocity x left, velocity x right, starting pos y, velocity y (axis)
let x, vxl = 0, vxr = 0,  y, vy = 0
// Current level data
let currentLevel
// Canvas
let canvas = document.getElementById("game")
// Canvas context
let ctx
// Scale that is calculated depending on the device width and height
let SCALE_X = 1, SCALE_Y = 1

const getQueryParams = () => {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    urlParams.forEach((value, key) => {
        params[key] = value;
    });

    return params;
};

window.addEventListener("DOMContentLoaded", () => {
    const queryParams = getQueryParams();
    const levelId = queryParams.levelId;

    if (levelId) {
        fetch('../assets/levels.json')
            .then(response => response.json())
            .then(levels => {
                const level = levels.find(l => l.id === parseInt(levelId));
                if (level) {
                    x = level.start_position[0]
                    y = level.start_position[1]
                    currentLevel = level
                    displayLevel(level);
                } else {
                    console.error('Level not found');
                }
            })
            .catch(error => console.error('Error fetching levels:', error));
    } else {
        console.error('No levelId provided in query parameters');
    }
});

const setUpCanvas = (canvas) => {

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        SCALE_X = canvas.width/1920;
        SCALE_Y = canvas.height/1080;

    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.style.backgroundColor = "gray"

    ctx = canvas.getContext("2d")
}

const displayBarriers = (imageH, imageV) => {
    const barriers = Object.values(currentLevel.barriers);

    barriers.forEach((barrier) => {
        const image = barrier.orientation === "h" ? imageH : imageV;

        ctx.drawImage(
            image,
            barrier.pos[0] * SCALE_X,
            barrier.pos[1] * SCALE_Y,
        );
    });
};

const checkCollision = (playerX, playerY, barrier) => {
    const playerLeft = playerX;
    const playerRight = playerX + 100;
    const playerTop = playerY;
    const playerBottom = playerY + 100;

    let barrierLeft, barrierRight, barrierTop, barrierBottom;
    if (barrier.orientation === "h") {
        barrierLeft = barrier.pos[0] * SCALE_X;
        barrierRight = barrierLeft + 80*SCALE_X;
        barrierTop = barrier.pos[1] * SCALE_Y;
        barrierBottom = barrierTop + 32*SCALE_Y  ;
    } else if (barrier.orientation === "v") {
        barrierLeft = barrier.pos[0] * SCALE_X;
        barrierRight = barrierLeft + 32*SCALE_X;
        barrierTop = barrier.pos[1] * SCALE_Y;
        barrierBottom = barrierTop + 80*SCALE_Y;
    }


    return !(playerRight <= barrierLeft || playerLeft >= barrierRight || playerBottom <= barrierTop || playerTop >= barrierBottom);
};

const gameLoop = (imageH, imageV, player, gate) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barriers = Array.isArray(currentLevel.barriers) ? currentLevel.barriers : Object.values(currentLevel.barriers);

    if (x + vxl >= 0) {
        const nextX = x + vxl;
        const collided = barriers.some(barrier => checkCollision(nextX, y, barrier));
        if (!collided) x = nextX;
    }

    if (x + vxr + 100 <= canvas.width) {
        const nextX = x + vxr;
        const collided = barriers.some(barrier => checkCollision(nextX, y, barrier));
        if (!collided) x = nextX;
    }

    if (y + vy >= 0 && y + vy + 100 <= canvas.height) {
        const nextY = y + vy;
        const collided = barriers.some(barrier => checkCollision(x, nextY, barrier));
        if (!collided) y = nextY;
    }


    ctx.drawImage(player, x, y, 100, 100);
    ctx.drawImage(gate, currentLevel.end_position[0] * SCALE_X, currentLevel.end_position[1] * SCALE_Y, 120, 120);

    displayBarriers(imageH, imageV);

    requestAnimationFrame(() => gameLoop(imageH, imageV, player, gate));
};




const startGame = () => {
    if (canvas) {
        setUpCanvas(canvas);

        if (ctx) {
            const barrierH = new Image();
            const barrierV = new Image();
            const player = new Image();
            const gate = new Image();

            barrierH.src = 'assets/images/barrier_h.png';
            barrierV.src = 'assets/images/barrier_v.png';
            player.src = 'assets/images/player1.png';
            gate.src = 'assets/images/gate.png';


            let loadedImages = 0;
            const checkAllLoaded = () => {
                if (loadedImages === 4) {
                    gameLoop(barrierH, barrierV, player, gate);
                }
            };

            barrierH.onload = () => {
                loadedImages++;
                checkAllLoaded();
            };
            barrierV.onload = () => {
                loadedImages++;
                checkAllLoaded();
            };

            player.onload = () => {
                loadedImages++;
                checkAllLoaded();
            };

            gate.onload = () => {
                loadedImages++;
                checkAllLoaded();
            };

            barrierH.onerror = () => {
                console.error('Failed to load image:', barrierH.src);
            };
            barrierV.onerror = () => {
                console.error('Failed to load image:', barrierV.src);
            };
            player.onerror = () => {
                console.error('Failed to load image:', player.src);
            };
            gate.onerror = () => {
                console.error('Failed to load image:', gate.src);
            };
        }
    } else {
        console.error('Game canvas not found');
    }
};


const displayLevel = () => {
    if (currentLevel) {
        startGame();
    } else {
        console.error('No level data available');
    }
};


