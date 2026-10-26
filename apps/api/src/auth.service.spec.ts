import * as bcrypt from 'bcrypt';
describe('authentication primitives',()=>{it('hashes and verifies passwords without storing plaintext',async()=>{const hash=await bcrypt.hash('ClientFlow2024!',10);expect(hash).not.toBe('ClientFlow2024!');expect(await bcrypt.compare('ClientFlow2024!',hash)).toBe(true);expect(await bcrypt.compare('wrong',hash)).toBe(false);});});
