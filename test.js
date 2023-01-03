const fs = require('fs');
const { spawnAsync } = require('git-command-helper/dist/spawn');
const Hexo = require('hexo');
const path = require('path');

async function test() {
  const testFolder = path.join(__dirname, 'test');
  const generatedTemplate = path.join(
    testFolder,
    'themes/next/layout/hexo-generator-redirect.njk'
  );
  if (fs.existsSync(generatedTemplate)) fs.rmSync(generatedTemplate);
  await spawnAsync('npm', ['run', 'build'], { cwd: __dirname });
  const hexo = new Hexo(testFolder);
  const kill = () => hexo.exit();
  await hexo.init().catch(kill);
  await hexo.load().catch(kill);
  await hexo.call('generate');
}
