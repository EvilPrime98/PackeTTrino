/**
 * Renders the manual page for the given topic on the terminal.
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {*} topic - Topic to display.
 * @returns {void}
 */
function command_man(networkObjectId, topic) {

    const topicsMapper = {
        "man": manual_man,
        "ip": manual_ip,
        "nano": manual_nano,
        "apt": manual_apt,
        "arp": manual_arp,
        "dig": manual_dig,
        "dns": manual_dns,
        "mkdir": manual_mkdir,
        "touch": manual_touch,
        "ls": manual_ls,
        "rm": manual_rm,
        "cd": manual_cd,
        "cat": manual_cat,
        "ifup": manual_ifup,
        "ifdown": manual_ifdown,
        "iptables": manual_Iptables,
        "ping": manual_ping,
        "systemctl": manual_systemctl,
        "traceroute": manual_traceroute,
        "visual": manual_visual,
        "curl": manual_curl,
        "realnode": manual_realnode,
        "cp": manual_cp,
        "iface": manual_iface,
    }

    topicsMapper[topic]
    ? terminalMessage(topicsMapper[topic](), networkObjectId)
    : terminalMessage(`Error: unknown command ${topic}.`, networkObjectId);

}

function manual_ip(){
    let message = '';
    message += 'NAME\n';
    message += '    ip - Utility for configuring IP addresses and routes on simulated network objects\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    ip [ addr | route ] [ add | flush | del ] [ip/prefix] [dev interface] [via ip]\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    The ip utility allows configuring IP addresses or routing rules on simulated\n';
    message += '    network objects. Operations are divided into two main categories:\n';
    message += '    addr    Manages IP addresses on interfaces\n';
    message += '    route   Manages IP routing rules\n';
    message += '\n';
    message += 'SUBCOMMANDS\n';
    message += '    addr\n';
    message += '        add [ip/prefix] dev [interface]\n';
    message += '            Assigns an IP address to a specific interface.\n';
    message += '        flush dev [interface]\n';
    message += '            Removes any IP address assigned to the interface.\n';
    message += '\n';
    message += '    route\n';
    message += '        add [ip/prefix|default] via [ip] dev [interface]\n';
    message += '            Adds a new route to a network or towards the default route.\n';
    message += '        del [ip/prefix]\n';
    message += '            Removes a previously added route.\n';
    message += '\n';
    message += 'ARGUMENTS\n';
    message += '    ip/prefix\n';
    message += '        IP address and CIDR prefix length (e.g. 192.168.1.0/24).\n';
    message += '    default\n';
    message += '        Keyword to specify the default route (equivalent to 0.0.0.0/0).\n';
    message += '    interface\n';
    message += '        Interface name on the network object (e.g. enp0s3).\n';
    message += '    ip\n';
    message += '        Valid IP address used as next hop (gateway).\n';
    message += '\n';
    message += 'EXAMPLES\n';
    message += '    ip addr add 192.168.1.1/24 dev enp0s3\n';
    message += '        Assigns IP 192.168.1.1/24 to interface enp0s3.\n';
    message += '    ip addr flush dev enp0s3\n';
    message += '        Removes any IP assigned to enp0s3.\n';
    message += '    ip route add 10.0.0.0/8 via 192.168.1.254 dev enp0s3\n';
    message += '        Adds a route to reach 10.0.0.0/8 through gateway 192.168.1.254 via enp0s3.\n';
    message += '    ip route del 10.0.0.0/8\n';
    message += '        Removes the route for 10.0.0.0/8.\n';
    message += '\n';
    message += 'NOTES\n';
    message += '    If the subcommand (add, flush, del) is omitted, the current configuration will be shown.\n';
    message += '\n';
    message += 'COMMON ERRORS\n';
    message += '    - Using add and flush/del simultaneously\n';
    message += '    - Unrecognized interfaces\n';
    message += '    - Invalid CIDR format in addresses\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';
    return message;
}

function manual_nano(){
    let message = '';
    message += 'NAME\n';
    message += '    nano - Text editor for viewing and modifying files on simulated network objects\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    nano [file]\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    Opens a file in the simulator visual editor, allowing the user to view\n';
    message += '    and modify its content. The file must exist within the object\'s filesystem.\n';
    message += '\n';
    message += 'ARGUMENTS\n';
    message += '    file\n';
    message += '        Relative or absolute path of the file to open (e.g. /etc/config.txt).\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';

    return message;
}

function manual_apt() {
    let message = '';
    message += 'NAME\n';
    message += '    apt - Package management tool for simulated systems\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    apt [install|remove] <package-name>\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    The apt command allows installing or removing packages within the system.\n';
    message += '    It uses dpkg as the low-level manager to complete operations.\n';
    message += '\n';
    message += 'SUBCOMMANDS\n';
    message += '    install <package>\n';
    message += '        Installs the specified package and its associated services.\n';
    message += '\n';
    message += '    remove <package>\n';
    message += '        Removes the specified package and its associated services.\n';
    message += '\n';
    message += 'ARGUMENTS\n';
    message += '    <package>\n';
    message += '        Name of the package to install or remove. Available packages:\n';
    message += '            apache2, bind9, isc-dhcp-server, isc-dhcp-relay, isc-dhcp-client\n';
    message += '\n';
    message += 'HOW IT WORKS\n';
    message += '    - Verifies that the subcommand is valid (install or remove).\n';
    message += '    - Displays informational messages to the user.\n';
    message += '    - Runs dpkg to perform the installation or removal of the package.\n';
    message += '\n';
    message += 'EXAMPLES\n';
    message += '    apt install apache2\n';
    message += '        Installs the apache2 package.\n';
    message += '    apt remove bind9\n';
    message += '        Removes the bind9 package.\n';
    message += '\n';
    message += 'PACKAGE-TO-SERVICE MAPPING\n';
    message += '    apache2           -> apache\n';
    message += '    bind9             -> named\n';
    message += '    isc-dhcp-server   -> dhcpd\n';
    message += '    isc-dhcp-relay    -> dhcrelay\n';
    message += '    isc-dhcp-client   -> dhclient\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';


    return message;
}

function manual_arp() {
    let message = '';
    message += 'NAME\n';
    message += '    arp - Displays or manages the system ARP table\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    arp -a\n';
    message += '    arp -f | --flush\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    The arp command allows viewing or flushing the system ARP table.\n';
    message += '\n';
    message += 'OPTIONS\n';
    message += '    -a\n';
    message += '        Displays the current contents of the ARP table.\n';
    message += '\n';
    message += '    -f, --flush\n';
    message += '        Clears the ARP table, removing all stored entries.\n';
    message += '\n';
    message += 'EXAMPLES\n';
    message += '    arp -a\n';
    message += '        Displays all current ARP entries.\n';
    message += '\n';
    message += '    arp -f\n';
    message += '        Removes all ARP entries.\n';
    message += '\n';
    message += '    arp --flush\n';
    message += '        Removes all ARP entries (long form).\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';
    return message;
}

function manual_dig() {
    let message = '';
    message += 'NAME\n';
    message += '    dig - Performs DNS queries on domain names or IP addresses\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    dig [options] <domain|ip>\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    This command allows querying specific DNS records, such as A, AAAA, NS, MX, SOA or PTR.\n';
    message += '    It can be used for forward or reverse queries, and to specify a particular DNS server.\n';
    message += '\n';
    message += 'OPTIONS\n';
    message += '    -x\n';
    message += '        Performs a reverse lookup (PTR) on an IP address.\n';
    message += '\n';
    message += '    -t <type>\n';
    message += '        Specifies the DNS record type to query. Valid values: A, NS, SOA, PTR.\n';
    message += '\n';
    message += '    @ <ip>\n';
    message += '        Specifies the IP address of the DNS server to use for the query.\n';
    message += '\n';
    message += 'EXAMPLES\n';
    message += '    dig google.com\n';
    message += '        Queries the A record of google.com using the default DNS server.\n';
    message += '\n';
    message += '    dig -t SOA gmail.com\n';
    message += '        Queries the SOA record of gmail.com.\n';
    message += '\n';
    message += '    dig -x 8.8.8.8\n';
    message += '        Performs a reverse lookup for IP 8.8.8.8.\n';
    message += '\n';
    message += '    dig @ 192.168.1.1 example.org\n';
    message += '        Queries the A record of example.org using DNS server 192.168.1.1.\n';
    message += '\n';
    message += 'COMMON ERRORS\n';
    message += '    - Unlike Linux, the @ option must not be joined to the DNS server (@8.8.8.8 is not valid)\n';
    message += '    - Specifying an invalid record type\n';
    message += '    - Specifying an invalid IP address\n';
    message += '    - Specifying an invalid DNS server\n';
    message += '\n';
    message += 'NOTES\n';
    message += '    - Domain names may optionally end with a dot (.)\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';
    return message;
}

function manual_dns() {
    let message = '';
    message += 'NAME\n';
    message += '    dns - Manages DNS records on the current server\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    dns <add|del> [-t <type>] <domain> <value>\n';
    message += '    dns -s | --show\n';
    message += '    dns -f | --flush\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    Allows viewing, adding, deleting, and clearing DNS records on the system.\n';
    message += '    Only available if the DNS service (named) is active.\n';
    message += '\n';
    message += 'OPTIONS\n';
    message += '    -s, --show\n';
    message += '        Displays the current DNS records table.\n';
    message += '\n';
    message += '    -f, --flush\n';
    message += '        Removes all records from the DNS table.\n';
    message += '\n';
    message += '    add [-t <type>] <domain> <value>\n';
    message += '        Adds a DNS record. If no type is specified, A is assumed.\n';
    message += '        Supported types: A, SOA, NS, CNAME, PTR\n';
    message += '\n';
    message += '    del <type> <domain>\n';
    message += '        Removes a specific DNS record.\n';
    message += '\n';
    message += 'EXAMPLES\n';
    message += '    dns add example.com 192.168.1.1\n';
    message += '        Adds an A record for example.com pointing to 192.168.1.1.\n';
    message += '\n';
    message += '    dns add -t CNAME www example.com\n';
    message += '        Adds a CNAME record for www pointing to example.com.\n';
    message += '\n';
    message += '    dns del A example.com\n';
    message += '        Removes the A record associated with example.com.\n';
    message += '\n';
    message += '    dns -s\n';
    message += '        Displays the current DNS records table.\n';
    message += '\n';
    message += '    dns -f\n';
    message += '        Clears all records from the DNS table.\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';
    return message;
}

function manual_mkdir() {
    let message = "";
    message += "NAME\n";
    message += "    mkdir - creates a new directory in the filesystem\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    mkdir <path>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Creates a new directory at the specified path.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    mkdir /etc/config\n";
    message += "        Creates the directory 'config' inside '/etc'.\n";
    return message;
}

function manual_touch() {
    let message = "";
    message += "NAME\n";
    message += "    touch - creates an empty file at the specified path\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    touch <path>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Creates an empty file at the given path. If the file already exists, it is not modified.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    touch /home/user/info.txt\n";
    message += "        Creates a file 'info.txt' in the '/home/user' directory.\n";
    return message;
}

function manual_ls() {
    let message = "";
    message += "NAME\n";
    message += "    ls - lists the contents of a directory\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    ls [<path>]\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Lists the files and folders in the specified directory.\n";
    message += "    If no path is provided, the current directory is used.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    ls /etc\n";
    message += "        Displays the files and folders in the '/etc' directory.\n";
    return message;
}

function manual_rm() {
    let message = "";
    message += "NAME\n";
    message += "    rm - removes a file or directory\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    rm <path>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Removes the specified file or folder. If the element does not exist, an error is shown.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    rm /home/user/info.txt\n";
    message += "        Removes the file 'info.txt'.\n";
    return message;
}

function manual_cd() {
    let message = "";
    message += "NAME\n";
    message += "    cd - changes the current working directory\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    cd <path>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Changes the current directory to the one specified by the path.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    cd /var/log\n";
    message += "        Changes to the '/var/log' directory.\n";
    return message;
}

function manual_cat() {
    let message = "";
    message += "NAME\n";
    message += "    cat - displays the contents of a file\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    cat <file>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Displays the full contents of a file in the terminal.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    cat /etc/hosts\n";
    message += "        Displays the contents of the 'hosts' file.\n";
    return message;
}

function manual_ifup() {
    let message = "";
    message += "NAME\n";
    message += "    ifup - configures a network interface using the '/etc/network/interfaces' file\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    ifup <interface>\n";
    message += "    ifup -a\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Configures a network interface by applying the parameters defined in '/etc/network/interfaces'.\n";
    message += "    The -a option configures all interfaces defined in that file.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    ifup eth0\n";
    message += "        Configures the 'eth0' interface.\n";
    message += "\n";
    message += "    ifup -a\n";
    message += "        Configures all interfaces defined in '/etc/network/interfaces'.\n";
    return message;
}

function manual_ifdown() {
    let message = "";
    message += "NAME\n";
    message += "    ifdown - deconfigures a network interface\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    ifdown <interface>\n";
    message += "    ifdown -a\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Deactivates a network interface and removes associated routing rules.\n";
    message += "    The -a option deactivates all system interfaces.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    ifdown eth1\n";
    message += "        Deactivates the 'eth1' interface.\n";
    message += "\n";
    message += "    ifdown -a\n";
    message += "        Deactivates all available network interfaces.\n";
    return message;
}

function manual_Iptables() {
    let message = "";
    message += "NAME\n";
    message += "    iptables - manage firewall rules on a system\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    iptables -S\n";
    message += "    iptables -P <chain> <policy>\n";
    message += "    iptables -F <chain>\n";
    message += "    iptables -D <rule number>\n";
    message += "    iptables -t <table> -A <chain> <options>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    Manages firewall rules on the system using iptables.\n";
    message += "    Rules are applied to packets passing through the system and can be\n";
    message += "    configured to allow or block traffic according to different criteria.\n";
    message += "\n";
    message += "OPTIONS\n";
    message += "    -S\n";
    message += "        Displays default policies and the firewall table rules.\n";
    message += "    -P <chain> <policy>\n";
    message += "        Sets the default policy for the specified chain.\n";
    message += "    -F <chain>\n";
    message += "        Removes all rules from the specified chain.\n";
    message += "    -D <rule number>\n";
    message += "        Removes the rule indicated by the rule number.\n";
    message += "    -t <table>\n";
    message += "        Specifies the table to use (e.g. 'filter', 'nat').\n";
    message += "    -A <chain> <options>\n";
    message += "        Adds a new rule to a specified chain.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    iptables -S\n";
    message += "        Displays current firewall policies and rules.\n";
    message += "\n";
    message += "    iptables -P INPUT DROP\n";
    message += "        Sets the default policy of the 'INPUT' chain to 'DROP'.\n";
    message += "\n";
    message += "    iptables -F INPUT\n";
    message += "        Removes all rules from the 'INPUT' chain.\n";
    message += "\n";
    message += "    iptables -t nat -A POSTROUTING -o enp0s3 -j SNAT --to-source 192.168.1.254\n";
    message += "        Adds an outbound redirect rule to a specified interface.\n";
    return message;
}

function manual_ping() {
    let message = "";
    message += "NAME\n";
    message += "    ping - verify connectivity with another machine over the network\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    ping <ip | domain>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    The ping command is used to verify network connectivity between the system\n";
    message += "    and another host, either an IP address or a domain. It sends ICMP Echo Request\n";
    message += "    packets to the destination and waits for responses (Echo Reply), displaying\n";
    message += "    the round-trip time.\n";
    message += "\n";
    message += "    If the destination is available, a response will be received with the\n";
    message += "    round-trip time of the packets. If a connection cannot be established,\n";
    message += "    an error message will be shown.\n";
    message += "\n";
    message += "OPTIONS\n";
    message += "    <ip | domain>\n";
    message += "        IP address or domain of the host to ping.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    ping 8.8.8.8\n";
    message += "        Pings IP address 8.8.8.8 (Google's DNS server).\n";
    message += "\n";
    message += "    ping www.google.com\n";
    message += "        Pings the domain www.google.com.\n";
    message += "\n";
    message += "OUTPUT\n";
    message += "    If the ping succeeds, displays the round-trip time:\n";
    message += "        PING www.google.com (216.58.214.14) 56(84) bytes of data.\n";
    message += "        64 bytes from 216.58.214.14: icmp_seq=1 ttl=53 time=10.2 ms\n";
    message += "\n";
    message += "    If the domain name cannot be resolved:\n";
    message += "        ping: www.google.com: Name or service not known.\n";
    message += "\n";
    message += "    If the IP is not valid:\n";
    message += "        ping: 999.999.999.999: The IP address is not valid.\n";
    message += "\n";
    message += "    If the network is unreachable:\n";
    message += "        ping: connect: Network is unreachable.\n";

    return message;
}

function manual_systemctl() {
    let message = "";
    message += "NAME\n";
    message += "    systemctl - manage services on the system\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    systemctl [start|restart|stop|status] <service name>\n";
    message += "    systemctl list-units\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    The systemctl command allows managing system services, enabling\n";
    message += "    starting, stopping, restarting and checking the status of services.\n";
    message += "    It also allows listing all system units.\n";
    message += "\n";
    message += "OPTIONS\n";
    message += "    start\n";
    message += "        Starts the specified service.\n";
    message += "\n";
    message += "    restart\n";
    message += "        Restarts the specified service.\n";
    message += "\n";
    message += "    stop\n";
    message += "        Stops the specified service.\n";
    message += "\n";
    message += "    status\n";
    message += "        Displays the status of the specified service.\n";
    message += "\n";
    message += "    list-units\n";
    message += "        Displays a list of all available services and units on the system.\n";
    message += "\n";
    message += "SERVICES\n";
    message += "    dhcpd\n";
    message += "        DHCP server service.\n";
    message += "\n";
    message += "    apache\n";
    message += "        Apache web server service.\n";
    message += "\n";
    message += "    dhclient\n";
    message += "        DHCP client.\n";
    message += "\n";
    message += "    dhcrelay\n";
    message += "        DHCP relay service.\n";
    message += "\n";
    message += "    resolved\n";
    message += "        DNS resolution service.\n";
    message += "\n";
    message += "    named\n";
    message += "        DNS server service (BIND).\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    systemctl start apache\n";
    message += "        Starts the Apache service.\n";
    message += "\n";
    message += "    systemctl stop dhcpd\n";
    message += "        Stops the DHCP service.\n";
    message += "\n";
    message += "    systemctl status resolved\n";
    message += "        Displays the status of the DNS resolution service.\n";
    message += "\n";
    message += "    systemctl list-units\n";
    message += "        Displays a list of all active services on the system.\n";

    return message;
}

function manual_traceroute() {
    let message = "";
    message += "NAME\n";
    message += "    traceroute - trace the path of packets to a destination.\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    traceroute [-n] <destination>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    The traceroute command displays the path that packets follow to reach\n";
    message += "    the specified destination, showing the IP addresses of the routers\n";
    message += "    through which the packets pass, as well as the time taken to reach each one.\n";
    message += "\n";
    message += "OPTIONS\n";
    message += "    -n\n";
    message += "        If specified, domain name resolution is skipped and only\n";
    message += "        numeric IP addresses are shown.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    traceroute www.example.com\n";
    message += "        Traces the path to the domain www.example.com, showing the IP\n";
    message += "        address of each hop.\n";
    message += "\n";
    message += "    traceroute -n 8.8.8.8\n";
    message += "        Traces the path to IP address 8.8.8.8, showing only numeric\n";
    message += "        IP addresses without attempting domain name resolution.\n";

    return message;
}

function manual_man() {
    let message = "";
    message += "NAME\n";
    message += "    man - Displays the manuals for system commands.\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    man <command>\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    The man command displays the manual for available commands on the system.\n";
    message += "    It provides a brief description of each command and its syntax, including\n";
    message += "    options and usage examples.\n";
    message += "\n";
    message += "AVAILABLE COMMANDS\n";
    message += "    apt         - Package management tool for Debian-based systems.\n";
    message += "    arp         - ARP table manipulation.\n";
    message += "    cd          - Changes the working directory.\n";
    message += "    cat         - Displays the contents of a file.\n";
    message += "    cp          - Copies files or directories.\n";
    message += "    dig         - Tool for DNS queries.\n";
    message += "    dns         - Configuration and management of DNS records.\n";
    message += "    exit        - Exit the interactive terminal.\n";
    message += "    ip          - Configuration and management of IP addresses.\n";
    message += "    iface       - Manages the network interfaces of an object within the simulator.\n";
    message += "    ifup        - Configures network interfaces from the configuration file.\n";
    message += "    ifdown      - Deconfigures network interfaces.\n";
    message += "    iptables    - Configuration and management of firewall rules.\n";
    message += "    ls          - Lists the contents of a directory.\n";
    message += "    mkdir       - Creates a new directory.\n";
    message += "    nano        - Terminal text editor.\n";
    message += "    ping        - Tests connectivity to an IP or domain.\n";
    message += "    realnode    - Displays the real properties of a network object in the simulator.\n";
    message += "    rm          - Removes files or directories.\n";
    message += "    systemctl   - System service management.\n";
    message += "    touch       - Creates a new empty file.\n";
    message += "    traceroute  - Displays the route of packets to a destination.\n";
    message += "    touch       - Creates a new empty file.\n";
    message += "    visual      - Manages the visual animation of the network simulator.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    man ip        - Displays the manual for the 'ip' command.\n";
    message += "    man nano      - Displays the manual for the 'nano' command.\n";
    message += "    man traceroute - Displays the manual for the 'traceroute' command.\n";

    return message;
}

function manual_visual() {

    let message = "";
    message += "NAME\n";
    message += "    visual - Manages the visual animation of the network simulator.\n";
    message += "\n";
    message += "SYNOPSIS\n";
    message += "    visual [options]\n";
    message += "\n";
    message += "DESCRIPTION\n";
    message += "    The visual command allows managing the visual animation of the network simulator.\n";
    message += "    It can configure the animation speed and the animation mode.\n";
    message += "\n";
    message += "OPTIONS\n";
    message += "    speed <speed>\n";
    message += "        Specifies the animation speed in milliseconds.\n";
    message += "\n";
    message += "    off\n";
    message += "        Disables the visual animation.\n";
    message += "\n";
    message += "    on\n";
    message += "        Enables the visual animation.\n";
    message += "\n";
    message += "    config\n";
    message += "        Displays the current visual animation configuration.\n";
    message += "\n";
    message += "EXAMPLES\n";
    message += "    visual speed 1000\n";
    message += "        Sets the animation speed to 1000 ms.\n";
    message += "\n";
    message += "    visual off\n";
    message += "        Disables the visual animation.\n";
    message += "\n";
    message += "    visual on\n";
    message += "        Enables the visual animation.\n";
    message += "\n";
    message += "    visual config\n";
    message += "        Displays the current visual animation configuration.\n";
    return message;

}

function manual_curl(){
    let message = '';
    message += 'NAME\n';
    message += '    curl - HTTP client for making requests to servers from simulated network objects\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    curl [-m METHOD] [-h] URL\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    Makes an HTTP request to the server specified by the URL. Allows selecting\n';
    message += '    the HTTP method and displaying response headers. Used to simulate\n';
    message += '    web communications within the simulator environment.\n';
    message += '\n';
    message += 'OPTIONS\n';
    message += '    -m METHOD\n';
    message += '        Defines the HTTP method to use in the request (default: GET).\n';
    message += '\n';
    message += '    -h\n';
    message += '        Displays the HTTP response headers along with the content.\n';
    message += '\n';
    message += 'ARGUMENTS\n';
    message += '    URL\n';
    message += '        Full address of the HTTP resource to access\n';
    message += '        (e.g. http://192.168.1.1:80/index.html).\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';

    return message;
}

function manual_realnode(){
    let message = '';
    message += 'NAME\n';
    message += '    realnode - Displays the real properties of a network object in the simulator\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    realnode [property1] [property2] [...]\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    Retrieves and displays the value of one or more real properties of the\n';
    message += '    specified network object. Used primarily for debugging or internal\n';
    message += '    inspection of a node\'s state in the simulator.\n';
    message += '\n';
    message += 'ARGUMENTS\n';
    message += '    property\n';
    message += '        Name of the property to query (e.g. ip, hostname, mac, etc.).\n';
    message += '        If the property does not exist, "No value found" will be shown.\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';

    return message;
}

function manual_cp(){
    let message = '';
    message += 'NAME\n';
    message += '    cp - Copy files or directories\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    cp SOURCE DESTINATION\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    Copies a file from the SOURCE path to the DESTINATION path within the\n';
    message += '    network object\'s filesystem. If the destination file already exists, it will be overwritten.\n';
    message += '\n';
    message += 'ARGUMENTS\n';
    message += '    SOURCE\n';
    message += '        Relative or absolute path of the file to copy.\n';
    message += '\n';
    message += '    DESTINATION\n';
    message += '        Relative or absolute path of the destination file.\n';
    message += '\n';
    message += 'ERRORS\n';
    message += '    In case of error (e.g. if the file does not exist or is not accessible), an\n';
    message += '    informational message will be shown in the network object\'s terminal.\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';

    return message;
}

function manual_iface() {
    let message = '';
    message += 'NAME\n';
    message += '    iface - Manages the network interfaces of an object within the simulator\n';
    message += '\n';
    message += 'SYNOPSIS\n';
    message += '    iface [--add] [--del=&lt;interface|all&gt;]\n';
    message += '\n';
    message += 'DESCRIPTION\n';
    message += '    Allows adding or removing network interfaces on a network object in the simulator.\n';
    message += '    Interfaces follow the format enp0sX, with "enp0s3" being the default and\n';
    message += '    non-removable. If an interface is connected, it cannot be removed until disconnected.\n';
    message += '\n';
    message += 'OPTIONS\n';
    message += '    --add\n';
    message += '        Adds a new interface to the network object. The name is automatically assigned\n';
    message += '        as enp0sX, where X is the next available index following the "Predictable Network Interface Names" scheme.\n';
    message += '\n';
    message += '    --del=&lt;interface|all&gt;\n';
    message += '        Removes a specific interface (e.g. enp0s8) or all interfaces (except enp0s3).\n';
    message += '        Active (connected) interfaces cannot be removed.\n';
    message += '\n';
    message += 'COMMON ERRORS\n';
    message += '    - Attempting to remove "enp0s3", which is the non-removable base interface.\n';
    message += '    - Removing an interface that does not exist or is connected.\n';
    message += '\n';
    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n';

    return message;
}
