export const ips = {

    validIps: [

        {
            ip: '192.168.1.1',
            cidrIp: '192.168.1.1/24',
            bin: '11000000101010000000000100000001',
            netmask: '255.255.255.0',
            cidr: 24,
            broadcast: '192.168.1.255',
            network: '192.168.1.0',
        },

        {
            ip: '255.255.255.1',
            cidrIp: '255.255.255.1/24',
            bin: '11111111111111111111111100000001',
            netmask: '255.255.255.0',
            cidr: 24,
            broadcast: '255.255.255.255',
            network: '255.255.255.0',
        },

        {
            ip: '178.78.15.247',
            cidrIp: '178.78.15.247/24',
            bin: '10110010010011100000111111110111',
            netmask: '255.255.255.0',
            cidr: 24,
            broadcast: '178.78.15.255',
            network: '178.78.15.0',
        }

    ],
    
    invalidIps: [
        { ip: '192.168.1.1/24' },
        { ip: '258.241.0.1' },
        { ip: 'not-an-ip' },
    ]

};

export const macs = {
    
    valid: [
        { mac: 'aa:bb:cc:dd:ee:ff' },
        { mac: 'ff:ff:ff:ff:ff:ff' },
    ],

    invalid: [
        { mac: 'aa:bb:cc:dd:ee' },
        { mac: 'aa:bb:cc:dd:ee:ff:gg:hh' },
        { mac: 'aa:bb:cc:dd:ee:ff:00:11:22:33' },
        { mac: '00:11:22:33:44:55:66:77:88:99' }
    ]

};