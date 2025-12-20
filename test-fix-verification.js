import { z } from './packages/zod/index.js';

// Test that invalid_format errors include origin field
const result = z.string().email().safeParse('invalid-email');

if (!result.success) {
  const issue = result.error.issues[0];
  console.log('Error issue:', JSON.stringify(issue, null, 2));

  if (issue.code === 'invalid_format' && issue.origin === 'string') {
    console.log('✅ SUCCESS: invalid_format error includes origin field');
  } else {
    console.log('❌ FAILED: invalid_format error missing origin field');
    process.exit(1);
  }
} else {
  console.log('❌ FAILED: Expected validation to fail');
  process.exit(1);
}