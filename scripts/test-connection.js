#!/usr/bin/env node

const dotenv = require('dotenv');
const { config } = require('../dist/config');
const { logger } = require('../dist/utils/logger');

// Load environment variables
dotenv.config();

async function testConnections() {
  console.log('🔍 Testing bot connections...\n');

  // Test 1: Environment Variables
  console.log('1. Checking environment variables...');
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    console.log('✅ Environment variables are configured');
  } catch (error) {
    console.log('❌ Environment variables error:', error.message);
    return false;
  }

  // Test 2: Telegram Bot Token
  console.log('\n2. Testing Telegram bot token...');
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || 'Unknown error');
    }
    console.log('✅ Telegram bot token is valid');
    console.log(`   Bot: @${data.result.username} (${data.result.first_name})`);
  } catch (error) {
    console.log('❌ Telegram bot token error:', error.message);
    return false;
  }

  // Test 3: OpenAI API Key
  console.log('\n3. Testing OpenAI API key...');
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const models = await openai.models.list();
    console.log('✅ OpenAI API key is valid');
    console.log(`   Available models: ${models.data.length}`);
  } catch (error) {
    console.log('❌ OpenAI API key error:', error.message);
    return false;
  }

  // Test 4: Configuration
  console.log('\n4. Testing configuration...');
  try {
    console.log('✅ Configuration loaded successfully');
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Log level: ${config.logLevel}`);
    console.log(`   OpenAI model: ${config.openai.model}`);
    console.log(`   Max conversation length: ${config.maxConversationLength}`);
  } catch (error) {
    console.log('❌ Configuration error:', error.message);
    return false;
  }

  console.log('\n🎉 All tests passed! Your bot is ready to run.');
  return true;
}

// Run tests
testConnections()
  .then((success) => {
    if (!success) {
      console.log('\n❌ Some tests failed. Please check your configuration.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Test failed with error:', error);
    process.exit(1);
  }); 