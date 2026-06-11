import { describe, it, expect, suite } from 'vitest';
import { createWindowWithScripts } from './setup-globals.js';

describe('Switch', () => {

    const window = createWindowWithScripts(
        '../src/components/network_elements/switch.js',
    );

    suite('Switch()', () => {
        
        const SwitchObject = window.SwitchObject;
        
        it('should be a function', () => {
            expect(typeof SwitchObject).toBe('function');
        });

        const switchElement = SwitchObject(0, 0);

        it('should return a DOM element', () => {
            expect(switchElement).toBeInstanceOf(HTMLElement);
        });

    });

})
