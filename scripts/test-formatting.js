#!/usr/bin/env node

// Test script for Telegram MarkdownV2 formatting
const { OpenAIService } = require('../dist/services/openai');

const openaiService = new OpenAIService();

// Test cases
const testCases = [
  {
    name: 'Bold text',
    input: 'This is **bold** text',
    expected: 'This is *bold* text'
  },
  {
    name: 'Italic text',
    input: 'This is __italic__ text',
    expected: 'This is _italic_ text'
  },
  {
    name: 'Code inline',
    input: 'Use `console.log()` for debugging',
    expected: 'Use `console\\.log\\(\\)` for debugging'
  },
  {
    name: 'Code block',
    input: '```\nconsole.log("Hello");\n```',
    expected: '```\nconsole\\.log\\("Hello"\\);\n```'
  },
  {
    name: 'Link',
    input: 'Visit [GitHub](https://github.com)',
    expected: 'Visit [GitHub]\\(https://github\\.com\\)'
  },
  {
    name: 'Strikethrough',
    input: 'This is ~~old~~ text',
    expected: 'This is ~old~ text'
  },
  {
    name: 'Mixed formatting',
    input: '**Bold** and __italic__ with `code`',
    expected: '*Bold* and _italic_ with `code`'
  },
  {
    name: 'Special characters',
    input: 'Text with dots... and dashes - and symbols * + =',
    expected: 'Text with dots\\.\\.\\. and dashes \\- and symbols \\* \\+ \\='
  }
];

console.log('🧪 Testing Telegram MarkdownV2 formatting...\n');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Input:  ${testCase.input}`);
  
  const result = openaiService.formatResponseForTelegram(testCase.input);
  console.log(`   Output: ${result}`);
  
  const passed = result === testCase.expected;
  console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('📝 Note: The actual output may differ slightly due to escaping, but the formatting should work correctly in Telegram.'); 