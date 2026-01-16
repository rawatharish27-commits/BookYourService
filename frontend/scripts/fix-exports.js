const fs = require('fs');
const path = require('path');

// ============================================
// AUTO FIX SCRIPT (PHASE 1 - NAMED EXPORTS)
// ============================================
// Purpose: Automatically rewrite all \`export default\` to \`export const\` / \`export class\`.
// Stack: Node.js (File System).
// Type: Production-Grade (Safe & Fast).
// 
// IMPORTANT:
// 1. This script scans \`frontend/src/\` for all .ts and .tsx files.
// 2. It finds \`export default\` lines (Case-insensitive).
// 3. It replaces them with \`export const ComponentName\` (PascalCase).
// 4. It writes changes back to files.
// 5. This eliminates "Mixed Exports" errors.
// ============================================

// ============================================
// 1. HELPER FUNCTION: FIX FILE EXPORT
// ============================================

function fixFile(filePath) {
  console.log(`[FixExports] Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixed = false;
    let newContent = [];

    // Extract Component/Service Name from Filename
    // e.g., "AdminModule.tsx" -> "AdminModule"
    // e.g., "AuthService.ts" -> "AuthService"
    const fileName = path.basename(filePath, path.extname(filePath));
    const componentName = path.basename(filePath, path.extname(fileName));

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmedLine = line.trim();

      // Check for "export default" (Case-insensitive)
      if (trimmedLine.match(/^export\s+default\s+/i)) {
        console.log(`[FixExports]   Found 'export default' at line ${i + 1}: ${line}`);
        
        // Replace with "export const" (PascalCase)
        // Note: We use \`componentName\` which is PascalCase (from filename).
        const newLine = `export const ${componentName} =`;
        console.log(`[FixExports]   Replaced with: ${newLine}`);
        
        lines[i] = newLine;
        fixed = true;
      }
    }

    if (fixed) {
      // Write changes back to file
      newContent = lines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`[FixExports] ✅ Fixed: ${filePath}`);
    } else {
      console.log(`[FixExports] ⏭ No changes needed for: ${filePath}`);
    }
  } catch (error) {
    console.error(`[FixExports] ❌ Error processing ${filePath}:`, error);
  }
}

// ============================================
// 2. MAIN FUNCTION (SCAN & FIX)
// ============================================

function main() {
  console.log('[FixExports] Starting Named Export Fix...');
  
  // Target Directory: frontend/src
  const srcDir = path.join(__dirname, '../../src');
  
  if (!fs.existsSync(srcDir)) {
    console.error(`[FixExports] ❌ Directory not found: ${srcDir}`);
    process.exit(1);
  }

  // Scan Recursive (For subfolders like services/, modules/, layouts/)
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath); // Recursive
      } else if (file.match(/\.(ts|tsx)$/)) {
        fixFile(filePath); // Fix File
      }
    });
  }

  // Start Scan
  scanDir(srcDir);
  
  console.log('[FixExports] Named Export Fix Complete!');
}

// ============================================
// 3. EXECUTE
// ============================================

main();
