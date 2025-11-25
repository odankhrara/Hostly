/**
 * Script to identify and remove test properties from the database
 * Usage: node scripts/cleanup-test-properties.js [--dry-run] [--confirm]
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Property } = require('../src/models');

const MONGODB_URI = process.env.MONGODB_URI || 
  (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD
    ? `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DB || 'hostly'}?authSource=admin`
    : `mongodb://${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DB || 'hostly'}`);

// Patterns to identify test properties
const TEST_PATTERNS = [
  /^test\s+property/i,
  /^testproperty/i,
  /test\s*property/i,
  /^dummy\s+property/i,
  /^sample\s+property/i,
  /^example\s+property/i
];

async function findTestProperties() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const allProperties = await Property.find({}).populate('owner_id', 'name email');
    
    const testProperties = allProperties.filter(prop => {
      const name = prop.name || '';
      return TEST_PATTERNS.some(pattern => pattern.test(name));
    });

    return testProperties;
  } catch (error) {
    console.error('Error finding test properties:', error);
    throw error;
  }
}

async function deleteTestProperties(properties, dryRun = false) {
  if (properties.length === 0) {
    console.log('No test properties found.');
    return;
  }

  console.log(`\nFound ${properties.length} test property/properties:`);
  console.log('='.repeat(80));
  
  properties.forEach((prop, index) => {
    console.log(`${index + 1}. ${prop.name}`);
    console.log(`   ID: ${prop._id}`);
    console.log(`   Location: ${prop.city}, ${prop.state}`);
    console.log(`   Owner: ${prop.owner_id?.name || 'Unknown'} (${prop.owner_id?.email || 'N/A'})`);
    console.log(`   Price: $${prop.price_per_night}/night`);
    console.log(`   Created: ${prop.createdAt}`);
    console.log('');
  });

  if (dryRun) {
    console.log('DRY RUN MODE - No properties will be deleted.');
    console.log('Run with --confirm to actually delete these properties.');
    return;
  }

  const ids = properties.map(p => p._id);
  const result = await Property.deleteMany({ _id: { $in: ids } });
  
  console.log(`\n✅ Successfully deleted ${result.deletedCount} test property/properties.`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const confirm = args.includes('--confirm');

  try {
    console.log('='.repeat(80));
    console.log('Test Properties Cleanup Script');
    console.log('='.repeat(80));

    if (!dryRun && !confirm) {
      console.log('\n⚠️  WARNING: This will permanently delete test properties!');
      console.log('Run with --dry-run to see what would be deleted.');
      console.log('Run with --confirm to actually delete.');
      console.log('\nExample: node scripts/cleanup-test-properties.js --dry-run');
      console.log('         node scripts/cleanup-test-properties.js --confirm');
      process.exit(0);
    }

    const testProperties = await findTestProperties();
    await deleteTestProperties(testProperties, dryRun);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

main();

