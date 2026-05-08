/**
 * Creates and returns a MAC address table modal element as an `<article>` DOM node.
 * The table has three columns — Device, MAC, and Physical Port — and a "Close"
 * button that calls `closeMacTable`. Click events on the element are stopped from
 * propagating so they do not trigger parent board interactions.
 *
 * @returns {HTMLElement} The MAC table `<article>` element, ready to be appended to a switch object.
 */
function macTable() {

    const $macTable = document.createElement("article");

    $macTable.classList.add("modal-table","mac-table");

    $macTable.innerHTML = `
        <table>
            <tr>
                <th>Device</th>
                <th>MAC</th>
                <th>Physical Port</th>
            </tr>
        </table>
        <button onclick="closeMacTable(event)">Close</button>
    `;

    $macTable.setAttribute("onclick", "event.stopPropagation()");

    return $macTable;

}
