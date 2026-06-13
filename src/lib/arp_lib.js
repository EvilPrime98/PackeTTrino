// [agent-added: esm-migration phase 05]
import { state } from '../env.js';

/**
 * @description Returns the ARP table of a network object as a 2-D array of strings.
 * The first row contains headers; subsequent rows contain [ip, mac] pairs.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {string[][]} Matrix where each inner array represents one table row's cell values.
 */
// [agent-added: esm-migration phase 05]
export function getARPTable(networkObjectId) {
    const $table = document.querySelector(`#${networkObjectId} .arp-table table`);
    if (!$table) return [];
    const matrix = [];
    for (const $row of $table.rows) {
        const $rowArray = [];
        for (const $cell of $row.cells) {
            $rowArray.push($cell.innerText.trim());
        }
        matrix.push($rowArray);
    }
    return matrix;
}

/**
 * @description Adds or updates an ARP entry in the ARP table of the given network object.
 * If the IP already exists, its MAC is updated. Otherwise a new row is appended and a TTL
 * timer is started that will automatically delete the entry after `state.$ARPENTRYTTL` seconds.
 * @param {string} networkObjectId - DOM id of the network object whose ARP table to modify.
 * @param {string} ip - IP address to register.
 * @param {string} mac - MAC address associated with the IP.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function addARPEntry(networkObjectId, ip, mac) {

    const $arpTable = document.querySelector(`#${networkObjectId} .arp-table table`);
    const $records = $arpTable.querySelectorAll("tr");
    let found = false;

    for (let i = 1; i < $records.length; i++) {
        const $record = $records[i];
        const $fields = $record.querySelectorAll("td");
        const $recordIp = $fields[0];
        const $recordMac = $fields[1];
        if ($recordIp.innerText.trim() === ip) {
            $recordMac.innerText = mac;
            found = true;
            break;
        }
    }

    if (!found) {
        const newRow = $arpTable.insertRow();
        newRow.insertCell().innerText = ip;
        newRow.insertCell().innerText = mac;
        console.log(`ARP entry for ${ip} added to ${networkObjectId} for ${state.$ARPENTRYTTL * 1000} ms`);
        state.arpEntryTimers[`${networkObjectId}-${ip}`] = setTimeout(() => {
            console.log(`ARP entry for ${ip} in ${networkObjectId} has expired`);
            delARPEntry(networkObjectId, ip);
        }, state.$ARPENTRYTTL * 1000);
    }

}

/**
 * @description Removes the ARP entry for the given IP from the ARP table of the network object
 * and cancels its associated TTL timer.
 * @param {string} networkObjectId - DOM id of the network object whose ARP table to modify.
 * @param {string} ip - IP address of the entry to remove.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function delARPEntry(networkObjectId, ip) {

    const $arpTable = document.querySelector(`#${networkObjectId} .arp-table table`);
    const $records = $arpTable.querySelectorAll("tr");

    for (let i = 1; i < $records.length; i++) {
        const $record = $records[i];
        const $fields = $record.querySelectorAll("td");
        const recordIp = $fields[0].innerText.trim();
        if (recordIp === ip) {
            clearTimeout(state.arpEntryTimers[`${networkObjectId}-${ip}`]);
            delete state.arpEntryTimers[`${networkObjectId}-${ip}`];
            $record.remove();
            break;
        }
    }

}

/**
 * @description Looks up an IP address in the ARP table of a network object and returns its
 * associated MAC address, or `false` if the IP is not found.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} ipAddress - IP address to look up.
 * @returns {string|false} The MAC address string if found, otherwise `false`.
 */
// [agent-added: esm-migration phase 05]
export function isIpInARPTable(networkObjectId, ipAddress) {

    const arpTable = getARPTable(networkObjectId);

    for (let i = 0; i < arpTable.length; i++) {
        const arpRow = arpTable[i];
        const mac = arpRow[1];
        const ip = arpRow[0];

        if (ip === ipAddress) {
            return mac;
        }
    }

    return false;

}

/**
 * @description Returns the outer HTML of the ARP table element for the given network object.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {string} The `outerHTML` string of the ARP `<table>` element.
 */
// [agent-added: esm-migration phase 05]
export function getcurrentARPTable(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    return $networkObject.querySelector(".arp-table table").outerHTML;
}

/**
 * @description Removes all entries from the ARP table of the given network object and cancels
 * all associated TTL timers.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function clearARPTable(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const $arpTable = $networkObject.querySelector(".arp-table table");
    const $entries = $arpTable.querySelectorAll("tr");

    for (let i = 1; i < $entries.length; i++) {
        const $entry = $entries[i];
        const $fields = $entry.querySelectorAll("td");
        const entryIp = $fields[0].innerText.trim();
        clearTimeout(state.arpEntryTimers[`${networkObjectId}-${entryIp}`]);
        delete state.arpEntryTimers[`${networkObjectId}-${entryIp}`];
        $entries[i].remove();
    }

}
