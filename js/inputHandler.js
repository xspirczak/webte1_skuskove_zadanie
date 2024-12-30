const VELOCITY = 3;
const RESET_VELOCITY = 0;

addEventListener("keydown", function(e) {
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
});

addEventListener("keyup", function(e) {
    //WASD
    if (e.code === 'KeyD') vxr = RESET_VELOCITY;
    if (e.code === 'KeyA') vxl = RESET_VELOCITY;
    if (e.code === 'KeyW') vy = RESET_VELOCITY;
    if (e.code === 'KeyS') vy = RESET_VELOCITY;
    //ARROWS
    if (e.code === 'ArrowRight') vxr = RESET_VELOCITY;
    if (e.code === 'ArrowLeft') vxl = RESET_VELOCITY;
    if (e.code === 'ArrowUp') vy = RESET_VELOCITY;
    if (e.code === 'ArrowDown') vy = RESET_VELOCITY;
});

function handleDeviceOrientation(event) {
    const gyroY = event.beta;
    const gyroX = event.gamma;

    const THRESHOLD = 8;

    // Ovládanie hore/dolu
    if (gyroY > THRESHOLD) {
        vxr = -VELOCITY;
    } else if (gyroY < -THRESHOLD) {
        vxl = VELOCITY;
    } else {
        vxr = RESET_VELOCITY;
        vxl = RESET_VELOCITY;
    }

    // Ovládanie doprava/dolava
    if (gyroX > THRESHOLD) {
        vy = -VELOCITY;
    } else if (gyroX < -THRESHOLD) {
        vy = VELOCITY;
    } else {
        vy = RESET_VELOCITY;
    }
}

function startGyroscope() {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
}

document.getElementById("enable-gyro").addEventListener("click", () => {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === "granted") {
                    alert("Gyroskop povolený.");
                    startGyroscope();
                } else {
                    alert("Gyroskop zamietnutý.");
                }
            })
            .catch(console.error);
    } else {
        alert("Povolenie nie je potrebné na tomto zariadení.");
        startGyroscope();
    }
});



