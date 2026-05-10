import { describe, it, expect, suite } from 'vitest';
import { createWindowWithScripts } from './setup-globals.js';

const validIps = ['192.168.1.1', '255.255.255.1', '5.0.0.1'];
const validNetmasks = ['255.255.255.0', '255.255.0.0', '255.0.0.0'];
const invalidIps = ['192.168.1.1/24', '192.168.1', '258.241.0.1', 'not-an-ip']

describe('network_lib.js', () => {

    const window = createWindowWithScripts(
        '../src/lib/network_lib.js',
    );

    /*VALIDATORS*/
    suite('isValidMac(mac)', () => {

        const validMac = 'aa:bb:cc:dd:ee:ff';
        const invalidMac = 'aa:bb:cc:dd:ee';

        it('should be a function', () => {
            const isValidMac = window.isValidMac;
            expect(typeof isValidMac).toBe('function');
        });

        it('should return a boolean', () => {
            const isValid = window.isValidMac(validMac);
            const isInvalid = window.isValidMac(invalidMac);
            expect(typeof isValid).toBe('boolean');
            expect(typeof isInvalid).toBe('boolean');
        });

        it('should return `false` for a non-string argument', () => {
            expect(window.isValidMac(null)).toBe(false);
            expect(window.isValidMac(undefined)).toBe(false);
            expect(window.isValidMac(true)).toBe(false);
            expect(window.isValidMac(false)).toBe(false);
            expect(window.isValidMac(0)).toBe(false);
            expect(window.isValidMac(1)).toBe(false);
            expect(window.isValidMac([validMac])).toBe(false);
            expect(window.isValidMac({})).toBe(false);
            expect(window.isValidMac(() => { })).toBe(false);
        });

        it('should return `true` for a valid MAC address', () => {
            const isValid = window.isValidMac(validMac);
            expect(isValid).toBe(true);
        });

        it('should return `false` for an invalid MAC address', () => {
            const isValid = window.isValidMac(invalidMac);
            expect(isValid).toBe(false);
        });

    });

    suite('isValidIp(ip)', () => {

        it('should be a function', () => {
            const isValidIp = window.isValidIp;
            expect(typeof isValidIp).toBe('function');
        });

        it('should return `false` for a non-string argument', () => {
            expect(window.isValidIp(null)).toBe(false);
            expect(window.isValidIp(undefined)).toBe(false);
            expect(window.isValidIp(true)).toBe(false);
            expect(window.isValidIp(false)).toBe(false);
            expect(window.isValidIp(0)).toBe(false);
            expect(window.isValidIp(1)).toBe(false);
            expect(window.isValidIp([validIps[0]])).toBe(false);
            expect(window.isValidIp({})).toBe(false);
            expect(window.isValidIp(() => { })).toBe(false);
        });

        it('should return a boolean for any string', () => {
            [...invalidIps, ...validIps].forEach(ip =>
                expect(typeof window.isValidIp(ip)).toBe('boolean')
            );
        });

        it('should return `true` or `false` for valid/invalid IPs', () => {
            validIps.forEach(ip => expect(window.isValidIp(ip)).toBe(true));
            invalidIps.forEach(ip => expect(window.isValidIp(ip)).toBe(false));
        });

    });

    /*-----*/
    suite('getRandomMac()', () => {

        it('should be a function', () => {
            const getRandomMac = window.getRandomMac;
            expect(typeof getRandomMac).toBe('function');
        });

        it('should return a string', () => {
            const mac = window.getRandomMac();
            expect(typeof mac).toBe('string');
        });

        it('should return a random 48-bit MAC address', () => {
            const mac = window.getRandomMac();
            expect(mac).toMatch(/^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/);
        });

        it('should return a different MAC address each time', () => {
            const mac1 = window.getRandomMac();
            const mac2 = window.getRandomMac();
            expect(mac1).not.toBe(mac2);
        }); // TODO -> test for collisions

    });

    suite('getNetwork(ip, netmask)', () => {

        it('should be a function', () => {
            const getNetwork = window.getNetwork;
            expect(typeof getNetwork).toBe('function');
        })

        it('should throw an error if the IP is not valid or missing', () => {
            expect(() => window.getNetwork('not-an-ip', '255.255.255.0')).toThrow();
            expect(() => window.getNetwork(undefined, '255.255.255.0')).toThrow();
        })

        it('should throw an error if the subnet mask is not valid or missing', () => {
            expect(() => window.getNetwork('192.168.1.1', 'not-a-netmask')).toThrow();
            expect(() => window.getNetwork('192.168.1.1')).toThrow();
        })

        it('should return a string for a valid IP and subnet mask', () => {
            validIps.forEach(ip => validNetmasks.forEach(netmask => 
                expect(typeof window.getNetwork(ip, netmask)).toBe('string')
            ));
        });

        it('should return the network address for the given IP and subnet mask', () => {
            expect(window.getNetwork('192.168.1.1', '255.255.255.0')).toBe('192.168.1.0');
            expect(window.getNetwork('192.168.1.1', '255.255.0.0')).toBe('192.168.0.0');
            expect(window.getNetwork('192.168.1.1', '255.0.0.0')).toBe('192.0.0.0');
            expect(window.getNetwork('192.168.1.1', '0.0.0.0')).toBe('0.0.0.0');
        });

        it('should return a valid network IP for a valid IP and subnet mask', () => {
            validIps.forEach(ip => validNetmasks.forEach(netmask => 
                expect(window.isValidIp(window.getNetwork(ip, netmask))).toBe(true)
            ));
        });

    });

});