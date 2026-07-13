import dotenv from 'dotenv';
import path from 'path';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Since activities-mock.ts uses Next.js app directory structure and ES6 modules,
// we will dynamically import it. However, Node might complain about TypeScript.
// An easier approach for a one-off script is to use a compiled or JSON version.
// But we can just use ts-node to run this script if needed, or we can write
// an API endpoint in Next.js to trigger the seed, which avoids the TS/ESM issues entirely!
