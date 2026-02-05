const assert = require('assert');

const tests = [];
let currentSuite = '';

function wrapName(name) {
  return currentSuite ? `${currentSuite} ${name}` : name;
}

global.describe = (name, fn) => {
  const previousSuite = currentSuite;
  currentSuite = wrapName(name).trim();
  fn();
  currentSuite = previousSuite;
};

global.test = (name, fn) => {
  tests.push({ name: wrapName(name).trim(), fn });
};

global.expect = (actual) => ({
  toBe(expected) {
    assert.strictEqual(actual, expected);
  },
  toEqual(expected) {
    assert.deepStrictEqual(actual, expected);
  },
  toContain(expected) {
    if (typeof actual?.includes === 'function') {
      assert.ok(actual.includes(expected), `${actual} does not contain ${expected}`);
    } else {
      throw new Error('toContain matcher expects an array or string');
    }
  },
});

require('./logic.test.js');

let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  }
}

console.log(`Executed ${tests.length} tests. Passed: ${passed}. Failed: ${tests.length - passed}.`);

if (process.exitCode) {
  process.exit(process.exitCode);
}
