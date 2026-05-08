/**
 * Pauses the current simulation.
 */
function pauseSimulation() {
    paused = true;
}

/**
 * Resumes the current simulation.
 */
function resumeSimulation() {
    paused = false;
}

/**
 * Controls the flow of the simulation.
 * @returns {Promise<void>}
 */
function waitUntilResumed() {
    return new Promise(resolve => {
        const check = () => {
            if (!paused) resolve();
            else requestAnimationFrame(check);
        };
        check();
    });
}

/**
 * Animates the movement of a packet between two points on the board.
 * @param {string} x1 - X coordinate of the first point.
 * @param {string} y1 - Y coordinate of the first point.
 * @param {string} x2 - X coordinate of the second point.
 * @param {string} y2 - Y coordinate of the second point.
 * @param {'broadcast' | 'unicast' | 'dhcp' | 'dns' | 'icmp' | 'tcp' | 'unicast'} [type='unicast'] - Type of packet.
 * @returns 
 */
async function movePacket(
    x1, 
    y1, 
    x2, 
    y2, 
    type = 'unicast'
) {

    return new Promise(resolve => {

        const $svg = document.getElementById("svg-board");
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        x1 = parseInt(x1.replace("px", ""));
        y1 = parseInt(y1.replace("px", ""));
        x2 = parseInt(x2.replace("px", ""));
        y2 = parseInt(y2.replace("px", ""));
        img.setAttribute("href", `./assets/packets/${type}.png`);
        img.setAttribute("width", "50");
        img.setAttribute("height", "50");
        img.setAttribute("x", x1);
        img.setAttribute("y", y1);
        $svg.appendChild(img);

        let startTime;

        function animateMove(time) {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            const progress = elapsed / visualSpeed;
            const currentX = x1 + (x2 - x1) * Math.min(progress, 1);
            const currentY = y1 + (y2 - y1) * Math.min(progress, 1);
            img.setAttribute("x", currentX);
            img.setAttribute("y", currentY);

            if (progress < 1) {
                if (paused) {
                    waitUntilResumed().then(() => {
                        startTime = performance.now() - elapsed;
                        requestAnimationFrame(animateMove);
                    });
                } else {
                    requestAnimationFrame(animateMove);
                }
            } else {
                $svg.removeChild(img);
                resolve();
            }
        }

        requestAnimationFrame(animateMove);
    });
}
