const VELOCITY = 1
const RESET_VELOCITY = 0

addEventListener("keydown", function(e) {
    //console.log(e.code)
    //WASD
    if (e.code === 'KeyD') vxr = VELOCITY;
    if (e.code === 'KeyA') vxl = -VELOCITY;
    if (e.code === 'KeyW') vy = -VELOCITY;
    if (e.code === 'KeyS') vy = VELOCITY;
    //ARROWS
    if (e.code === 'ArrowRight') vxr = VELOCITY;
    if (e.code === 'ArrowLeft') vxl = -VELOCITY;
    if (e.code === 'ArrowUp') vy = -VELOCITY;
    if (e.code === 'ArrowDown') vy = VELOCITY;

})

addEventListener("keyup", function(e) {
    //WASD
    if (e.code === 'KeyD') vxr = RESET_VELOCITY;
    if (e.code === 'KeyA') vxl = RESET_VELOCITY;
    if (e.code === 'KeyW') vy = RESET_VELOCITY;
    if (e.code === 'KeyS') vy = RESET_VELOCITY;
    //ARROWS
    if (e.code === 'ArrowRight') vxr = RESET_VELOCITY;
    if (e.code === 'ArrowLeft') vxl = -RESET_VELOCITY;
    if (e.code === 'ArrowUp') vy = -RESET_VELOCITY;
    if (e.code === 'ArrowDown') vy = RESET_VELOCITY;

})