#!/usr/bin/env node

const { program } = require('commander')
const execa = require('execa')
const iconv = require('iconv-lite')
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const packageJson = require('../package.json')
const {
  defaultConfigPath,
  homeDir,
  configFileName,
  WHITELIST_PACKAGE_NAME,
  WHITELIST_RESET_LIST,
  isExist,
  createDir,
  writeFile,
  getConfigFile,
  setRegistry
} = require('../utils')

program.version(packageJson.version, '-v --version', 'output the current version')

program.command('init')
  .description(`初始化配置表 ${configFileName}`)
  .action(async () => {
    if (isExist(defaultConfigPath)) {
      const { ok } = await inquirer.prompt([
        {
          name: 'ok',
          type: 'confirm',
          message: `该文件已存在，是否覆盖？`,
          default: false
        }
      ])

      if (!ok) {
        return
      }
    }

    const fileContent = fs.readFileSync(path.join(__dirname, '../utils/default-config.json'), 'utf-8')
    createDir({ dir: homeDir, fileName: configFileName, fileContent })
  })

program.command('list')
  .description('获取配置信息列表')
  .action(async () => {
    if (!isExist(defaultConfigPath)) {
      return console.log('找不到配置信息，请先进行初始化 init')
    }

    const { status, data } = await getConfigFile(defaultConfigPath)
    if (!status) {
      return console.log('找不到配置信息，请先进行初始化 init')
    }

    const configContent = []
    let keyMaxLength = 0

    data.forEach(({ key }) => {
      if (key.length > keyMaxLength) {
        keyMaxLength = key.length
      }
    })

    data.forEach((config) => {
      const { key, value } = config
      configContent.push(`${key.padEnd(keyMaxLength + 2, ' ')} --->   ${value.registry}`)
    })

    console.log(configContent.join('\n'))
  })

program.command('set')
  .description('设置源')
  .argument('<target>', '源目标')
  .argument('[source]', '源名称', 'npm')
  .action(async (target, source) => {
    if (!WHITELIST_PACKAGE_NAME.includes(target)) {
      return console.log(`源目标暂不支持设置 ${target}, 只支持 ${WHITELIST_PACKAGE_NAME.join(',')}`)
    }

    if (!isExist(defaultConfigPath)) {
      return console.log('找不到配置信息，请先进行初始化 init')
    }

    const { status, data } = await getConfigFile(defaultConfigPath)
    if (!status) {
      return console.log('找不到配置信息，请先进行初始化 init')
    }

    const sourceDetail = data.filter(s => s.key === source)[0]
    if (!sourceDetail) {
      return console.log(`未找到源信息：${source}`)
    }

    await setRegistry(target, sourceDetail.value)
  })

program.command('reset')
  .description('重置源')
  .argument('<target>', '设置源目标')
  .action(async (target) => {
    if (!WHITELIST_RESET_LIST.includes(target)) {
      return console.log(`重置源目标暂不支持设置 ${target}, 只支持 ${WHITELIST_RESET_LIST.join(',')}`)
    }

    if (!isExist(defaultConfigPath)) {
      return console.log('找不到配置信息，请先进行初始化 init')
    }

    const fileContent = fs.readFileSync(path.join(__dirname, '../utils/default-config.json'), 'utf-8')

    const targetDetail = JSON.parse(fileContent).filter(s => s.key === target)[0]
    if (!targetDetail) {
      return console.log(`未找到初始源信息：${source}`)
    }

    await setRegistry(target, targetDetail.value)
  })

program.command('add')
  .description('添加源')
  .argument('<target>', '设置源目标')
  .option('-r, --registry <registry>', '源地址')
  .option('-aa, --alwaysAuth [alwaysAuth]', '用户验证', false)
  .action(async (target, options) => {
    const { registry, alwaysAuth } = options
    if (!Object.keys(options).length) {
      return console.log('请通过查看 help add 命令参数')
    }

    if (!isExist(defaultConfigPath)) {
      return console.log('找不到配置信息，请先进行初始化 init')
    }

    let { status, data } = await getConfigFile(defaultConfigPath)
    if (!status) {
      return console.log('找不到配置信息，请先进行初始化 init')
    }

    const targetDetail = data.filter(s => s.key === target)[0]
    if (targetDetail) {
      const { ok } = await inquirer.prompt([
        {
          name: 'ok',
          type: 'confirm',
          message: `该源已存在，是否覆盖？`,
          default: false
        }
      ])

      if (ok) {
        data = data.filter(s => s.key !== target)
      }
    }

    const config = {
      key: target,
      value: {
        registry,
        'always-auth': alwaysAuth || false
      }
    }

    const newConfigList = [...data, config]

    writeFile({ path: defaultConfigPath, fileContent: JSON.stringify(newConfigList, null, 2) })
  })

// const encoding = 'cp936'
// const binaryEncoding = 'binary'
// function iconvDecode (str = '') {
//   return iconv.decode(Buffer.from(str, binaryEncoding), encoding)
// }


// async function runCommandWithProxy (port) {
//   const httpProxy = `http://127.0.0.1:${port}`
//   const httpsProxy = `https://127.0.0.1:${port}`

//   const proxyEnvironment = {
//     '$Env:http_proxy': httpProxy,
//     '$Env:https_proxy': httpsProxy,
//   }

//   // 设置代理环境变量
//   const env = { ...process.env, ...proxyEnvironment }
//   try {
//     // 利用代理环境运行 PowerShell 命令
//     //  -Command [Environment]::SetEnvironmentVariable('https_proxy', '${httpsProxy}')
//     const  command = `[Environment]::SetEnvironmentVariable('http_proxy', '${httpProxy}', 'Machine')`
//     const res = await execa('powershell.exe', ['-Command', command], {
//       stdio: 'inherit',
//     })
//     console.log(res, 'res');
//     console.log(res.stdout, 'res.stdout')

//     getCurrentPowerShellHttpProxy()
//   } catch (error) {
//     console.error('An error occurred:', error)
//   }
// }

// async function getCurrentPowerShellHttpProxy() {
//   try {
//     const { stdout } = await execa('powershell.exe', [
//       '-Command',
//       'echo $Env:http_proxy'
//     ]);
//     const httpProxy = stdout.trim();
//     console.log('Current http_proxy:', httpProxy);
//     return httpProxy;
//   } catch (error) {
//     console.error('Failed to get current http_proxy:', error);
//     return null;
//   }
// }

// // runCommandWithProxy()

// program.command('shp')
//   .description('set http-proxy')
//   .argument('[port]', 'proxy port', '7809')
//   .action(async (port) => {
//     runCommandWithProxy(port)
//     // try {
//     //   const { err, stdout, stderr } = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`)
//     //   // const { err, stdout, stderr } = await execa(`git remote -v`, { encoding: "buffer" })
//     //   console.log('err -> ', err)
//     //   console.log('stdout -> ', iconvDecode(stdout))
//     //   console.log('stderr -> ', stderr)
//     // } catch (error) {
//     //   // const { stdout } = await execa('netsh winhttp show proxy', { encoding: "buffer" })
//     //   console.log(error)
//     // }
//     // const {err, stdout, stderr} = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`)
//     // if (stdout) {
//     //   console.log(stdout)
//     // }

//     // const {stdout} = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`);
//     // const {stdout} = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`);
//     // console.log(stdout);
//   })

// program.command('ghp')
//   .description('get http-proxy')
//   .action(async (port) => {
//     const res = getCurrentPowerShellHttpProxy(port)
//   })


// async function gitCloneWithProxy({ url, port }) {
//   try {
//     const proxyServer = `http://127.0.0.1:${port}`; // 设置代理服务器地址和端口
//     const env = { ...process.env, http_proxy: proxyServer, https_proxy: proxyServer };

//     console.log(`About to clone ${url}`);
//     // 设置代理环境变量后执行 Git 克隆命令
//     await execa('git', ['clone', url], {
//       env,
//       stdio: 'inherit' // 将 Git 命令的输出打印到控制台
//     });

//     console.log('Git clone complete');
//   } catch (error) {
//   }
// }

// program.command('clone')
//   .description('get http-proxy')
//   .argument('<gitRepositoriesUrl>', 'git repositories URL')
//   .option('-p, --port [char]', 'http-proxy', '7890')
//   .action(async (gitRepositoriesUrl, options) => {
//     if (!gitRepositoriesUrl.includes('https://github.com')) {
//       return console.log(`not a git repositories URL: ${gitRepositoriesUrl}`);
//     }

//     gitCloneWithProxy({ url: gitRepositoriesUrl, port: options.port })
//   })

program.parse()