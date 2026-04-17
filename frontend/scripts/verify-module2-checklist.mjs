import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const appPath = path.join(root, 'src', 'App.tsx');
const lessonsDir = path.join(root, 'src', 'pages', 'modules', 'ahorro', 'lessons');
const unifiedOverviewPath = path.join(root, 'src', 'module-kit', 'components', 'ModuleOverview.tsx');
// La lógica real está en el LessonShell unificado del module-kit
const unifiedShellPath = path.join(root, 'src', 'module-kit', 'components', 'LessonShell.tsx');

const lessonIds = Array.from({ length: 15 }, (_, i) => `L${String(i + 1).padStart(2, '0')}`);

const appContent = fs.readFileSync(appPath, 'utf8');
const overviewContent = fs.readFileSync(unifiedOverviewPath, 'utf8');
const shellContent = fs.readFileSync(unifiedShellPath, 'utf8');

const checks = [];

for (const lessonId of lessonIds) {
  checks.push({
    name: `Route exists for ${lessonId}`,
    ok: appContent.includes(`/app/ahorro/lesson/${lessonId}`),
  });
}

for (const lessonId of lessonIds) {
  const lessonFile = path.join(lessonsDir, `${lessonId}.tsx`);
  const content = fs.readFileSync(lessonFile, 'utf8');
  checks.push({
    name: `${lessonId} uses LessonShell`,
    ok: content.includes('<LessonShell'),
  });
  checks.push({
    name: `${lessonId} does not write progress repository directly`,
    ok: !content.includes('lessonProgressRepository'),
  });
  checks.push({
    name: `${lessonId} does not hardcode next/overview navigation`,
    ok: !content.includes('nextPath=') && !content.includes('overviewPath='),
  });
}

checks.push({
  name: 'Overview uses ModuleLessonList',
  ok: overviewContent.includes('<ModuleLessonList'),
});
checks.push({
  name: 'LessonShell enforces locked guard',
  ok: shellContent.includes('<LockedLessonScreen'),
});
checks.push({
  name: 'LessonShell uses canonical previous path',
  ok: shellContent.includes('getPreviousLessonPath'),
});
checks.push({
  name: 'LessonShell uses canonical next path',
  ok: shellContent.includes('getNextLessonPath'),
});
checks.push({
  name: 'LessonShell persists progress through repository',
  ok: shellContent.includes('setCompleted(moduleId'),
});

const failed = checks.filter((item) => !item.ok);

console.log('Module 2 static checklist');
for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'} - ${item.name}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} checks failed.`);
  process.exit(1);
}

console.log('\nAll static checks passed.');
