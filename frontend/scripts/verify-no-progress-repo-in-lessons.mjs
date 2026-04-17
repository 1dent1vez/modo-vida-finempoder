import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const modulesDir = path.join(root, 'src', 'pages', 'modules');

const lessonFiles = [];
for (const moduleDirent of fs.readdirSync(modulesDir, { withFileTypes: true })) {
  if (!moduleDirent.isDirectory()) continue;
  const lessonsDir = path.join(modulesDir, moduleDirent.name, 'lessons');
  if (!fs.existsSync(lessonsDir)) continue;

  for (const lessonFile of fs.readdirSync(lessonsDir)) {
    if (lessonFile.endsWith('.tsx')) {
      lessonFiles.push(path.join(lessonsDir, lessonFile));
    }
  }
}

const checks = [];
for (const lessonFile of lessonFiles) {
  const relative = path.relative(root, lessonFile).replace(/\\/g, '/');
  const content = fs.readFileSync(lessonFile, 'utf8');
  const writesProgressRepository = content.includes('lessonProgressRepository');
  checks.push({
    name: `${relative} does not use lessonProgressRepository`,
    ok: !writesProgressRepository,
  });
}

const failed = checks.filter((check) => !check.ok);

console.log('Guard rail: no progress repository access in lessons');
for (const check of checks) {
  console.log(`${check.ok ? 'PASS' : 'FAIL'} - ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} checks failed.`);
  process.exit(1);
}

console.log('\nAll guard checks passed.');
