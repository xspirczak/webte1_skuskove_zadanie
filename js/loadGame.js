// starting pos x, velocity x left, velocity x right, starting pos y, velocity y (axis)
let x, vxl = 0, vxr = 0,  y, vy = 0
// Current level data
let currentLevel
// Canvas
let canvas = document.getElementById("game")
// Canvas context
let ctx



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
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.style.backgroundColor = "gray"

    ctx = canvas.getContext("2d")
}

const update = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    x += vxl
    x += vxr
    y += vy

    ctx.fillRect(x,y, 50, 50);
    requestAnimationFrame(update)
}

/*
const displayEnd = () => {
    ctx.beginPath();
    ctx.rect(currentLevel.end_position[0], currentLevel.end_position[1], 20    ,100);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.stroke();
}
*/

const displayLevel = (level) => {

    if (canvas) {

        setUpCanvas(canvas);

        if (ctx) {
            update();
            //displayEnd();
        }


    } else {
        console.error('Game canvas not found');
    }
};


