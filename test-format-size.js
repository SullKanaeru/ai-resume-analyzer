// Simple test script to verify formatSize function
// This is just for testing and won't be part of the final codebase

function formatSize(bytes) {
  // Handle invalid inputs
  if (bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  
  // Define units and their thresholds
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  // Calculate the value in the appropriate unit
  // Limit to 2 decimal places and remove trailing zeros
  const value = (bytes / Math.pow(1024, i)).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1');
  
  return `${value} ${units[i]}`;
}

// Test cases
const testCases = [
  { input: -10, expected: '0 B' },
  { input: 0, expected: '0 B' },
  { input: 500, expected: '500 B' },
  { input: 1023, expected: '1023 B' },
  { input: 1024, expected: '1 KB' },
  { input: 1536, expected: '1.5 KB' },
  { input: 1048576, expected: '1 MB' },
  { input: 1572864, expected: '1.5 MB' },
  { input: 1073741824, expected: '1 GB' },
  { input: 1610612736, expected: '1.5 GB' },
  { input: 1099511627776, expected: '1 TB' },
];

// Run tests
console.log('Testing formatSize function:');
console.log('---------------------------');
testCases.forEach(test => {
  const result = formatSize(test.input);
  const passed = result === test.expected;
  console.log(`Input: ${test.input} bytes`);
  console.log(`Expected: ${test.expected}`);
  console.log(`Result: ${result}`);
  console.log(`Test ${passed ? 'PASSED' : 'FAILED'}`);
  console.log('---------------------------');
});