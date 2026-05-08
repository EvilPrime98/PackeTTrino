/**
 * Handles the `iptables` terminal command to manage firewall rules on a network object.
 *
 * Supports the following operations:
 * - `-S`: prints current default policies and all firewall rules.
 * - `-P <chain> <policy>`: sets the default policy for a chain.
 * - `-F [chain]`: clears all rules in a chain (or all chains).
 * - `-D <rule-number>`: deletes a specific rule by its index.
 * - Any other combination: parses `-t`, `-A`, `-p`, `-i`, `-o`, `-s`, `-d`,
 *   `--sport`, `--dport`, `-j`, `--to-destination`, `--to-source` into an
 *   `iptablesRule` object, validates it, and appends it.
 *
 * Validation and rule-addition errors are caught and printed to the terminal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Tokenised command arguments. First element is "iptables".
 * @returns {void}
 */
function command_Iptables(networkObjectId, args) {

    if (args[1] === "-S") {
        const defaultPolicies = getFirewallDefaultPolicy(networkObjectId);
        const firewallRules = getFirewallTable(networkObjectId);
        for (const policy in defaultPolicies) terminalMessage(`-P ${policy} ${defaultPolicies[policy]}`, networkObjectId);
        firewallRules.forEach(rule => terminalMessage(rule.replace(/_/g, "-"), networkObjectId));
        return;
    }

    if (args[1] === "-P") {

        try {
            setFirewallDefaultPolicy(networkObjectId, args[2], args[3]);
        } catch (error) {
            terminalMessage(error.message, networkObjectId);
        }

        return;
    }

    if (args[1] === "-F") {
        clearFirewall(networkObjectId, args[2]);
        return;
    }

    if (args[1] === "-D") {
        deleteFirewallRule(networkObjectId, args[2]);
        terminalMessage("The rule has been successfully deleted.", networkObjectId);
        return;
    }

    const rule = new iptablesRule();

    const $OPTS = catchopts([
        "-t:", //table
        "-A:", //chain
        "-p:", //protocol
        "-i:", //input interface
        "-o:", //output interface
        "-s:", //source ip
        "-d:", //destination ip
        "--sport:", //source port
        "--dport:", //destination port
        "-j:", //jump
        "--to-destination:", //jump to destination ip
        "--to-source:"], //jump to source ip
    args);

    const optionHandlers = {
        "-t": () => rule.t = $OPTS["-t"],
        "-A": () => rule.A = $OPTS["-A"],
        "-p": () => rule.p = $OPTS["-p"],
        "-i": () => rule.i = $OPTS["-i"],
        "-o": () => rule.o = $OPTS["-o"],
        "-s": () => rule.s = $OPTS["-s"],
        "-d": () => rule.d = $OPTS["-d"],
        "--sport": () => rule.sport = $OPTS["--sport"],
        "--dport": () => rule.dport = $OPTS["--dport"],
        "-j": () => rule.j = $OPTS["-j"],
        "--to-destination": () => rule.to__destination = $OPTS["--to-destination"],
        "--to-source": () => rule.to__source = $OPTS["--to-source"]
    }

    for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

    try {
        isValidFirewallRule(rule, networkObjectId);
        addFirewallRule(networkObjectId, rule);
    } catch (error) {
        terminalMessage(error.message, networkObjectId);
    }

}
