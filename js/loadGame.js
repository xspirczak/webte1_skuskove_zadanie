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
let levelStartTime = null;
let timerInterval = null;
let elapsedTime = 0;
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
        const width = barrier.orientation === "h" ? 80 : 32;
        const height = barrier.orientation === "h" ? 32 : 80;

        ctx.drawImage(
            image,
            barrier.pos[0] * SCALE_X,
            barrier.pos[1] * SCALE_Y,
            width * SCALE_X,
            height * SCALE_X
        );
    });
};

const checkCollisionBarrier = (playerX, playerY, barrier) => {
    const playerLeft = playerX;
    const playerRight = playerX + (80 *SCALE_X);
    const playerTop = playerY;
    const playerBottom = playerY + (80 *SCALE_X);

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
    const playerRight = playerX + (80*SCALE_X);
    const playerTop = playerY;
    const playerBottom = playerY + (80*SCALE_X);

    const gateLeft = (level.end_position[0] + 15) * SCALE_X;
    const gateRight = gateLeft + 85 * SCALE_X;
    const gateTop = (level.end_position[1] + 10) * SCALE_Y;
    const gateBottom = gateTop + 90 * SCALE_Y;

    return !(playerRight <= gateLeft || playerLeft >= gateRight || playerBottom <= gateTop || playerTop >= gateBottom);
}


const updateLocalStorageCoins = (level, nCoins, ) => {
    const localStorageCoins = JSON.parse(localStorage.getItem('coins'));
    const localStorageTimes = JSON.parse(localStorage.getItem('times'));
    const coinsData = {};
    const timesData = {};

    for (let i = 0; i < Object.values(localStorageCoins).length; i++) {
        if (i === level.id && localStorageCoins[i] < nCoins) {
            coinsData[i] = nCoins;
            timesData[i] = elapsedTime.toFixed(2);
        } else {
            coinsData[i] = localStorageCoins[i];
            console.log(localStorageTimes[i], -1)

            if (( i === level.id && localStorageTimes[i] > elapsedTime.toFixed(2) ) || ( i === level.id && localStorageTimes[i] === -1 )) {
                console.log("here")
                timesData[i] = elapsedTime.toFixed(2);
            } else {
                timesData[i] = localStorageTimes[i];
            }
        }
    }
    localStorage.setItem('coins', JSON.stringify(coinsData));
    localStorage.setItem('times', JSON.stringify(timesData));

}

const updateStars = (collectedCoins, level) => {
    const coinsLeft = Object.values(level.coins).length;
    const maxCoins = coinsLeft + coins;

    const star1 = document.getElementsByClassName("goldStar")[0];
    const star2 = document.getElementsByClassName("goldStar")[1];
    const star3 = document.getElementsByClassName("goldStar")[2];

    star1.classList.remove("filled");
    star2.classList.remove("filled");
    star3.classList.remove("filled");

    if (coins === maxCoins) {
        star1.classList.add("filled");
        star2.classList.add("filled");
        star3.classList.add("filled");
        updateLocalStorageCoins(currentLevel, 3);
    } else if (coins === ( maxCoins - 1 ) ) {
        star1.classList.add("filled");
        star2.classList.add("filled");
        updateLocalStorageCoins(currentLevel, 2);
    } else if (coins === ( maxCoins - 2 ) ) {
        star1.classList.add("filled");
        updateLocalStorageCoins(currentLevel, 1);
    } else {
        // just to update time if necessary
        updateLocalStorageCoins(currentLevel, 0);
    }
}

const showLevelCompleteModal = (onPlayAgain, onNextLevel) => {
    const modal = new bootstrap.Modal(document.getElementById('levelCompleteModal'));
    modal.show();
    const coinsDiv = document.getElementById('coins');

    coinsDiv.innerHTML = coins;
    coinsDiv.style.fontWeight = "bold";

    updateStars(coins, currentLevel);

    document.getElementsByClassName('playAgainButton')[1].onclick = () => {
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

const playAgain = () => {
    const levelQuery = `game.html?levelId=${encodeURIComponent(currentLevel.id)}`;
    window.location.replace(levelQuery);
}

const allLevelsFinished = () => {
    const levelsData = JSON.parse(localStorage.getItem('levels'));
    for(let levelId in levelsData){
        if(levelsData[levelId] === false){
            return false;
        }
    }
    return true;
}

const playNextLevel = () => {
    const levelsData = JSON.parse(localStorage.getItem('levels'));
    const levelCnt = Object.keys(levelsData).length;

    if (currentLevel.id === levelCnt-1 || allLevelsFinished() ) {
        const levelId = getLevelIdToPlay();
        const levelQuery = `game.html?levelId=${levelId}`;
        window.location.replace(levelQuery);
    } else {
        const levelQuery = `game.html?levelId=${encodeURIComponent(currentLevel.id+1)}`;
        window.location.replace(levelQuery);
    }
}

const mainMenu = () => {
    const levelQuery = `/zadanie_skuska/`;
    window.location.replace(levelQuery);
}

const startTimer = () => {
    levelStartTime = Date.now();
    timerInterval = setInterval(displayTimer, 10);
};

const displayTimer = () => {
    const timeElapsedDiv = document.getElementById('timeElapsed');
    elapsedTime = (Date.now() - levelStartTime) / 1000;
    timeElapsedDiv.innerHTML = elapsedTime.toFixed(2);
};

const endTimer = () => {

    clearInterval(timerInterval);

    const timer = document.getElementById("timer");
    timer.style.fontWeight = "bold";
    timer.innerHTML = elapsedTime.toFixed(2);
};

const finishedGame = () => {
    endTimer();

    let levels = JSON.parse(localStorage.getItem("levels"));
    levels[currentLevel.id] = true;
    localStorage.setItem("levels", JSON.stringify(levels));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showLevelCompleteModal(
        () => {playAgain()},
        () => {playNextLevel()}
    );
}

const displayCoins = (image) => {
    const coins = Object.values(currentLevel.coins);

    coins.forEach(coin => {
        ctx.drawImage(
            image,
            coin[0] * SCALE_X,
            coin[1] * SCALE_Y,
            50 * SCALE_X,
            50 * SCALE_X
        );
    })
}

const addCoin = () => {
    const coinCounter = document.getElementById("coinCount");
    coins+=1

    coinCounter.innerHTML = coins;
}

const checkCollisionCoin = (playerX, playerY, level) => {
    const playerLeft = playerX;
    const playerRight = playerX + (80 * SCALE_X);
    const playerTop = playerY;
    const playerBottom = playerY + (80 * SCALE_X);

    for (let i = Object.values(level.coins).length - 1; i >= 0; i--) {
        const coin = level.coins[i];
        const coinLeft = coin[0] * SCALE_X;
        const coinRight = coinLeft + (50*SCALE_X);
        const coinTop = coin[1] * SCALE_Y;
        const coinBottom = coinTop + (50*SCALE_X);

        if (
            playerRight > coinLeft &&
            playerLeft < coinRight &&
            playerBottom > coinTop &&
            playerTop < coinBottom
        ) {
            let newCoins = Object.values(level.coins);
            newCoins.splice(i, 1);
            currentLevel.coins = newCoins
            addCoin();
        }
    }
};

const displayCactus = (image) => {
    const cactuses = Object.values(currentLevel.cactus);
    cactuses.forEach(cactus => {
        ctx.drawImage(
                image,
                cactus[0] * SCALE_X,
                cactus[1] * SCALE_Y,
                60 *SCALE_X,
                60 *SCALE_X
            );
    })
}

const objectHit = (onPlayAgain, mainMenu) => {
    const modalCactus = new bootstrap.Modal(document.getElementById('objectHitModal'));
    modalCactus.show();

    document.getElementsByClassName('playAgainButton')[2].onclick = () => {
        modalCactus.hide();
        if (onPlayAgain) onPlayAgain();
    };

    document.getElementsByClassName('titleScreenButton')[1].onclick = () => {
        modalCactus.hide();
        if (mainMenu) mainMenu();
    };
}

const checkCollisionCactus = (playerX, playerY, level) => {
    const playerLeft = playerX;
    const playerRight = playerX + (80*SCALE_X);
    const playerTop = playerY;
    const playerBottom = playerY + (80*SCALE_X);


    for (let i = Object.values(level.cactus).length - 1; i >= 0; i--) {
        const cactus = level.cactus[i];
        const cactusLeft = cactus[0] * SCALE_X;
        const cactusRight = cactusLeft + (60*SCALE_X);
        const cactusTop = cactus[1] * SCALE_Y;
        const cactusBottom = cactusTop + (60*SCALE_X);

        if (
            playerRight > cactusLeft &&
            playerLeft < cactusRight &&
            playerBottom > cactusTop &&
            playerTop < cactusBottom
        ) {
            objectHit(
                () => {playAgain()},
                () => {mainMenu()}
            );
        }
    }
}

const displayFlames = (image) => {
    const flames = Object.values(currentLevel.moving_fire);
    flames.forEach(flame => {
        ctx.drawImage(
            image,
            flame.position[0] * SCALE_X,
            flame.position[1] * SCALE_Y,
            40 * SCALE_X,
            40 *SCALE_X
        );
    })

}

const moveFlames = () => {
    const flames = Object.values(currentLevel.moving_fire);

    flames.forEach((flame) => {
        if (!flame.directionState) {
            flame.directionState = 0.5;
            flame.startPosition = [...flame.position];
        }

        if (flame.direction === 'x') {
            flame.position[0] += flame.directionState;

            if (Math.abs(flame.position[0] - flame.startPosition[0]) >= flame.steps) {
                flame.directionState *= -1;
            }
        }

        if (flame.direction === 'y') {
            flame.position[1] += flame.directionState;

            if (Math.abs(flame.position[1] - flame.startPosition[1]) >= flame.steps) {
                flame.directionState *= -1;
            }
        }
    });
};

const checkCollisionFlames = (playerX, playerY, level) => {
    const playerLeft = playerX;
    const playerRight = playerX + (80 * SCALE_X);
    const playerTop = playerY;
    const playerBottom = playerY + (80 * SCALE_X);

    for (let i = Object.values(level.moving_fire).length - 1; i >= 0; i--) {
        const flame = level.moving_fire[i];

        const flameLeft = flame.position[0] * SCALE_X;
        const flameRight = flameLeft + (40 * SCALE_X);
        const flameTop = flame.position[1] * SCALE_Y;
        const flameBottom = flameTop + (40 * SCALE_X);

        if (
            playerRight > flameLeft &&
            playerLeft < flameRight &&
            playerBottom > flameTop &&
            playerTop < flameBottom
        ) {
            objectHit(
                () => {playAgain()},
                () => {mainMenu()}
            );
        }

    }

}
const gameLoop = (imageH, imageV, player, gate, coin, cactus ,flame) => {
    const coordsDiv = document.getElementById("coords");

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
        displayCoins(coin)
        checkCollisionCoin(x, y, currentLevel);
    }

    if (checkCollisionEnd(x,y, currentLevel)) {
        finishedGame();
        return;
    }

    if (currentLevel && currentLevel.cactus) {
        displayCactus(cactus);
        checkCollisionCactus(x,y, currentLevel);
    }

    coordsDiv.innerHTML = x + ', ' + y;

    ctx.drawImage(player, x, y, 80*SCALE_X, 80*SCALE_X);
    ctx.drawImage(gate, currentLevel.end_position[0] * SCALE_X, currentLevel.end_position[1] * SCALE_Y, 100*SCALE_X, 100*SCALE_X);

    displayBarriers(imageH, imageV);

    if (currentLevel && currentLevel.moving_fire) {
        displayFlames(flame);
        moveFlames();
        checkCollisionFlames(x,y,currentLevel);
    }

    requestAnimationFrame(() => gameLoop(imageH, imageV, player, gate, coin, cactus, flame));
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
            const cactus = new Image()
            const flame = new Image()

            barrierH.src = 'assets/images/barrier_h.png';
            barrierV.src = 'assets/images/barrier_v.png';
            player.src = 'assets/images/player1.png';
            gate.src = 'assets/images/gate.png';
            coin.src = 'assets/images/coin.png';
            cactus.src = 'assets/images/cactus.png';
            flame.src = 'assets/images/flame.png';

            let loadedImages = 0;
            const checkAllLoaded = () => {
                if (loadedImages === 7) {
                    startTimer();
                    gameLoop(barrierH, barrierV, player, gate, coin, cactus, flame);
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

            cactus.onload = () => {
                loadedImages++;
                checkAllLoaded();
            };

            flame.onload = () => {
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

            cactus.onerror = () => {
                console.error('Failed to load image:', cactus.src);
            };

            flame.onerror = () => {
                console.error('Failed to load image:', flame.src);
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

document.getElementsByClassName("playAgainButton")[0].addEventListener('click', () => {
    playAgain();
});


document.getElementsByClassName("titleScreenButton")[0].addEventListener('click', () => {
    mainMenu();
});

