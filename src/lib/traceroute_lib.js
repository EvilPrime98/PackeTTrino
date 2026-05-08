/**
 * @description Prints a traceroute "no reply" (`*`) line to the terminal and then starts a
 * repeating interval that prints additional timeout lines every 500 ms. Does nothing if the
 * terminal component is hidden.
 * @param {string} origin - IP address or hostname of the current hop to display.
 * @param {number} seq - Current hop sequence number (displayed only when `numeric` is true).
 * @param {boolean} [numeric=false] - If true, prefixes each output line with the incremented hop number.
 * @returns {void}
 */
function traceRouteFail(origin, seq, numeric = false) {
    if (document.querySelector(".terminal-component").style.display === "none") return;
    seq = numeric ? seq + 1 : "";
    terminalMessage(seq + " " + origin.toString().padEnd(15," ") + " *\n");
    window.pingInterval = setInterval(() => {
        seq = numeric ? seq + 1 : "";
        terminalMessage(seq + " " + `*               *\n`);
    }, 500);
}
