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
// Time that it took player to complete level
let timer = 0
// Coins player collected each level
let coins = 0

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

const checkCollisionBarrier = (playerX, playerY, barrier) => {
    const playerLeft = playerX;
    const playerRight = playerX + 80;
    const playerTop = playerY;
    const playerBottom = playerY + 80;

    let barrierLeft, barrierRight, barrierTop, barrierBottom;
    if (barrier.orientation === "h") {
        barrierLeft = barrier.pos[0] * SCALE_X;
        barrierRight = barrierLeft + 80 * SCALE_X;
        barrierTop = barrier.pos[1] * SCALE_Y;
        barrierBottom = barrierTop + 32 * SCALE_Y  ;
    } else if (barrier.orientation === "v") {
        barrierLeft = barrier.pos[0] * SCALE_X;
        barrierRight = barrierLeft + 32 * SCALE_X;
        barrierTop = barrier.pos[1] * SCALE_Y;
        barrierBottom = barrierTop + 80 * SCALE_Y;
    }

    return !(playerRight <= barrierLeft || playerLeft >= barrierRight || playerBottom <= barrierTop || playerTop >= barrierBottom);
};

const checkCollisionEnd = (playerX, playerY, level) => {
    const playerLeft = playerX;
    const playerRight = playerX + 80;
    const playerTop = playerY;
    const playerBottom = playerY + 80;

    const gateLeft = (level.end_position[0] + 15) * SCALE_X;
    const gateRight = gateLeft + 85 * SCALE_X;
    const gateTop = (level.end_position[1] + 10) * SCALE_Y;
    const gateBottom = gateTop + 90 * SCALE_Y;


    return !(playerRight <= gateLeft || playerLeft >= gateRight || playerBottom <= gateTop || playerTop >= gateBottom);
}

function showLevelCompleteModal(onPlayAgain, onNextLevel) {
    const modal = new bootstrap.Modal(document.getElementById('levelCompleteModal'));
    modal.show();

    document.getElementById('playAgainButton').onclick = () => {
        modal.hide();
        if (onPlayAgain) onPlayAgain();
    };

    document.getElementById('nextLevelButton').onclick = () => {
        modal.hide();
        if (onNextLevel) onNextLevel();
    };
}

const getLevelIdToPlay = () => {
    const levelsData = JSON.parse(localStorage.getItem('levels'));
    for(let levelId in levelsData){
        if(levelsData[levelId] === false){
            return levelId;
        }
    }
    return Math.floor(Math.random() * 5);
}


const finishedGame = () => {
    let levels = JSON.parse(localStorage.getItem("levels"));
    levels[currentLevel.id] = true;
    localStorage.setItem("levels", JSON.stringify(levels));


    showLevelCompleteModal(
        () => {
            const levelQuery = `game.html?levelId=${encodeURIComponent(currentLevel.id)}`;
            window.location.replace(levelQuery);
        },
        () => {
            //TODO: zmen tu 4 pls:)
            if (currentLevel.id === 4) {
                const levelId = getLevelIdToPlay();
                const levelQuery = `game.html?levelId=${levelId}`;
                window.location.replace(levelQuery);

            } else {
                const levelQuery = `game.html?levelId=${encodeURIComponent(currentLevel.id+1)}`;
                window.location.replace(levelQuery);
            }
    });
}

const displayCoins = (image) => {
    const coins = Object.values(currentLevel.coins);

    coins.forEach(coin => {
        ctx.drawImage(
            image,
            coin[0] * SCALE_X,
            coin[1] * SCALE_Y,
            50,
            50
        );
    })
}

const addCoin = () => {
    coins+=1
}

const checkCollisionCoin = (playerX, playerY, level) => {
    const playerLeft = playerX;
    const playerRight = playerX + 80;
    const playerTop = playerY;
    const playerBottom = playerY + 80;


    for (let i = Object.values(level.coins).length - 1; i >= 0; i--) {
        const coin = level.coins[i];
        const coinLeft = coin[0] * SCALE_X;
        const coinRight = coinLeft + 50;
        const coinTop = coin[1] * SCALE_Y;
        const coinBottom = coinTop + 50;

        if (
            playerRight > coinLeft &&
            playerLeft < coinRight &&
            playerBottom > coinTop &&
            playerTop < coinBottom
        ) {
            console.log("collision")
            Object.values(currentLevel.coins).splice(i, 1);
            addCoin();
        }
    }
};




const gameLoop = (imageH, imageV, player, gate, coin) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barriers = Array.isArray(currentLevel.barriers) ? currentLevel.barriers : Object.values(currentLevel.barriers);

    if (x + vxl >= 0) {
        const nextX = x + vxl;
        const collided = barriers.some(barrier => checkCollisionBarrier(nextX, y, barrier));
        if (!collided) x = nextX;
    }

    if (x + vxr + 100 <= canvas.width) {
        const nextX = x + vxr;
        const collided = barriers.some(barrier => checkCollisionBarrier(nextX, y, barrier));
        if (!collided) x = nextX;
    }

    if (y + vy >= 0 && y + vy + 100 <= canvas.height) {
        const nextY = y + vy;
        const collided = barriers.some(barrier => checkCollisionBarrier(x, nextY, barrier));
        if (!collided) y = nextY;
    }

    if (currentLevel && currentLevel.coins) {
        checkCollisionCoin(x, y, currentLevel);
    }

    if (checkCollisionEnd(x,y, currentLevel)) {
        finishedGame();
        return;
    }

    ctx.drawImage(player, x, y, 80, 80);
    ctx.drawImage(gate, currentLevel.end_position[0] * SCALE_X, currentLevel.end_position[1] * SCALE_Y, 100, 100);

    displayBarriers(imageH, imageV);

    displayCoins(coin)

    requestAnimationFrame(() => gameLoop(imageH, imageV, player, gate, coin));
};


const startGame = () => {
    if (canvas) {
        setUpCanvas(canvas);

        if (ctx) {
            const barrierH = new Image();
            const barrierV = new Image();
            const player = new Image();
            const gate = new Image();
            const coin = new Image();

            barrierH.src = 'assets/images/barrier_h.png';
            barrierV.src = 'assets/images/barrier_v.png';
            player.src = 'assets/images/player1.png';
            gate.src = 'assets/images/gate.png';
            coin.src = 'assets/images/coin.png';


            let loadedImages = 0;
            const checkAllLoaded = () => {
                if (loadedImages === 5) {
                    gameLoop(barrierH, barrierV, player, gate, coin);
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

            coin.onload = () => {
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

            coin.onerror = () => {
                console.error('Failed to load image:', coin.src);
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


