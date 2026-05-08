/**
 * Creates and returns a DHCP lease table modal element as an `<article>` DOM node.
 * The table has four columns — IP, MAC, Host, and Lease Time —
 * and a "Close" button that calls `closeObjectModalTable`. Click events on the
 * element are stopped from propagating so they do not trigger parent board interactions.
 *
 * @returns {HTMLElement} The DHCP table `<article>` element, ready to be appended to a network object.
 */
function dhcpTable() {

    const $dhcpTable = document.createElement("article");

    $dhcpTable.classList.add("modal-table","dhcp-table");

    $dhcpTable.innerHTML = `
        <table>
            <tr>
                <th>IP</th>
                <th>MAC</th>
                <th>Host</th>
                <th>Lease Time</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.dhcp-table')">Close</button>
    `;

    $dhcpTable.setAttribute("onclick", "event.stopPropagation();");

    return $dhcpTable;

}
