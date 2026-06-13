/**
 * Renders a cable connection between two network objects on the SVG board.
 * Creates an SVG `<line>` from the start position to the end position and a
 * red `<circle>` at the midpoint that acts as a delete handle. Pixel-string
 * coordinates (e.g. `"120px"`) are accepted and converted internally to integers.
 *
 * @param {string} x1 - Left position of the start device (e.g. `"120px"`).
 * @param {string} y1 - Top position of the start device (e.g. `"80px"`).
 * @param {string} x2 - Left position of the end device (e.g. `"340px"`).
 * @param {string} y2 - Top position of the end device (e.g. `"200px"`).
 * @param {string} start - DOM id of the source network element.
 * @param {string} end - DOM id of the destination network element (typically a switch).
 * @param {string} [networkObjectInterface="enp0s3"] - Network interface name used as
 *   the tooltip text on the delete circle.
 * @returns {void}
 */
export function CableObject(x1, y1, x2, y2, start, end, networkObjectInterface = "enp0s3") {

    const svg = document.getElementById("svg-board");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    const cableColor = (darkMode) ? "white" : "black";

    const x1Value = parseInt(x1.replace("px", ""));
    const y1Value = parseInt(y1.replace("px", ""));
    const x2Value = parseInt(x2.replace("px", ""));
    const y2Value = parseInt(y2.replace("px", ""));
    const midX = parseInt((x1Value + x2Value) / 2);
    const midY = parseInt((y1Value + y2Value) / 2);

    line.setAttribute("end-start", start);
    line.setAttribute("end-end", end);
    line.setAttribute("x1", x1Value);
    line.setAttribute("y1", y1Value);
    line.setAttribute("x2", x2Value);
    line.setAttribute("y2", y2Value);
    line.setAttribute("stroke", cableColor);
    line.setAttribute("stroke-width", "5");

    circle.setAttribute("onclick", "deleteCable(event)");
    circle.setAttribute("end-start", start);
    circle.setAttribute("end-end", end);
    circle.setAttribute("cx", midX);
    circle.setAttribute("cy", midY);
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", "red");

    title.textContent = networkObjectInterface;

    circle.appendChild(title);
    svg.appendChild(line);
    svg.appendChild(circle);

}

/**
 * Deletes a cable and its midpoint circle from the SVG board, then cleans up
 * the related switch port entry and the network object's interface binding.
 * If the switch's MAC table becomes empty after removal, its icon is made
 * draggable again.
 *
 * @param {MouseEvent} event - The click event fired on the cable's delete circle.
 * @returns {void}
 */
export function deleteCable(event) {

    const circle = event.target;
    const cableObject = circle.previousElementSibling;
    const $networkObject = document.getElementById(cableObject.getAttribute("end-start"));
    const $switchObject = document.getElementById(cableObject.getAttribute("end-end"));

    getInterfaces($networkObject.id).forEach(iface => {
        if ( $networkObject.getAttribute(`data-switch-${iface}`) === $switchObject.id) {
            $networkObject.setAttribute(`data-switch-${iface}`, "");
        }
    });

    $networkObject.querySelector("img").draggable = true;
    deleteSwitchPort($switchObject.id, cableObject.getAttribute("end-start"));
    if (isMacTableEmpty($switchObject.id)) $switchObject.querySelector("img").draggable = true;
    circle.remove();
    cableObject.remove();
}
