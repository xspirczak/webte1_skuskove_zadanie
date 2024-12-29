const VELOCITY = 2
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

/*
// Add a listener for the deviceorientation event
window.addEventListener("deviceorientation", (e) => {
    // Get the tilt values from the gyroscope
    const tiltX = e.beta;  // X-axis tilt (front to back)
    const tiltY = e.gamma; // Y-axis tilt (left to right)
    // Map the tilt values to movement velocities
    // For tiltX (beta), positive means tilting forward, negative tilting backward
    // For tiltY (gamma), positive means tilting right, negative tilting left

    // Horizontal movement (tilting left or right)
    if (tiltY > 10) {
        vxr = VELOCITY;  // Move right
        vxl = 0;
    } else if (tiltY < -10) {
        vxl = -VELOCITY;  // Move left
        vxr = 0;
    } else {
        vxr = 0;
        vxl = 0;  // No horizontal movement
    }

    // Vertical movement (tilting forward or backward)
    if (tiltX > 10) {
        vy = VELOCITY;  // Move down
    } else if (tiltX < -10) {
        vy = -VELOCITY;  // Move up
    } else {
        vy = 0;  // No vertical movement
    }
});

// Optional: Add event listener to stop movement when orientation is reset
window.addEventListener("deviceorientationabsolute", (e) => {
    if (e.alpha === 0 && e.beta === 0 && e.gamma === 0) {
        // Stop movement when device is flat
        vxr = 0;
        vxl = 0;
        vy = 0;
    }
});
 */