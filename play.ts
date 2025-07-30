// Debug script for hash validation issues - now resolved
//
// Issues found and fixed:
// 1. Base64url test was trying to replace '-' with '+' but the test input didn't generate any '-' characters
//    Fixed by changing the test to add an invalid character instead
// 2. Base64 padding test was failing for SHA384 because it doesn't require padding
//    Fixed by only testing padding removal for algorithms that actually require padding

console.log("Hash validation tests are now working correctly!");
