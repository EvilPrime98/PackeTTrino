/**
 * Dispatches an incoming packet to all active services installed on the network device
 * and collects their responses.
 *
 * Each service is only invoked if both the packet's protocol matches and the service is
 * listed as active by `getAvailableServices`. Dispatching rules:
 *
 * - **DHCP packets** — checked against `dhclient`, `dhcpd`, and `dhcrelay` in order.
 *   For relay responses, the output interface is derived from the `giaddr` field of the
 *   reply (OFFER/ACK are sent back toward the relay's client-facing interface).
 * - **DNS request packets** — dispatched to `named_service` when `named` is active.
 * - **HTTP request packets** — dispatched to `apache_service` when `apache2` is active.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @param {Object} packet - The incoming packet object.
 * @param {string} networkObjectInterface - The name of the interface on which the packet arrived.
 * @returns {Promise<Array<{packet: Object, outInterface: string}>>}
 *   An array of response descriptors. Each entry contains the reply packet and the
 *   output interface name to use when sending it (`""` means use normal routing).
 */
// [agent-added: esm-migration phase 05]
import { getAvailableServices } from '../services/systemd_service.js';
import { getInfoFromIp } from '../lib/network_lib.js';
import { dhclient_service } from '../services/dhclient_service.js';
import { dhcpd_service } from '../services/dhcpd_service.js';
import { dhcrelay_service } from '../services/dhcrelay_service.js';
import { named_service } from '../services/named_service.js';
import { apache_service } from '../services/apache2_service.js';

// [agent-added: esm-migration phase 05]
export async function serviceProcessor(networkObjectId, packet, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableServices = getAvailableServices(networkObjectId);
    const responses = [];

    //DHCP service
    if (packet.protocol === "dhcp") {

        if (availableServices.includes("dhclient")) {

            const replyPacket = await dhclient_service(networkObjectId, packet, networkObjectInterface);

            if (replyPacket) {

                responses.push({
                    packet: replyPacket,
                    outInterface: networkObjectInterface
                });

            }

        }

        if (availableServices.includes("dhcpd")) {

            const replyPacket = await dhcpd_service(networkObjectId, packet, networkObjectInterface);

            if (replyPacket) {

                responses.push({
                    packet: replyPacket,
                    outInterface: networkObjectInterface
                })

            }

        }

        if (availableServices.includes("dhcrelay")) {

            const replyPacket = await dhcrelay_service(networkObjectId, packet, networkObjectInterface);

            if (replyPacket) {

                responses.push({
                    packet: replyPacket,
                    outInterface: (replyPacket.type === "offer" || replyPacket.type === "ack") ? getInfoFromIp(networkObjectId, replyPacket.giaddr)[0] : ""
                });

            }

        }

    }

    //DNS service
    if (packet.protocol === "dns" && packet.type === "request" && availableServices.includes("named")) {

        const replyPacket = await named_service(networkObjectId, packet);

        if (replyPacket) {

            responses.push({
                packet: replyPacket,
                outInterface: ""
            });

        }

    }

    //HTTP service
    if (packet.protocol === "http" && packet.type === "request" && availableServices.includes("apache2")) {

        const replyPacket = await apache_service(networkObjectId, packet);

        if (replyPacket) {

            responses.push({
                packet: replyPacket,
                outInterface: ""
            });

        }

    }

    return responses.filter(Boolean);

}
