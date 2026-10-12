import { writeFileSync } from 'node:fs';
import { nativeSeedSQL } from '../src/data/finance';
writeFileSync('training.sql', nativeSeedSQL());
console.log('Created training.sql: 10,000 fictional transactions, matching the browser dataset.');
