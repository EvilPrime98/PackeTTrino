/**
 * Creates and returns a routing table modal element as an `<article>` DOM node.
 * The table has five columns — Destination Network, Netmask, Exit, Interface,
 * and Next Hop — and a "Close" button that calls `closeObjectModalTable`.
 * Click events on the element are stopped from propagating so they do not trigger
 * parent board interactions.
 *
 * @returns {HTMLElement} The routing table `<article>` element, ready to be appended to a network object.
 */
export function routingTable() {
    const $routingTable = document.createElement("article");

    $routingTable.classList.add("modal-table","routing-table");

    $routingTable.innerHTML = `
        <table>
            <tr>
                <th>Destination Network</th>
                <th>Netmask</th>
                <th>Exit</th>
                <th>Interface</th>
                <th>Next Hop</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.routing-table')">Close</button>
    `;

    $routingTable.setAttribute("onclick", "event.stopPropagation()");

    return $routingTable;
}
