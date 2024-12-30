const VELOCITY = 2;
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

// Pridanie detekcie gyroskopu (náklon zariadenia)
let gyroX = 0;
let gyroY = 0;

window.addEventListener("deviceorientation", function(event) {
    // Získanie hodnot beta a gamma
    gyroX = event.beta;  // Otočenie okolo X osi (horizontálne naklonenie)
    gyroY = event.gamma; // Otočenie okolo Y osi (vertikálne naklonenie)

    // Nastavenie pohybu na základe gyroskopu
    // X (beta) - naklonenie doľava a doprava
    // Y (gamma) - naklonenie hore a dole

    // Mapovanie hodnôt z gyroskopu na pohyb
    if (gyroX > 15) { // Ak je náklon doľava
        vxl = -VELOCITY;
    } else if (gyroX < -15) { // Ak je náklon doprava
        vxl = VELOCITY;
    } else {
        vxl = RESET_VELOCITY;
    }

    if (gyroY > 15) { // Ak je náklon hore
        vy = -VELOCITY;
    } else if (gyroY < -15) { // Ak je náklon dole
        vy = VELOCITY;
    } else {
        vy = RESET_VELOCITY;
    }
});

// Ak chceš pridať aj resetovanie hodnot, keď nie je pohyb:
window.addEventListener("deviceorientation", function(event) {
    // Vyčisti pohyb ak nie je žiadny výrazný náklon
    if (Math.abs(gyroX) < 10) vxl = RESET_VELOCITY;
    if (Math.abs(gyroY) < 10) vy = RESET_VELOCITY;
});
