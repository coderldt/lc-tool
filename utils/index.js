const fs = require('fs')
const path = require('path')
const execa = require('execa')
const osHomedir = require('os-homedir')

const homeDir = osHomedir();
const configFileName = 'c-tools.json'

const defaultConfigPath = path.join(homeDir, configFileName)

const WHITELIST_PACKAGE_NAME = ['npm', 'yarn', 'pnpm']

function isExist(path) {
  return fs.existsSync(path);
}

async function createDir({ dir, fileName, fileContent }) {
  const dirRes = await fs.mkdirSync(dir, { recursive: true })
  if (dirRes) {
    console.error('无法创建目录:', dir);
    return;
  }


  const fileRes = await fs.writeFileSync(path.join(dir, fileName), fileContent)
  if (fileRes) {
    console.error('无法创建文件:', fileName);
    return;
  }

  console.log('文件已创建');
}

async function getConfigFile(configPath) {
  const content = fs.readFileSync(configPath, 'utf-8')

  if (content) {
    return { status: true, data: JSON.parse(content) }
  }

  return { status: false, data: JSON.parse(content) }
}

async function setRegistry(target, source) {
  try {
    switch(target) {
      case WHITELIST_PACKAGE_NAME[0]:
        execa('npm', ['config', 'set', 'registry', source])
        break
      case WHITELIST_PACKAGE_NAME[1]:
        execa('yarn', ['config', 'set', 'registry', source])
        break
      case WHITELIST_PACKAGE_NAME[2]:
        execa('pnpm', ['config', 'set', 'registry', source])
        break
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  homeDir,
  configFileName,
  defaultConfigPath,
  WHITELIST_PACKAGE_NAME,
  isExist,
  createDir,
  getConfigFile,
  setRegistry,
}