const fs = require('fs')
const path = require('path')
const execa = require('execa')
const osHomedir = require('os-homedir')

const homeDir = osHomedir()
const configFileName = 'c-tools.json'

const defaultConfigPath = path.join(homeDir, configFileName)

// 设置源白名单
const WHITELIST_PACKAGE_NAME = ['npm', 'yarn', 'pnpm']
// 重置源白名单
const WHITELIST_RESET_LIST = ['npm', 'yarn', 'cnpm', 'taobao', 'npmMirror']

function isExist (path) {
  return fs.existsSync(path)
}

async function writeFile ({ path, fileContent }) {
  const fileRes = fs.writeFileSync(path, fileContent, 'utf-8')
  if (fileRes) {
    console.error('无法创建文件:', fileName)
    return
  }
}

async function createDir ({ dir, fileName, fileContent }) {
  const dirRes = await fs.mkdirSync(dir, { recursive: true })
  if (dirRes) {
    console.error('无法创建目录:', dir)
    return
  }


  const fileRes = await fs.writeFileSync(path.join(dir, fileName), fileContent)
  if (fileRes) {
    console.error('无法创建文件:', fileName)
    return
  }
}

async function getConfigFile (configPath) {
  const content = fs.readFileSync(configPath, 'utf-8')

  if (content) {
    return { status: true, data: JSON.parse(content) }
  }

  return { status: false, data: JSON.parse(content) }
}

async function setRegistry (target, source) {
  try {
    switch (target) {
      case WHITELIST_PACKAGE_NAME[0]:
      case WHITELIST_PACKAGE_NAME[1]:
      case WHITELIST_PACKAGE_NAME[2]:
        Object.entries(source).forEach(([key, value]) => {
          console.log(`${target} config set ${key} ${value}`)

          execa(target, ['config', 'set', key, value])
        })
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
  WHITELIST_RESET_LIST,
  isExist,
  createDir,
  getConfigFile,
  setRegistry,
  writeFile,
}