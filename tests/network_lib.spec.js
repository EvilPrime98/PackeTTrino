import { describe, it, expect, suite } from 'vitest';
import { createWindowWithScripts } from './setup-globals.js';
import { ips, macs } from './mockup.js';

describe('network_lib.js', () => {

    const window = createWindowWithScripts(
        '../src/lib/network_lib.js',
    );

    suite('isValidMac(mac)', () => {
        
        const isValidMac = window.isValidMac;

        it('should be a function', () => {
            expect(typeof isValidMac).toBe('function');
        });

        it('should return a boolean', () => {
            for (const { mac } of [...macs.valid, ...macs.invalid]){
                expect(typeof isValidMac(mac)).toBe('boolean');
            }
        });

        it('should return `false` for a non-string argument', () => {
            expect(isValidMac(null)).toBe(false);
            expect(isValidMac(undefined)).toBe(false);
            expect(isValidMac(true)).toBe(false);
            expect(isValidMac(false)).toBe(false);
            expect(isValidMac(0)).toBe(false);
            expect(isValidMac(1)).toBe(false);
            expect(isValidMac([macs.valid[0]].mac)).toBe(false);
            expect(isValidMac({})).toBe(false);
            expect(isValidMac(() => { })).toBe(false);
        });

        it('should return `true` for a valid MAC address', () => {
            for (const { mac } of macs.valid){
                expect(isValidMac(mac)).toBe(true);
            }
        });

        it('should return `false` for an invalid MAC address', () => {
            for (const { mac } of macs.invalid){ 
                expect(isValidMac(mac)).toBe(false);
            }
        });

    });

    suite('isValidIp(ip)', () => {

        const isValidIp = window.isValidIp;

        it('should be a function', () => {
            expect(typeof isValidIp).toBe('function');
        });

        it('should return `false` for a non-string argument', () => {
            expect(isValidIp(null)).toBe(false);
            expect(isValidIp(undefined)).toBe(false);
            expect(isValidIp(true)).toBe(false);
            expect(isValidIp(false)).toBe(false);
            expect(isValidIp(0)).toBe(false);
            expect(isValidIp(1)).toBe(false);
            expect(isValidIp([])).toBe(false);
            expect(isValidIp({})).toBe(false);
            expect(isValidIp(() => { })).toBe(false);
        });

        it('should return a boolean for any string', () => {
            for (const { ip } of ips.validIps) {
                expect(typeof isValidIp(ip)).toBe('boolean');
            }
        });

        it('should return `true` or `false` for valid/invalid IPs', () => {
            for (const { ip } of ips.validIps) {
                expect(isValidIp(ip)).toBe(true);
            }
            for (const { ip } of ips.invalidIps) {
                expect(isValidIp(ip)).toBe(false);
            }
        });

    });

    suite('getRandomMac()', () => {

        const getRandomMac = window.getRandomMac;

        it('should be a function', () => {
            expect(typeof getRandomMac).toBe('function');
        });

        it('should return a string', () => {
            const mac = getRandomMac();
            expect(typeof mac).toBe('string');
        });

        it('should return a random 48-bit MAC address', () => {
            const mac = getRandomMac();
            expect(mac).toMatch(/^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/);
        });

        it('should return a different MAC address each time', () => {
            const mac1 = getRandomMac();
            const mac2 = getRandomMac();
            expect(mac1).not.toBe(mac2);
        }); // TODO -> test for collisions

    });

    suite('getNetwork(ip, netmask)', () => {

        const getNetwork = window.getNetwork;

        it('should be a function', () => {
            expect(typeof getNetwork).toBe('function');
        })

        it('should throw an error if the IP is not valid or missing', () => {
            expect(() => getNetwork('not-an-ip', '255.255.255.0')).toThrow();
            expect(() => getNetwork(undefined, '255.255.255.0')).toThrow();
        })

        it('should throw an error if the subnet mask is not valid or missing', () => {
            expect(() => getNetwork('192.168.1.1', 'not-a-netmask')).toThrow();
            expect(() => getNetwork('192.168.1.1')).toThrow();
        })

        it('should return the network address for the given IP and subnet mask', () => {
            for (const { ip, netmask, network } of ips.validIps) {
                expect(getNetwork(ip, netmask)).toBe(network);
            }
        });

    });

    suite('ipToBinary(decimal)', () => {

        const ipToBinary = window.ipToBinary

        it('should be a function', () => {
            expect(typeof ipToBinary).toBe('function')
        })

        it('should throw an error for invalid ipv4 addresses', () => {
            expect(() => ipToBinary('not-a-valid-ip')).toThrow();
            expect(() => ipToBinary()).toThrow();
        })

        it('should return the binary representation of the IP address', () => {
            for (const { ip, bin } of ips.validIps) {
                expect(ipToBinary(ip)).toBe(bin);
            }
        })

    });

    suite('binaryToIp(binary)', () => {

        const binaryToIp = window.binaryToIp;

        it('should be a function', () => {
            expect(typeof binaryToIp).toBe('function');
        })

        it('should throw an error for invalid binary strings', () => {
            expect(() => binaryToIp('not-a-binary-string')).toThrow();
            expect(() => binaryToIp()).toThrow();
            expect(() => binaryToIp(110000001)).toThrow();
        })

        it('should return the IP address for a valid binary string', () => {
            for (const { ip, bin } of ips.validIps) {
                expect(window.binaryToIp(bin)).toBe(ip);
            }
        });

    });

    suite('getBroadcast(ip, netmask)', () => {

        const getBroadcast = window.getBroadcast;

        it('should be a function', () => {
            expect(typeof getBroadcast).toBe('function');
        })

        it('should throw an error if the IP is not valid or missing', () => {
            expect(() => getBroadcast('not-an-ip', '255.255.255.0')).toThrow();
            expect(() => getBroadcast(undefined, '255.255.255.0')).toThrow();
        })

        it('should throw an error if the subnet mask is not valid or missing', () => {
            expect(() => getBroadcast('192.168.1.1', 'not-a-netmask')).toThrow();
            expect(() => getBroadcast('192.168.1.1')).toThrow();
        })

        it('should return the broadcast address for the given IP and subnet mask', () => {
            for (const { ip, netmask, broadcast } of ips.validIps) {
                expect(getBroadcast(ip, netmask)).toBe(broadcast);
            }
        });

    });

    suite('netmaskToCidr(netmask)', () => {

        const netmaskToCidr = window.netmaskToCidr;

        it('should be a function', () => {
            expect(typeof netmaskToCidr).toBe('function');
        })

        it('should throw an error if the netmask is not valid or missing', () => {
            expect(() => netmaskToCidr('not-a-netmask')).toThrow();
            expect(() => netmaskToCidr('258.241.0.1')).toThrow();
            expect(() => netmaskToCidr()).toThrow();
        })

        it('should always return a number', () => {
            for (const { netmask } of ips.validIps) {
                expect(typeof netmaskToCidr(netmask)).toBe('number');
            }
        })

        it('should return the correct cidr for a valid netmask', () => {
            for (const { netmask, cidr } of ips.validIps) {
                expect(netmaskToCidr(netmask)).toBe(cidr);
            }
        })

    });

    suite('parseCidr(cidr)', () => {

        const parseCidr = window.parseCidr;

        it('should be a function', () => {
            expect(typeof parseCidr).toBe('function');
        })

        it('should throw an error if the cidr is not valid or missing', () => {
            expect(() => parseCidr('not-a-cidr')).toThrow();
            expect(() => parseCidr()).toThrow();
            expect(() => parseCidr('192.168.1.1/33')).toThrow();
            expect(() => parseCidr('192.168.1.1/not-a-number')).toThrow();
        })

        it('should always return an array of length 2', () => {
            for (const { cidrIp } of ips.validIps) {
                expect(Array.isArray(parseCidr(cidrIp))).toBe(true);
                expect(parseCidr(cidrIp).length).toBe(2);
            }
        })

        it('should return the correct tuple for a valid cidr', () => {
            for (const { cidrIp, ip, netmask } of ips.validIps) {
                expect(parseCidr(cidrIp)).toEqual([ip, netmask]);
            }
        })

    });

    suite('isValidCidrIp', () => {

        const isValidCidrIp = window.isValidCidrIp;

        it('should be a function', () => {
            expect(typeof isValidCidrIp).toBe('function');
        })

        it('should always return a boolean', () => {
            for (const { cidrIp } of ips.validIps) {
                expect(typeof isValidCidrIp(cidrIp)).toBe('boolean');
            }
        })

        it('should return `true` for a valid cidr', () => {
            for (const { cidrIp } of ips.validIps) {
                expect(isValidCidrIp(cidrIp)).toBe(true);
            }
        })

    });

});
