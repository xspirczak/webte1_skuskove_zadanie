// starting pos x, velocity x left, velocity x right, starting pos y, velocity y (axis)
let x, vxl = 0, vxr = 0,  y, vy = 0;
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


const setUpMouseMovement = () => {
    let wasPressed = false;
    let mouseMoveHandler;

    document.addEventListener("keydown", function(event) {
        if (event.key === "M" || event.key === "m") {
            if (!wasPressed) {

                wasPressed = true;

                mouseMoveHandler = (event) => {
                    const rect = canvas.getBoundingClientRect();
                    let mouseX, mouseY;

                    const barriers = Array.isArray(currentLevel.barriers) ? currentLevel.barriers : Object.values(currentLevel.barriers);

                    mouseX = event.clientX - rect.left;
                    mouseY = event.clientY - rect.top;

                    const collided = barriers.some(barrier => checkCollisionBarrier(mouseX - 40, mouseY - 40, barrier));
                    if (!collided) {
                        x = mouseX - 40;
                        y = mouseY - 40;
                    }
                };

                canvas.addEventListener("mousemove", mouseMoveHandler);
            } else {
                wasPressed = false;

                if (mouseMoveHandler) {
                    canvas.removeEventListener("mousemove", mouseMoveHandler);
                    mouseMoveHandler = null;
                }
            }
        }
    });
};

const getQueryParams = () => {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    urlParams.forEach((value, key) => {
        params[key] = value;
    });

    return params;
};

const canPlayLevel = (levelId) => {
    const localStorageLevels = JSON.parse(localStorage.getItem('levels'));
    if (parseInt(levelId) === 0)
        return true;

    for (let id = 0; id < Object.values(localStorageLevels).length; id++) {
        if (id === parseInt(levelId-1) ) {
            return localStorageLevels[id];
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const queryParams = getQueryParams();
    const levelId = queryParams.levelId;

    const canPlay = canPlayLevel(levelId);

    if (levelId && canPlay) {
        fetch('../assets/levels.json')
        //fetch('https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/levels.json')
            .then(response => response.json())
            .then(levels => {
                const level = levels.find(l => l.id === parseInt(levelId));
                if (level) {
                    x = level.start_position[0]
                    y = level.start_position[1]
                    currentLevel = level
                    displayLevel(level);
                    setUpMouseMovement();
                } else {
                    console.error('Level not found');
                }
            })
            .catch(error => console.error('Error fetching levels:', error));
    } else {
        const gameOverlay = document.getElementById('gameOverlay');
        gameOverlay.style.display = 'none';
        alert("Na odomknutie tohto levelu musíte splniť level predtým!");
        setTimeout(mainMenu, 2000);
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

const getMaxCoins = (level) => {
    const coinsLeft = Object.values(level.coins).length;
    return coinsLeft + coins;
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
    const maxCoins = getMaxCoins(level)

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

    const maxCoins = getMaxCoins(currentLevel)

    coinsDiv.innerHTML = coins + '/' + maxCoins;
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
    //const levelQuery = '/~xspirczak/skuskove_zadanie/'
    window.location.replace(levelQuery);
}

let isPaused = false;
let pausedTime = 0;

const startTimer = () => {
    console.log("STARTING 111")
    if (!isPaused) {
        levelStartTime = Date.now();
    } else {
        levelStartTime = Date.now() - (pausedTime * 1000);
        isPaused = false;
    }

    timerInterval = setInterval(displayTimer, 10);
};

const displayTimer = () => {
    const timeElapsedDiv = document.getElementById('timeElapsed');
    elapsedTime = (Date.now() - levelStartTime) / 1000;

    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);

    // Zobrazenie času vo formáte MM:SS (s dvoma číslicami pre sekundy)
    timeElapsedDiv.innerHTML = `${minutes}.${seconds.toString().padStart(2, '0')}`;
};

const pauseTimer = () => {
  if (!isPaused) {
      clearInterval(timerInterval);
      pausedTime = elapsedTime;
      isPaused = true;
  }
};

const resumeTimer = () => {
  if (isPaused) {
      if (GYRO_ON || !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)))
        startTimer();
  }
};

const endTimer = () => {

    clearInterval(timerInterval);

    const timer = document.getElementById("timer");
    timer.style.fontWeight = "bold";

    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);

    timer.innerHTML = `${minutes}.${seconds.toString().padStart(2, '0')}`;

    isPaused = false;
    pausedTime = 0;
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

    const maxCoins = getMaxCoins(currentLevel)

    coinCounter.innerHTML = coins + '/' + maxCoins;
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barriers = Array.isArray(currentLevel.barriers) ? currentLevel.barriers : Object.values(currentLevel.barriers);

    if (!isPaused) {
        const combinedVx = vxr + vxl;

        let adjustedVx = combinedVx;
        let adjustedVy = vy;

        if (combinedVx !== 0 && vy !== 0) {
            const factor = VELOCITY / Math.sqrt(2);
            adjustedVx = (combinedVx > 0 ? factor : -factor);
            adjustedVy = (vy > 0 ? factor : -factor);
        }

        if (x + adjustedVx >= 0) {
            const nextX = x + adjustedVx;
            const collided = barriers.some(barrier => checkCollisionBarrier(nextX, y, barrier));
            if (!collided) x = nextX;
        }

        if (y + adjustedVy >= 0 && y + adjustedVy + (80 * SCALE_X) <= canvas.height) {
            const nextY = y + adjustedVy;
            const collided = barriers.some(barrier => checkCollisionBarrier(x, nextY, barrier));
            if (!collided) y = nextY;
        }
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

    ctx.drawImage(player, x, y, 80*SCALE_X, 80*SCALE_X);
    ctx.drawImage(gate, currentLevel.end_position[0] * SCALE_X, currentLevel.end_position[1] * SCALE_Y, 100*SCALE_X, 100*SCALE_X);

    displayBarriers(imageH, imageV);

    if (currentLevel && currentLevel.moving_fire) {
        displayFlames(flame);
        if (!isPaused) {
            moveFlames();
        }
        checkCollisionFlames(x,y,currentLevel);
    }

    requestAnimationFrame(() => gameLoop(imageH, imageV, player, gate, coin, cactus, flame));
};

const startGame = () => {
    if (canvas) {
        setUpCanvas(canvas);

        if (ctx) {
            // Initial coin counter
            const coinCounter = document.getElementById("coinCount");
            const maxCoins = getMaxCoins(currentLevel)
            coinCounter.innerHTML = 0 + '' + '/' + maxCoins;

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
                    // If user is on mobile gyroscope has to be on before starting the timer
                    // If user is using pc web browser we start the timer
                    if (GYRO_ON || !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)))
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


const modalElement = document.getElementById('orientation-warning');
const modal = new bootstrap.Modal(modalElement);

function checkOrientation() {

    // Mobile or Tablet
    const gyroBtn = document.getElementById('enable-gyro');
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        gyroBtn.classList.remove('d-none');
    } else {
        gyroBtn.classList.add('d-none');
    }

    if (window.innerHeight > window.innerWidth) {
        // Portrait mode
        modal.show();
        pauseTimer();
    } else {
        // Landscape mode
        modal.hide();
        resumeTimer();
    }
}

window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);

const changingIcon = document.getElementById('changingIcon');
document.getElementsByClassName("pauseGameButton")[0].addEventListener("click", () => {
    if (isPaused) {
        resumeTimer();
        changingIcon.classList.remove('fa-play');
        changingIcon.classList.add('fa-pause');
    } else {
        pauseTimer();
        changingIcon.classList.remove('fa-pause');
        changingIcon.classList.add('fa-play');
    }
});

const getInformation = (level) => {
    return level.description;
}

document.getElementById("levelInformation").addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('informationModal'));
    const informationDiv = document.getElementById('informationParagraph');
    informationDiv.innerText = getInformation(currentLevel);
    modal.show();
});

