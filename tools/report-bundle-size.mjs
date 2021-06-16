#!/usr/bin/env zx
/* global $ */

(async () => {
  const prNumber = process.env.PR_NUMBER ?? null;
  const commitSha = process.env.COMMIT_SHA ?? null;

  $.verbose = false;

  const output = await $`bundlesize`;

  if (output.stderr) {
    process.stderr.write(output.stderr);
    process.exit(output.exitCode);
  }

  const files = output.stdout
    .split('\n')
    .filter((line) => line.trim().length > 0)
    // PASS  <path>: <size> <compression>
    .map((line) => line.trim().split(/\s+/).slice(1, 3))
    .filter((file) => file.length === 2);

  const content = [
    `## :package: bundlesize report (${commitSha})`,
    '',
    '| File | Size |',
    '| :--- | ---: |',
    ...files.map(([filePath, size]) => `| \`${filePath.replace(/:$/, '')}\` | ${size} |`),
  ].join('\n');
  if (prNumber) {
    // eslint-disable-next-line no-useless-escape
    await $`gh pr comment ${prNumber} --body=${content}`;
  } else {
    process.stdout.write(content.toString() + '\n');
  }
})();