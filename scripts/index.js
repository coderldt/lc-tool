import { program } from 'commander'
import execa from 'execa'
import iconv from 'iconv-lite'

program
  .name('string-util')
  .description('CLI to some JavaScript string utilities')
  .version('0.8.0')

program.command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<oldName...>', 'string to split')
  // .argument('<newName>', 'string to split')
  // .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', '123321')
  .action((string, options) => {
    console.log('输出 action string —> ', string)
    console.log('输出 action options —> ', options)

  })

const encoding = 'cp936'
const binaryEncoding = 'binary'
function iconvDecode (str = '') {
  return iconv.decode(Buffer.from(str, binaryEncoding), encoding)
}


async function runCommandWithProxy (port) {
  const httpProxy = 'http://127.0.0.1:8080'
  const httpsProxy = 'https://127.0.0.1:8080'

  const proxyEnvironment = {
    '$Env:http_proxy': httpProxy,
    '$Env:https_proxy': httpsProxy,
  }

  // 设置代理环境变量
  const env = { ...process.env, ...proxyEnvironment }

  try {
    // 利用代理环境运行 PowerShell 命令
    const { stdout } = await execa('powershell', { env })
    console.log(iconvDecode(stdout))
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

runCommandWithProxy()

program.command('hp')
  .description('set http-proxy')
  .argument('[port]', 'proxy port', '7809')
  .action(async (port) => {
    runCommandWithProxy(port)
    // try {
    //   const { err, stdout, stderr } = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`)
    //   // const { err, stdout, stderr } = await execa(`git remote -v`, { encoding: "buffer" })
    //   console.log('err -> ', err)
    //   console.log('stdout -> ', iconvDecode(stdout))
    //   console.log('stderr -> ', stderr)
    // } catch (error) {
    //   // const { stdout } = await execa('netsh winhttp show proxy', { encoding: "buffer" })
    //   console.log(error)
    // }
    // const {err, stdout, stderr} = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`)
    // if (stdout) {
    //   console.log(stdout)
    // }

    // const {stdout} = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`);
    // const {stdout} = await execa(`$Env:http_proxy="http://127.0.0.1:${port}";$Env:https_proxy="http://127.0.0.1:${port}"`);
    // console.log(stdout);
  })




program.parse()