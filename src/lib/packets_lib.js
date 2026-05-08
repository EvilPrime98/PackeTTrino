/**
 * @description Base class for all simulated network packets. Holds layer-3/layer-2 addressing
 * and a random transaction id (`xid`).
 */
class packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
        this.xid = Math.floor(Math.random() * 10000);
    }
}

/**
 * @description Represents an ARP Request packet broadcast to `ff:ff:ff:ff:ff:ff` to discover
 * the MAC address of the target IP.
 */
class ArpRequest extends packet {
    /**
     * @param {string} origin_ip - IP address of the requesting host.
     * @param {string} destination_ip - IP address whose MAC is being requested.
     * @param {string} origin_mac - MAC address of the requesting host.
     */
    constructor(origin_ip, destination_ip, origin_mac) {
        super(origin_ip, destination_ip, origin_mac, "ff:ff:ff:ff:ff:ff");;
        this.protocol = "arp";
        this.type = "request";
    }
}

/**
 * @description Represents an ARP Reply packet sent unicast back to the original requester with
 * the resolved MAC address.
 */
class ArpReply extends packet {
    /**
     * @param {string} origin_ip - IP address of the replying host.
     * @param {string} destination_ip - IP address of the original requester.
     * @param {string} origin_mac - MAC address of the replying host.
     * @param {string} destination_mac - MAC address of the original requester.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "arp";
        this.type = "reply";
    }
}

/**
 * @description Represents an ICMP Echo Request (ping) packet with a default TTL of 64.
 */
class IcmpEchoRequest extends packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "request";
    }
}

/**
 * @description Represents an ICMP Echo Reply (ping response) packet with a default TTL of 64.
 */
class IcmpEchoReply extends packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "reply";
    }
}

/**
 * @description Represents an ICMP Time Exceeded message, sent by a router when a packet's TTL
 * reaches zero.
 */
class IcmpTimeExceeded extends packet {
    /**
     * @param {string} origin_ip - Source IP address (the router dropping the packet).
     * @param {string} destination_ip - Destination IP address (the original sender).
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "time-exceeded";
    }
}

/**
 * @description Represents a DHCP Discover packet broadcast by a client that has no IP address.
 * Source IP is `0.0.0.0`, destination is the broadcast `255.255.255.255`.
 */
class dhcpDiscover extends packet {
    /**
     * @param {string} origin_mac - MAC address of the DHCP client.
     */
    constructor(origin_mac) {
        super("0.0.0.0", "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "discover";
        this.sport = "68";
        this.dport = "67";
        this.giaddr = "0.0.0.0";
        this.ciaddr = "0.0.0.0";
        this.chaddr = origin_mac;
    }
}

/**
 * @description Represents a DHCP Offer packet sent by a server in response to a Discover,
 * proposing an IP address and network configuration to the client.
 */
class dhcpOffer extends packet {
    /**
     * @param {string} origin_ip - IP address of the DHCP server.
     * @param {string} origin_mac - MAC address of the DHCP server.
     * @param {string} server_ip - IP address of the DHCP server (siaddr).
     * @param {string} offer_ip - IP address being offered to the client (yiaddr).
     * @param {string} destination_mac - MAC address of the client.
     * @param {string} chaddr - Client hardware (MAC) address.
     * @param {string} gateway - Default gateway offered to the client.
     * @param {string} netmask - Subnet mask offered to the client.
     * @param {string} dns - Comma-separated list of DNS server IPs offered to the client.
     * @param {string|number} leasetime - Lease duration in seconds.
     */
    constructor(origin_ip, origin_mac, server_ip, offer_ip, destination_mac, chaddr, gateway, netmask, dns, leasetime) {
        super(origin_ip, "255.255.255.255", origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "offer";
        this.sport = "67";
        this.dport = "68";
        this.yiaddr = offer_ip;
        this.siaddr = server_ip;
        this.ciaddr = "0.0.0.0";
        this.giaddr = "0.0.0.0";
        this.chaddr = chaddr;
        // DHCP options
        this.gateway = gateway;
        this.netmask = netmask;
        this.dns = dns;
        this.leasetime = leasetime;
    }
}

/**
 * @description Represents a DHCP Request packet broadcast by a client to formally request the
 * IP address offered in a DHCP Offer.
 */
class dhcpRequest extends packet {
    /**
     * @param {string} origin_mac - MAC address of the DHCP client.
     * @param {string} requested_ip - IP address the client is requesting.
     * @param {string} server_ip - IP address of the server whose offer is being accepted.
     * @param {string} hostname - Hostname of the client device.
     */
    constructor(origin_mac, requested_ip, server_ip, hostname) {
        super("0.0.0.0", "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "request";
        this.sport = "68";
        this.dport = "67";
        this.yiaddr = "0.0.0.0";
        this.siaddr = server_ip;
        this.ciaddr = "0.0.0.0";
        this.chaddr = origin_mac;
        // DHCP options
        this.requested_ip = requested_ip;
        this.hostname = hostname;
        this.leasetime = "";
        this.gateway = "";
        this.netmask = "";
        this.dns = "";
    }
}

/**
 * @description Represents a DHCP Acknowledgement packet sent by the server to confirm the IP
 * assignment and deliver the full network configuration to the client.
 */
class dhcpAck extends packet {
    /**
     * @param {string} origin_mac - MAC address of the DHCP server.
     * @param {string} assigned_ip - IP address assigned to the client (yiaddr).
     * @param {string} server_ip - IP address of the DHCP server.
     * @param {string} offergateway - Default gateway to assign to the client.
     * @param {string} offernetmask - Subnet mask to assign to the client.
     * @param {string} offerdns - Comma-separated list of DNS server IPs to assign.
     * @param {string} hostname - Hostname of the client device.
     * @param {string|number} leasetime - Lease duration in seconds.
     */
    constructor(origin_mac, assigned_ip, server_ip, offergateway, offernetmask, offerdns, hostname, leasetime) {
        super(server_ip, "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "ack";
        this.sport = "67";
        this.dport = "68";
        this.ciaddr = "0.0.0.0";
        this.yiaddr = assigned_ip;
        this.siaddr = server_ip;
        this.chaddr = "";
        // DHCP options
        this.gateway = offergateway;
        this.netmask = offernetmask;
        this.dns = offerdns;
        this.hostname = hostname;
        this.leasetime = leasetime;
    }
}

/**
 * @description Represents a DHCP Release packet sent by a client to voluntarily relinquish its
 * leased IP address back to the server.
 */
class dhcpRelease extends packet {
    /**
     * @param {string} origin_ip - IP address of the client releasing the lease.
     * @param {string} destination_ip - IP address of the DHCP server.
     * @param {string} origin_mac - MAC address of the client.
     * @param {string} destination_mac - MAC address of the DHCP server.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "release";
        this.sport = "68";
        this.dport = "67";
        this.ciaddr = origin_ip;
        this.yiaddr = "";
        this.siaddr = destination_ip;
        this.giaddr = "";
        this.chaddr = origin_mac;
    }
}

/**
 * @description Represents a DNS Query packet sent by a client to a DNS server.
 * Uses a random ephemeral source port (49152–65535).
 */
class dnsRequest extends packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination DNS server IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     * @param {string} query - Domain name or IP being queried.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, query) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dns";
        this.ttl = 64;
        this.type = "request";
        this.sport = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
        this.dport = "53";
        this.query = query;
        this.answer_type = "";
        this.answer = "";
        this.authority = "";
        this.authority_domain = "";
    }
}

/**
 * @description Represents a DNS Reply packet sent by a server back to the querying client.
 */
class dnsReply extends packet {
    /**
     * @param {string} origin_ip - Source IP address (the DNS server).
     * @param {string} destination_ip - Destination IP address (the querying client).
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     * @param {string} query - The original domain name or IP that was queried.
     * @param {string|string[]} answer - The resolved answer(s).
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, query, answer) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dns";
        this.ttl = 64;
        this.type = "reply";
        this.sport = "53";
        this.dport = "";
        this.query = query;
        this.answer_type = "";
        this.answer = answer;
    }
}

/**
 * @description Represents a TCP SYN segment used to initiate a three-way handshake.
 * The sequence number is randomised.
 */
class syn extends packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     * @param {string|number} sport - Source port.
     * @param {string|number} dport - Destination port.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn";
        this.sport = sport;
        this.dport = dport;
        this.sequence_number = Math.floor(Math.random()*100000);
        this.ack_number = 0;
    }
}

/**
 * @description Represents a TCP SYN-ACK segment sent by the server in response to a SYN.
 * The sequence number is randomised.
 */
class synAck extends packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     * @param {string|number} sport - Source port.
     * @param {string|number} dport - Destination port.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn-ack";
        this.sport = sport;
        this.dport = dport;
        this.sequence_number = Math.floor(Math.random()*100000);
        this.ack_number = 0;
    }
}

/**
 * @description Represents a TCP ACK segment, the final step of the three-way handshake.
 */
class Ack extends packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     * @param {string|number} sport - Source port.
     * @param {string|number} dport - Destination port.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn-ack-reply";
        this.sport = sport;
        this.dport = dport;
        this.sequence_number = "";
        this.ack_number = "";
    }
}

/**
 * @description Represents an HTTP Request packet carrying method, host, and resource information
 * over a TCP connection.
 */
class httpRequest extends packet {
    /**
     * @param {string} origin_ip - Source IP address.
     * @param {string} destination_ip - Destination IP address.
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     * @param {string|number} sport - Source port.
     * @param {string|number} dport - Destination port.
     * @param {string} method - HTTP method (e.g. "GET", "POST").
     * @param {string} host - HTTP Host header value.
     * @param {string} resource - Requested URL path/resource.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport, method, host, resource) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "http";
        this.ttl = 64;
        this.type = "request";
        this.sport = sport;
        this.dport = dport;
        //headers
        this.method = method;
        this.host = host;
        this.contentType = "text/html";
        this.keepalive = true;
        this.userAgent = "Amin-Search 1.0 - 2025";
        this.body = "";
        this.resource = resource;
    }
}

/**
 * @description Represents an HTTP Reply packet sent by a server in response to an HTTP Request.
 */
class httpReply extends packet {
    /**
     * @param {string} origin_ip - Source IP address (the HTTP server).
     * @param {string} destination_ip - Destination IP address (the client).
     * @param {string} origin_mac - Source MAC address.
     * @param {string} destination_mac - Destination MAC address.
     * @param {string|number} sport - Source port.
     * @param {string|number} dport - Destination port.
     * @param {string} method - HTTP method of the original request.
     * @param {string} host - HTTP Host header value.
     */
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport, method, host) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "http";
        this.ttl = 64;
        this.sport = sport;
        this.dport = dport;
        this.type = "reply";
        //headers
        this.method = method;
        this.host = host;
        this.keepalive = true;
        this.contentType = "text/html";
        this.userAgent = "Amin-Search 1.0 - 2025";
        this.body = "";
        this.statusCode = "";
    }
}
