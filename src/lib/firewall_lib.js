/**
 * @description Represents a single iptables-style firewall rule with default wildcard values for
 * all match fields. Fields map to iptables options: `t` (table), `A` (chain), `p` (protocol),
 * `s`/`d` (source/dest IP), `i`/`o` (in/out interface), `sport`/`dport` (ports), `j` (action).
 */
class iptablesRule {
    constructor() {
        this.t = "filter"; //table
        this.A = ""; //chain
        this.p = "*"; //protocol
        this.s = "*"; //source ip
        this.d = "*"; //destination ip
        this.i = "*"; //input interface
        this.o = "*"; //output interface
        this.sport = "*"; //source port
        this.dport = "*"; //destination port
        this.j = ""; //action
        this.to__destination = ""; //destination
        this.to__source = ""; //source
    }
}

/**
 * @description Sets the default policy for a firewall chain (INPUT, OUTPUT, or FORWARD) on a
 * network device.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} chain - Chain name: "INPUT", "OUTPUT", or "FORWARD".
 * @param {string} action - Policy action: "ACCEPT", "DROP", or "REJECT".
 * @returns {void}
 * @throws {Error} If `chain` or `action` is not one of the accepted values.
 */
function setFirewallDefaultPolicy(networkObjectId, chain, action) {
    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicies = JSON.parse($networkObject.getAttribute("firewall-default-policy"));
    const validChains = ["INPUT", "OUTPUT", "FORWARD"];
    const validActions = ["ACCEPT", "DROP", "REJECT"];
    if (!validChains.includes(chain)) throw new Error("iptables: Bad built-in chain name.");
    if (!validActions.includes(action)) throw new Error("iptables: Bad policy name.");
    defaultPolicies[chain] = action;
    $networkObject.setAttribute("firewall-default-policy", JSON.stringify(defaultPolicies));
}

/**
 * @description Returns the default firewall policies for a network device as an object keyed by
 * chain name.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {Object.<string, string>} Object mapping chain names ("INPUT", "OUTPUT", "FORWARD") to
 *   their default policy ("ACCEPT", "DROP", or "REJECT").
 */
function getFirewallDefaultPolicy(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    return JSON.parse($networkObject.getAttribute("firewall-default-policy"));
}

/**
 * @description Returns all active firewall rules for a network device as an array of human-readable
 * strings, each representing one rule's non-wildcard/non-empty fields in `-key value` format.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {string[]} Array of rule strings (one per rule).
 */
function getFirewallTable(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules"));
    const response = [];
    for (const table in firewallRules) {
        const rules = firewallRules[table];
        rules.forEach(rule => {
            let ruleString = "";
            for (const key in rule) if (rule[key] !== "*" && rule[key] !== "") ruleString += `-${key} ${rule[key]} `;
            response.push(ruleString);
        });
    }
    return response;
}

/**
 * @description Validates a firewall rule object against allowed tables, chains, protocols,
 * actions, and interfaces for the given network device.
 * @param {iptablesRule} rule - The rule object to validate.
 * @param {string} networkObjectId - DOM id of the network object (used to retrieve valid interfaces).
 * @returns {void}
 * @throws {Error} If any field in the rule is invalid.
 */
function isValidFirewallRule(rule, networkObjectId) {

    const validTables = ["filter", "nat"];
    const validFilterChains = ["INPUT", "OUTPUT", "FORWARD"];
    const validProtocols = ["tcp", "udp", "icmp"];
    const validFilterActions = ["ACCEPT", "DROP", "REJECT"];
    const validNATActions = ["DNAT", "SNAT", "MASQUERADE"];
    const validInterfaces = getInterfaces(networkObjectId);

    if (!validTables.includes(rule.t)) throw new Error(`Error: table ${rule.t} not recognized`);

    if (rule.t === "filter") {

        if (!validFilterChains.includes(rule.A)) throw new Error(`Error: chain ${rule.A} not allowed.`);

        if (!validFilterActions.includes(rule.j)) throw new Error(`Error: action ${rule.j} not allowed.`);

    }

    if (rule.t === "nat") {

        if (!validNATActions.includes(rule.j)) throw new Error(`Error: action ${rule.j} not allowed.`);

        if (rule.j === "DNAT") {
            if (rule.A !== "PREROUTING") throw new Error(`Error: chain ${rule.A} not allowed with DNAT.`);
            if (!isValidIp(rule.to__destination)) throw new Error(`Error: destination ${rule.to__destination} not allowed for DNAT.`);
        }

        if (rule.j === "SNAT") {
            if (rule.A !== "POSTROUTING") throw new Error(`Error: chain ${rule.A} not allowed with SNAT.`);
            if (!isValidIp(rule.to__source)) throw new Error(`Error: source ${rule.to__source} not allowed for SNAT.`);
        }

    }

    if (rule.p !== "*" && !validProtocols.includes(rule.p)) throw new Error(`Error: protocol ${rule.p} not recognized`);

    if (rule.i !== "*" && !validInterfaces.includes(rule.i)) throw new Error(`Error: interface ${rule.i} not recognized`);

    if (rule.s !== "*" && !isValidIp(rule.s) && !isValidCidrIp(rule.s)) throw new Error("Error: invalid source IP");

    if (rule.d !== "*" && !isValidIp(rule.d) && !isValidCidrIp(rule.d)) throw new Error("Error: invalid destination IP");

    if (rule.sport !== "*" && !rule.sport.match(/^\d+$/)) throw new Error("Error: invalid source port");

    if (rule.dport !== "*" && !rule.dport.match(/^\d+$/)) throw new Error("Error: invalid destination port");

}

/**
 * @description Appends a new firewall rule to the appropriate table in the device's
 * `firewall-rules` attribute.
 * @param {string} routerObjectId - DOM id of the router/firewall device.
 * @param {iptablesRule} newRule - The validated rule object to add.
 * @returns {void}
 */
function addFirewallRule(routerObjectId, newRule) {
    const $networkObject = document.getElementById(routerObjectId);
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules")); //array of rules
    const table = (newRule.t).toUpperCase();
    firewallRules[table].push(newRule);
    $networkObject.setAttribute("firewall-rules", JSON.stringify(firewallRules));
}

/**
 * @description Removes the firewall rule whose first cell in the visual firewall table matches
 * the given id string.
 * @param {string} routerObjectId - DOM id of the router/firewall device.
 * @param {string} id - Identifier value displayed in the first `<td>` of the rule row.
 * @returns {void}
 */
function deleteFirewallRule(routerObjectId, id) {

    const $networkObject = document.getElementById(routerObjectId);
    const ruleTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rows = ruleTable.querySelectorAll("tr");
    let found = false;
    let i = 1;

    while (!found && i < rows.length) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[0].innerHTML === id) {
            row.remove();
            found = true;
        }
        i++;
    }

}

/**
 * @description Removes all (or chain-specific) firewall rules from the device's `firewall-rules`
 * attribute.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} [chain="ALL"] - Chain name to clear ("INPUT", "OUTPUT", "FORWARD"), or "ALL"
 *   to clear every rule in every table.
 * @returns {void}
 */
function clearFirewall(networkObjectId, chain = "ALL") {
    const $networkObject = document.getElementById(networkObjectId);
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules")); //firewallRules object
    for (const table in firewallRules) {
        const rules = firewallRules[table]; //array of rule objects
        rules.forEach(rule => { //rule object
            if (chain === "ALL" || rule.A === chain) rules.splice(rules.indexOf(rule), 1);
        });
    }
    $networkObject.setAttribute("firewall-rules", JSON.stringify(firewallRules));
}
