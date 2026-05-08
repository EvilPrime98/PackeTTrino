/**
 * Installs the iptables firewall package on a network object.
 * Initialises default chain policies (ACCEPT for INPUT, OUTPUT, and FORWARD) and
 * empty rule sets for the FILTER and NAT tables, storing both as JSON-serialised
 * HTML attributes on the element.
 *
 * @param {HTMLElement} $networkObject - The DOM element representing the network device.
 * @returns {void}
 */
function installIptables($networkObject) {

    const networkObjectId = $networkObject.id;

    terminalMessage("Installing Iptables...", networkObjectId);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    const defaultPolicies = {
        "INPUT": "ACCEPT",
        "OUTPUT": "ACCEPT",
        "FORWARD": "ACCEPT"
    }

    const firewallRules = {
        "FILTER": [],
        "NAT": []
    }

    attr("firewall-default-policy", JSON.stringify(defaultPolicies));
    attr("firewall-rules", JSON.stringify(firewallRules));

    terminalMessage("Iptables installed successfully.", networkObjectId);

}
