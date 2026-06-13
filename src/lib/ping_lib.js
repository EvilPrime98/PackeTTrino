/**
 * @description Prints an ICMP echo-reply success line to the terminal output and then starts a
 * repeating interval that prints additional reply lines every 500 ms, simulating a continuous
 * ping. Does nothing if the terminal component is hidden.
 * @param {string} origin - IP address of the replying host to display in the output.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function pingSuccess(origin) {
    const terminal = document.querySelector(".terminal-component");
    if (window.getComputedStyle(terminal).display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=1 ttl=64 time=0.030 ms\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 500);

}

/**
 * @description Prints an ICMP "Destination Host Unreachable" failure line to the terminal output
 * and then starts a repeating interval that prints additional failure lines every 500 ms,
 * simulating a continuous failing ping. Does nothing if the terminal component is hidden.
 * @param {string} origin - IP address of the source host to display in the output.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function pingFailure(origin) {
    const terminal = document.querySelector(".terminal-component");
    if (window.getComputedStyle(terminal).display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `From ${origin} icmp_seq=1 Destination Host Unreachable\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 500);
}
