/**
 * Creates and returns an ARP table modal element as an `<article>` DOM node.
 * The table has two columns — IP and MAC — and a "Close" button that calls
 * `closeObjectModalTable`. Click events on the element are stopped from
 * propagating so they do not trigger parent board interactions.
 *
 * @returns {HTMLElement} The ARP table `<article>` element, ready to be appended to a network object.
 */
function arpTable() {

    const $arpTable = document.createElement("article");

    $arpTable.classList.add("modal-table", "arp-table");

    $arpTable.innerHTML = `
        <table>
            <tr>
                <th>IP</th>
                <th>MAC</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.arp-table')">Close</button>
    `;

    $arpTable.setAttribute("onclick", "event.stopPropagation();");

    return $arpTable;

}
