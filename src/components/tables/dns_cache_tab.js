/**
 * Creates and returns a DNS resolver cache table modal element as an `<article>` DOM node.
 * The table has three columns — Domain, Record Type, and Value — and a "Close"
 * button that calls `closeObjectModalTable`. Click events on the element are stopped
 * from propagating so they do not trigger parent board interactions.
 *
 * @returns {HTMLElement} The DNS cache table `<article>` element, ready to be appended to a network object.
 */
export function cacheDnsTable() {

    const $cacheDnsTable = document.createElement("article");

    $cacheDnsTable.classList.add("modal-table","cache-dns-table");

    $cacheDnsTable.innerHTML = `
        <table>
            <tr>
                <th>Domain</th>
                <th>Record Type</th>
                <th>Value</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.cache-dns-table')">Close</button>
    `;

    $cacheDnsTable.setAttribute("onclick", "event.stopPropagation();");

    return $cacheDnsTable;

}
