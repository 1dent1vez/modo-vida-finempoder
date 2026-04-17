import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const modulesDir = path.join(root, 'src', 'pages', 'modules');

const requiredKeys = ['moduleId:', 'lessonPathPrefix:', 'overviewPath:', 'lessons:'];

const checks = [];

for (const moduleDirent of fs.readdirSync(modulesDir, { withFileTypes: true })) {
  if (!moduleDirent.isDirectory()) continue;
  const moduleName = moduleDirent.name;
  const lessonFlowPath = path.join(modulesDir, moduleName, 'lessonFlow.ts');
  const relative = path.relative(root, lessonFlowPath).replace(/\\/g, '/');

  if (!fs.existsSync(lessonFlowPath)) {
    checks.push({ name: `${moduleName} has lessonFlow.ts`, ok: false });
    continue;
  }

  checks.push({ name: `${moduleName} has lessonFlow.ts`, ok: true });
  const content = fs.readFileSync(lessonFlowPath, 'utf8');

  for (const key of requiredKeys) {
    checks.push({
      name: `${relative} contains ${key}`,
      ok: content.includes(key),
    });
  }

  const moduleIdMatch = content.match(/moduleId:\s*'([^']+)'/);
  const lessonPrefixMatch = content.match(/lessonPathPrefix:\s*'([^']+)'/);
  const overviewPathMatch = content.match(/overviewPath:\s*'([^']+)'/);

  checks.push({
    name: `${relative} moduleId matches folder name`,
    ok: moduleIdMatch?.[1] === moduleName,
  });
  checks.push({
    name: `${relative} lessonPathPrefix points to module route`,
    ok: lessonPrefixMatch?.[1]?.startsWith(`/app/${moduleName}/lesson`) === true,
  });
  checks.push({
    name: `${relative} overviewPath points to module route`,
    ok: overviewPathMatch?.[1]?.startsWith(`/app/${moduleName}`) === true,
  });

  const ids = [...content.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  checks.push({
    name: `${relative} declares at least one lesson`,
    ok: ids.length > 0,
  });
  checks.push({
    name: `${relative} has no duplicated lesson ids`,
    ok: duplicates.length === 0,
  });
  checks.push({
    name: `${relative} lesson ids follow Lxx format`,
    ok: ids.every((id) => /^L\d{2}$/.test(id)),
  });
}

const failed = checks.filter((check) => !check.ok);

console.log('Guard rail: module lessonFlow config integrity');
for (const check of checks) {
  console.log(`${check.ok ? 'PASS' : 'FAIL'} - ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} checks failed.`);
  process.exit(1);
}

console.log('\nAll guard checks passed.');
