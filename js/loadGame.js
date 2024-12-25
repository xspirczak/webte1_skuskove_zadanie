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

const gameLoop = (imageH, imageV) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (x + vxl >= 0) {
        x += vxl;
    }
    if (x + vxr + 50 <= canvas.width) {
        x += vxr;
    }
    if (y + vy >= 0 && y + vy + 50 <= canvas.height) {
        y += vy;
    }

    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, 50, 50);

    ctx.fillStyle = "green";
    ctx.fillRect(
        currentLevel.end_position[0] * SCALE_X,
        currentLevel.end_position[1] * SCALE_Y,
        10, 100
    );

    displayBarriers(imageH, imageV);

    requestAnimationFrame(() => gameLoop(imageH, imageV));
};


const startGame = () => {
    if (canvas) {
        setUpCanvas(canvas);

        if (ctx) {
            const barrierH = new Image();
            const barrierV = new Image();

            barrierH.src = 'assets/images/barrier_h.png';
            barrierV.src = 'assets/images/barrier_v.png';

            let loadedImages = 0;
            const checkAllLoaded = () => {
                if (loadedImages === 2) {
                    gameLoop(barrierH, barrierV);
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

            barrierH.onerror = () => {
                console.error('Failed to load image:', barrierH.src);
            };
            barrierV.onerror = () => {
                console.error('Failed to load image:', barrierV.src);
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


