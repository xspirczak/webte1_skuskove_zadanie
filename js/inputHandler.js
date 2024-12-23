addEventListener("keydown", function(e) {
    if (e.code === 'KeyD') vxr = 1;
    if (e.code === 'KeyA') vxl = -1;
    if (e.code === 'KeyW') vy = -1;
    if (e.code === 'KeyS') vy = 1;
})

addEventListener("keyup", function(e) {
    if (e.code === 'KeyD') vxr = 0;
    if (e.code === 'KeyA') vxl = 0;
    if (e.code === 'KeyW') vy = 0;
    if (e.code === 'KeyS') vy = 0;

})