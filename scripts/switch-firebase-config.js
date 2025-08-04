#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '..', 'src');


function findTsFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...findTsFiles(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function switchConfig(target) {
    console.log(`🔄 Switching to ${target} configuration...`);
    
    const files = findTsFiles(SRC_DIR);
    let changedFiles = 0;
    
    for (const file of files) {
        try {
            let content = fs.readFileSync(file, 'utf8');
            const originalContent = content;
            
            if (target === 'production') {
                // Switch from emulator to production
                content = content.replace(/from\s+["']@\/config\/firebaseConfig\.emulator["']/g, 'from "@/config/firebaseConfig"');
                content = content.replace(/from\s+["']\.\.\/\.\.\/\.\.\/config\/firebaseConfig\.emulator["']/g, 'from "../../../config/firebaseConfig"');
                content = content.replace(/from\s+["']\.\.\/\.\.\/config\/firebaseConfig\.emulator["']/g, 'from "../../config/firebaseConfig"');
            } else {
                // Switch from production to emulator
                content = content.replace(/from\s+["']@\/config\/firebaseConfig["']/g, 'from "@/config/firebaseConfig.emulator"');
                content = content.replace(/from\s+["']\.\.\/\.\.\/\.\.\/config\/firebaseConfig["']/g, 'from "../../../config/firebaseConfig.emulator"');
                content = content.replace(/from\s+["']\.\.\/\.\.\/config\/firebaseConfig["']/g, 'from "../../config/firebaseConfig.emulator"');
            }
            
            if (content !== originalContent) {
                fs.writeFileSync(file, content, 'utf8');
                changedFiles++;
                console.log(`✅ Updated: ${path.relative(process.cwd(), file)}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    }
    
    console.log(`\n🎉 Successfully updated ${changedFiles} files to use ${target} configuration!`);
    
    if (target === 'production') {
        console.log('\n📋 Next steps:');
        console.log('1. Restart your dev server: npm run dev');
        console.log('2. Your app is now using production Firebase services');
    } else {
        console.log('\n📋 Next steps:');
        console.log('1. Start emulators: firebase emulators:start --only auth,functions');
        console.log('2. Restart your dev server: npm run dev');
        console.log('3. Your app is now using Firebase emulators');
    }
}

function showUsage() {
    console.log(`
🚀 Firebase Config Switcher

Usage:
  node scripts/switch-firebase-config.js [production|emulator]

Examples:
  node scripts/switch-firebase-config.js production    # Switch to production
  node scripts/switch-firebase-config.js emulator     # Switch to emulator

This script will automatically update all import statements in your TypeScript files.
    `);
}

// Main execution
const target = process.argv[2];

if (!target || !['production', 'emulator'].includes(target)) {
    showUsage();
    process.exit(1);
}

try {
    switchConfig(target);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} 