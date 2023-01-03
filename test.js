const fs = require('fs');
const { spawnAsync } = require('git-command-helper/dist/spawn');
const Hexo = require('hexo');
const path = require('path');

test();

async function test() {
  const testFolder = path.join(__dirname, 'test');
  const generatedTemplate = path.join(
    testFolder,
    'themes/next/layout/hexo-generator-redirect.njk'
  );
  console.log('template exist', fs.existsSync(generatedTemplate));
  await spawnAsync('npm', ['run', 'build'], { cwd: __dirname });
  await spawnAsync('npm', ['install'], { cwd: testFolder });
  const hexo = new Hexo(testFolder);
  const kill = () => hexo.exit();
  await hexo.init().catch(kill);
  await hexo.load().catch(kill);
  await hexo.call('generate').catch(kill);
}
