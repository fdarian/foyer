import { PGlite } from '@electric-sql/pglite';

const client = new PGlite(':memory:');
await client.waitReady;
const result = await client.query('SELECT 1 as test');
console.log(result);
await client.close();
