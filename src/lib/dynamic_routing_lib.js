/**
 * @description Rebuilds the global `nodes`, `nodesIp`, and `nodesNetmask` maps by scanning all
 * network objects on the board that have IPv4 forwarding enabled. Each router's interfaces are
 * iterated and their network addresses, IPs, and netmasks are recorded.
 * @returns {void}
 */
function getNodes() {

    nodes = {};
    nodesIp = {};
    nodesNetmask = {};

    const $routerElements = Array.from(document.querySelectorAll(".item-dropped"))
    .filter($networkObject => $networkObject.getAttribute("ipv4-forwarding") === "true");

    for (let i = 0; i < $routerElements.length; i++) {

        const $router = $routerElements[i];
        const interfaces = getInterfaces($router.id);

        interfaces.forEach((iface) => {

            if (!nodes[$router.id]) nodes[$router.id] = [];
            if (!nodesIp[$router.id]) nodesIp[$router.id] = [];
            if (!nodesNetmask[$router.id]) nodesNetmask[$router.id] = [];

            const ip = $router.getAttribute("ip-" + iface);
            const netmask = $router.getAttribute("netmask-" + iface);
            const network = getNetwork(ip, netmask);

            if (ip) {
                nodes[$router.id].push(network);
                nodesIp[$router.id].push(ip);
                nodesNetmask[$router.id].push(netmask);
            }

        });

    }

}

/**
 * @description Returns a deduplicated list of all network addresses reachable by any router on
 * the board. Internally calls `getNodes` to refresh the routing topology.
 * @returns {string[]} Array of unique network address strings (e.g. ["192.168.1.0", "10.0.0.0"]).
 */
function getAllNetworks() {
    let networks = [];
    getNodes();
    for (const routerId in nodes) {
        networks = networks.concat(nodes[routerId]);
    }
    //remove duplicates
    networks = networks.filter((item, index) => networks.indexOf(item) === index);
    return networks;
}

/**
 * @description Finds the shortest hop-count path between two network addresses using Dijkstra's
 * algorithm on the router topology graph. Returns the sequence of router interface IPs that form
 * the path.
 * @param {string} startNetwork - Network address of the source (e.g. "192.168.1.0").
 * @param {string} endNetwork - Network address of the destination (e.g. "10.0.0.0").
 * @returns {string[]} Ordered array of interface IP addresses forming the path from source to
 *   destination. Empty if no path exists.
 */
function findShortestPath(startNetwork, endNetwork) {

    getNodes();

    const networkTopology = nodes;
    const graph = buildGraphFromNetwork(networkTopology);
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Normalize input: if startNetwork or endNetwork are interfaces
    // on the same router, pick a consistent interface
    const startRouters = getRoutersForNetwork(startNetwork);
    const endRouters = getRoutersForNetwork(endNetwork);

    // Dijkstra initialization
    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
        unvisited.add(node);
    }

    distances[startNetwork] = 0;

    while (unvisited.size > 0) {

        // Find the unvisited node with the smallest distance
        let current = null;
        let minDistance = Infinity;

        for (const node of unvisited) {
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                current = node;
            }
        }

        // No path exists or we have reached the destination
        if (current === null || current === endNetwork) {
            break;
        }

        // Mark as visited
        unvisited.delete(current);

        // Update neighbor distances
        for (const neighbor of graph[current]) {
            const distance = distances[current] + 1; // each hop has a weight of 1

            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = current;
            }
        }
    }

    // Reconstruct the path with identifiers
    const pathNodes = [];
    let current = endNetwork;

    while (current !== null) {
        pathNodes.unshift(current);
        current = previous[current];
    }

    // Convert the node path to IPs
    const pathIPs = mapPathToIPs(pathNodes);

    return pathIPs;

}

/**
 * @description Returns the list of router DOM ids that have the given network address in their
 * interface list (as recorded in the global `nodes` map).
 * @param {string} network - Network address to search for (e.g. "192.168.1.0").
 * @returns {string[]} Array of router DOM ids that are directly connected to `network`.
 */
function getRoutersForNetwork(network) {
    const routers = [];
    for (const routerId in nodes) {
        if (nodes[routerId].includes(network)) {
            routers.push(routerId);
        }
    }
    return routers;
}

/**
 * @description Converts an ordered array of network-address path nodes into the corresponding
 * router interface IP addresses. For each consecutive pair of nodes the function selects the
 * interface IP of the router that connects both networks.
 * @param {string[]} pathNodes - Ordered array of network addresses forming the path.
 * @returns {string[]} Array of interface IP addresses (one per hop transition).
 */
function mapPathToIPs(pathNodes) {
    const pathIPs = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
        const currentNode = pathNodes[i];
        const nextNode = pathNodes[i + 1];

        let chosenIp = null;

        for (const routerId in nodes) {
            const index = nodes[routerId].indexOf(currentNode);
            if (index !== -1 && nodes[routerId].includes(nextNode)) {
                chosenIp = nodesIp[routerId][index];
                break; // take the IP that actually connects to the next path node
            }
        }

        if (chosenIp) {
            pathIPs.push(chosenIp);
        } else {
            console.warn(`No IP found for connection ${currentNode} -> ${nextNode}`);
        }
    }

    return pathIPs;
}

/**
 * @description Builds an adjacency-list graph where each node is a network address and edges
 * connect networks that share a common router.
 * @param {Object.<string, string[]>} networkTopology - Map of routerId → array of network addresses.
 * @returns {Object.<string, string[]>} Adjacency list where each key is a network address and the
 *   value is an array of directly reachable network addresses.
 */
function buildGraphFromNetwork(networkTopology) {

    const graph = {};
    const routerMap = {}; // map networks to their routers

    // Initialize the graph with all networks
    for (const router in networkTopology) {
        for (const network of networkTopology[router]) {
            if (!graph[network]) {
                graph[network] = [];
            }

            // Record which router handles this network
            if (!routerMap[network]) {
                routerMap[network] = [];
            }
            routerMap[network].push(router);
        }
    }

    // Connect networks across different routers
    for (const network in routerMap) {
        const routers = routerMap[network];

        for (const router of routers) {
            // Get all other networks reachable from this router
            const routerNetworks = networkTopology[router];

            for (const connectedNetwork of routerNetworks) {
                if (connectedNetwork !== network) {
                    graph[network].push(connectedNetwork);
                }
            }
        }
    }

    return graph;
}

/**
 * @description Computes the next-hop entries that a router reachable from `startNetwork` should
 * use to reach every other known network. Returns a matrix where each row is
 * `[targetNetwork, netmask, nextHopIp]`.
 * @param {string} startNetwork - Network address of the router whose next-hops to compute.
 * @returns {Array<[string, string, string]>} Array of [destination, netmask, nextHop] tuples.
 */
function getNextHop(startNetwork) {

    const networks = getAllNetworks();
    const nextHop = [];

    for (let i = 0; i < networks.length; i++) {
        const targetNetwork = networks[i];
        const path = findShortestPath(startNetwork, targetNetwork);

        if (path.length > 0) {
            let netmask = null;
            for (const routerId in nodes) {
                const networkIndex = nodes[routerId].indexOf(targetNetwork);
                if (networkIndex !== -1) {
                    netmask = nodesNetmask[routerId][networkIndex];
                    break;
                }
            }

            if (path[1]) {
                nextHop.push([targetNetwork, netmask, path[1]]);
            }
        }
    }

    return nextHop;
}

/**
 * @description Computes the full set of remote routing rules for the given router by combining
 * shortest-path next-hops with the router's direct routes to verify reachability, then groups the
 * result using the default-route heuristic.
 * @param {string} routerId - DOM id of the router element.
 * @returns {Array<Array<string>>} Matrix of route rows, each containing
 *   [destination, netmask, nextHop, gateway, interface].
 */
function getRoutes(routerId) {

    const $router = document.getElementById(routerId); //get the router element
    const validNetworks = [];
    const routingTable = $router.querySelector('.routing-table').querySelector('table');
    const $directRoutingRules = routingTable.querySelectorAll(".direct-route");
    let matrix = [];

    $directRoutingRules.forEach($routingRule => {
        const $fields = $routingRule.querySelectorAll('td');
        const destination = $fields[0].innerText;
        const netmask = $fields[1].innerText;
        const iface = $fields[3].innerText;
        const gateway = $fields[2].innerText;
        validNetworks.push([destination, netmask, gateway, iface]); //store the networks directly connected to this router
        matrix.push(getNextHop(destination));
    });

    matrix = matrix.reduce((a, b) => a.concat(b), []); //juntamos las matrices de todas las redes

    //verify that each next-hop belongs to one of the directly connected networks

    // eslint-disable-next-line no-useless-assignment
    let flag = false;

    for (let i = 0; i < matrix.length; i++) {

        const nextHop = matrix[i][2];
        flag = false;

        for (let j = 0; j < validNetworks.length; j++) {
            const network = validNetworks[j][0];
            const netmask = validNetworks[j][1];
            if (getNetwork(nextHop, netmask) === network) { //next-hop is on this network; add the interface and gateway to the row
                flag = true;
                matrix[i].push(validNetworks[j][2]);
                matrix[i].push(validNetworks[j][3]);
                break;
            }
        }

        if (!flag) { //elimino esa entrada de la matriz
            matrix.splice(i, 1);
            i--;
        }

    }

    return groupByDefaultRules(removeDuplicateRows(matrix));

}

/**
 * @description Removes duplicate rows from a matrix by comparing JSON-serialised row values.
 * @param {Array<Array<string>>} matrix - Matrix of route rows.
 * @returns {Array<Array<string>>} Matrix with duplicate rows removed.
 */
function removeDuplicateRows(matrix) {

    if (!matrix.length) return [];

    const uniqueMatrix = [];
    const seen = new Set();

    for (let i = 0; i < matrix.length; i++) {
        const rowStr = JSON.stringify(matrix[i]);

        if (!seen.has(rowStr)) {
            seen.add(rowStr);
            uniqueMatrix.push(matrix[i]);
        }
    }

    return uniqueMatrix;
}

/**
 * @description Inserts the remote routing rules computed by `getRoutes` into the given router's
 * routing table via `setRemoteRoutingRule`.
 * @param {string} $routerObjectId - DOM id of the router element.
 * @returns {void}
 */
function autoInputRules($routerObjectId) {

    const matrix = getRoutes($routerObjectId);

    for (let i = 0; i < matrix.length; i++) {
        const destination = matrix[i][0];
        const netmask = matrix[i][1];
        const nexthop = matrix[i][2];
        const gateway = matrix[i][3];
        const iface = matrix[i][4];
        setRemoteRoutingRule($routerObjectId, destination, netmask, gateway, iface, nexthop);
    }

}

/**
 * @description Condenses the route matrix by replacing the most-used next-hop (or the
 * pre-configured `defaultNetwork` next-hop) with a single default route (`0.0.0.0/0.0.0.0`).
 * When `defaultNetwork` is set, that network's next-hop is always promoted to the default route
 * regardless of count.
 * @param {Array<Array<string>>} matrix - Route matrix rows: [destination, netmask, nextHop, gateway, interface].
 * @returns {Array<Array<string>>} Condensed matrix with a default route entry appended where applicable.
 */
function groupByDefaultRules(matrix) {

    const hopCounter = {};
    const newMatrix = [];
    let nextHopDefault;

    if (defaultNetwork === "") { //group by the next-hop with the most rules

        for (let i = 0; i < matrix.length; i++) {
            const nextHop = matrix[i][2];
            hopCounter[nextHop] = {
                count: hopCounter[nextHop] ? hopCounter[nextHop].count + 1 : 1,
                gateway: matrix[i][3],
                interface: matrix[i][4]
            };
        }

        const maxCount = Math.max(...Object.values(hopCounter).map(hop => hop.count));
        const maxInst = Object.keys(hopCounter).filter(key => hopCounter[key].count === maxCount);

        if (maxCount > 1) { //found a candidate for the default route

            const maxInstGateway = hopCounter[maxInst[0]].gateway;
            const maxInstInterface = hopCounter[maxInst[0]].interface;
            let j = 0;

            for (let i = 0; i < matrix.length; i++) {
                const nextHop = matrix[i][2];
                if (nextHop !== maxInst[0]) {
                    newMatrix[j] = matrix[i];
                    j++;
                }
            }

            newMatrix[newMatrix.length] = ["0.0.0.0", "0.0.0.0", maxInst[0], maxInstGateway, maxInstInterface];

            return newMatrix;

        }

        return matrix;

    } else { //group by most rules per next-hop, but always promote the pre-configured default network

        let defaultInterface;
        let defaultGateway;

        for (let i = 0; i < matrix.length; i++) {
            const network = matrix[i][0];
            const nextHop = matrix[i][2];
            if (network === defaultNetwork) { //save the next-hop for the default route
                nextHopDefault = nextHop;
                defaultInterface = matrix[i][4];
                defaultGateway = matrix[i][3];
            }
        }

        let j = 0;

        for (let i = 0; i < matrix.length; i++) {
            const nextHop = matrix[i][2];
            if (nextHop !== nextHopDefault) {
                newMatrix[j] = matrix[i];
                j++;
            }
        }

        newMatrix[newMatrix.length] = ["0.0.0.0", "0.0.0.0", nextHopDefault, defaultGateway, defaultInterface];

        return newMatrix;

    }


}

/**
 * @description Runs the full dynamic routing update cycle: clears all remote (non-direct) routing
 * rules from every IPv4-forwarding-enabled router on the board and recomputes them via
 * `autoInputRules`.
 * @returns {void}
 */
function dynamicRouting() {

    const $routers = Array.from(document.querySelectorAll(".item-dropped"))
    .filter($networkObject => $networkObject.getAttribute("ipv4-forwarding") === "true");

    for (let i = 0; i < $routers.length; i++) {
        removeRemoteRules($routers[i].id);
        autoInputRules($routers[i].id);
    }

}
