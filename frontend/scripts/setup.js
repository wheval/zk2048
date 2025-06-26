#!/usr/bin/env node

/**
 * Setup script for ZK2048 Starknet Integration
 * This script helps configure the contract address and validate the environment
 */

const fs = require('fs')
const path = require('path')

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkEnvironment() {
  log('\n🔍 Checking Environment...', colors.cyan)
  
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, '..', 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found', colors.red)
    return false
  }

  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  // Check if Starknet dependencies are installed
  const hasStarknet = packageJson.dependencies && packageJson.dependencies.starknet
  const hasGetStarknet = packageJson.dependencies && packageJson.dependencies['get-starknet-core']
  
  if (!hasStarknet || !hasGetStarknet) {
    log('❌ Starknet dependencies missing', colors.red)
    log('Run: pnpm add starknet get-starknet-core', colors.yellow)
    return false
  }

  log('✅ Environment looks good', colors.green)
  return true
}

function updateContractAddress() {
  log('\n📝 Contract Configuration', colors.cyan)
  
  const configPath = path.join(__dirname, '..', 'lib', 'contract-config.ts')
  
  if (!fs.existsSync(configPath)) {
    log('❌ contract-config.ts not found', colors.red)
    return false
  }

  // Read current config
  let config = fs.readFileSync(configPath, 'utf8')
  
  // Check if placeholder is still there
  if (config.includes('0x123456789abcdef')) {
    log('⚠️  Contract address is still a placeholder', colors.yellow)
    log('Please update CONTRACT_ADDRESSES.ZK2048_GAME in:', colors.yellow)
    log(`   ${configPath}`, colors.bright)
    log('\nAfter deploying your contract, replace the placeholder with your actual contract address.', colors.yellow)
    return false
  }

  log('✅ Contract address is configured', colors.green)
  return true
}

function checkContractDeployment() {
  log('\n🚀 Contract Deployment Check', colors.cyan)
  
  const contractDir = path.join(__dirname, '..', '..', 'contract')
  
  if (!fs.existsSync(contractDir)) {
    log('❌ Contract directory not found', colors.red)
    log('Expected path: ../contract', colors.yellow)
    return false
  }

  const scarbToml = path.join(contractDir, 'Scarb.toml')
  if (!fs.existsSync(scarbToml)) {
    log('❌ Scarb.toml not found in contract directory', colors.red)
    return false
  }

  const targetDir = path.join(contractDir, 'target')
  if (!fs.existsSync(targetDir)) {
    log('⚠️  Contract not built yet', colors.yellow)
    log('Run in contract directory: scarb build', colors.yellow)
    return false
  }

  log('✅ Contract directory is ready', colors.green)
  return true
}

function displayNextSteps() {
  log('\n🎯 Next Steps:', colors.cyan)
  log('1. Make sure your contract is deployed to Starknet', colors.bright)
  log('2. Update the contract address in lib/contract-config.ts', colors.bright)
  log('3. Install dependencies: pnpm install', colors.bright)
  log('4. Start development server: pnpm dev', colors.bright)
  log('\n📖 For detailed instructions, see README.md', colors.cyan)
}

function main() {
  log('🎮 ZK2048 Starknet Frontend Setup', colors.bright)
  log('=====================================', colors.bright)
  
  const envOk = checkEnvironment()
  const contractOk = checkContractDeployment()
  const configOk = updateContractAddress()
  
  log('\n📊 Setup Summary:', colors.cyan)
  log(`Environment: ${envOk ? '✅' : '❌'}`, envOk ? colors.green : colors.red)
  log(`Contract: ${contractOk ? '✅' : '❌'}`, contractOk ? colors.green : colors.red)
  log(`Configuration: ${configOk ? '✅' : '❌'}`, configOk ? colors.green : colors.red)
  
  if (envOk && contractOk && configOk) {
    log('\n🎉 Setup complete! You can start the development server.', colors.green)
    log('Run: pnpm dev', colors.bright)
  } else {
    displayNextSteps()
  }
}

if (require.main === module) {
  main()
}

module.exports = { checkEnvironment, updateContractAddress, checkContractDeployment } 