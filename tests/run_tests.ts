#!/usr/bin/env npx ts-node
/**
 * Test runner for C23 parser
 * Runs all test files and verifies round-trip parsing
 */

const { C23Parser } = require('../c23parser');
const fs = require('fs');
const path = require('path');

interface TestCase {
  name: string;
  file: string;
  shouldPass: boolean;
  description: string;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Basic C90 Program',
    file: 'test1_basic.c',
    shouldPass: true,
    description: 'Simple C90 program with main function',
  },
  {
    name: 'C23 Features',
    file: 'test2_c23_features.c',
    shouldPass: true,
    description: 'Modern C23 features like _BitInt, nullptr, attributes',
  },
  {
    name: 'Complex Declarations',
    file: 'test3_complex_decls.c',
    shouldPass: true,
    description: 'Function pointers, arrays, VLAs, structs, unions, enums, typedefs',
  },
  {
    name: 'Control Flow',
    file: 'test4_control_flow.c',
    shouldPass: true,
    description: 'if/else, switch, loops, goto, return statements',
  },
  {
    name: 'Expressions and Operators',
    file: 'test5_expressions.c',
    shouldPass: true,
    description: 'All C operators, sizeof, typeof, generic selection, casts',
  },
  {
    name: 'Preprocessor and Comments',
    file: 'test6_preprocessor_comments.c',
    shouldPass: true,
    description: 'Preprocessor directives, line/block comments preservation',
  },
];

function normalizeSource(source: string): string {
  // Normalize line endings
  return source.replace(/\r\n/g, '\n');
}

function runTest(testCase: TestCase, parser: any): { passed: boolean; details: string } {
  const testDir = path.dirname(__filename);
  const filePath = path.join(testDir, testCase.file);
  
  let source: string;
  try {
    source = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return { passed: false, details: `Failed to read file: ${e}` };
  }
  
  const normalizedSource = normalizeSource(source);
  
  // Parse
  const result = parser.parseSource(normalizedSource);
  
  // Check for parse errors
  if (result.errors.length > 0) {
    if (!testCase.shouldPass) {
      return { passed: true, details: `Expected failure, got ${result.errors.length} errors` };
    }
    return { 
      passed: false, 
      details: `Parse errors (${result.errors.length}):\n` + 
        result.errors.map((e: any) => `  ${e.range.start.line}:${e.range.start.column} - ${e.message}`).join('\n')
    };
  }
  
  // Check round-trip
  const emitted = result.emitted;
  const normalizedEmitted = normalizeSource(emitted);
  
  if (normalizedSource !== normalizedEmitted) {
    // Find first difference
    let diffPos = -1;
    const minLen = Math.min(normalizedSource.length, normalizedEmitted.length);
    for (let i = 0; i < minLen; i++) {
      if (normalizedSource[i] !== normalizedEmitted[i]) {
        diffPos = i;
        break;
      }
    }
    if (diffPos === -1 && normalizedSource.length !== normalizedEmitted.length) {
      diffPos = minLen;
    }
    
    let context = '';
    if (diffPos >= 0) {
      const start = Math.max(0, diffPos - 50);
      const end = Math.min(normalizedSource.length, diffPos + 50);
      context = `\n  Expected: ...${JSON.stringify(normalizedSource.slice(start, end))}...\n  Got:      ...${JSON.stringify(normalizedEmitted.slice(start, end))}...`;
    }
    
    return { 
      passed: false, 
      details: `Round-trip failed! Source and emitted differ.${context}` 
    };
  }
  
  // Verify we can re-parse the emitted code
  const reparsed = parser.parseSource(normalizedEmitted);
  if (reparsed.errors.length > 0) {
    return { 
      passed: false, 
      details: `Re-parse of emitted code failed with ${reparsed.errors.length} errors` 
    };
  }
  
  // Verify second round-trip is also identical
  if (normalizeSource(reparsed.emitted) !== normalizedEmitted) {
    return { 
      passed: false, 
      details: `Second round-trip differs from first` 
    };
  }
  
  return { passed: true, details: 'OK' };
}

function main(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           C23 Parser Test Suite                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  const parser = new C23Parser();
  let passed = 0;
  let failed = 0;
  
  for (const testCase of TEST_CASES) {
    process.stdout.write(`Testing: ${testCase.name}... `);
    
    const result = runTest(testCase, parser);
    
    if (result.passed) {
      console.log('\x1b[32mPASS\x1b[0m');
      passed++;
    } else {
      console.log('\x1b[31mFAIL\x1b[0m');
      console.log(`  ${testCase.description}`);
      console.log(`  ${result.details}\n`);
      failed++;
    }
  }
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed, ${failed} failed ${' '.repeat(38 - `${passed}`.length - `${failed}`.length)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  if (failed > 0) {
    process.exit(1);
  }
}

main();