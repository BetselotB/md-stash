const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../corpus/catalog/index.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('Total items in catalog:', catalog.length);

const categoryCounts = {};
const sourceCounts = {};
const licenseCounts = {};
const stylingCounts = {};
const idLengths = [];
const duplicateIds = new Set();
const seenIds = new Set();

for (const item of catalog) {
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  const src = Array.isArray(item.sources) ? item.sources[0] : (item.source || 'unknown');
  sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  licenseCounts[item.license || 'unknown'] = (licenseCounts[item.license || 'unknown'] || 0) + 1;
  stylingCounts[item.styling || 'unknown'] = (stylingCounts[item.styling || 'unknown'] || 0) + 1;
  
  if (seenIds.has(item.id)) {
    duplicateIds.add(item.id);
  } else {
    seenIds.add(item.id);
  }
}

console.log('\n--- Category Counts ---');
for (const [k, v] of Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${k}: ${v} (${(v / catalog.length * 100).toFixed(1)}%)`);
}

console.log('\n--- Top Sources ---');
for (const [k, v] of Object.entries(sourceCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${k}: ${v}`);
}

console.log('\n--- Licenses in catalog ---');
console.log(licenseCounts);

console.log('\n--- Styling claims in catalog ---');
console.log(stylingCounts);

console.log('\n--- Duplicate IDs count ---');
console.log(duplicateIds.size);
