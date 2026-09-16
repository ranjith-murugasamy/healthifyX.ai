const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const pidFile = path.resolve(__dirname, '..', '.healthifyx-dev.json')
if (!fs.existsSync(pidFile)) {
  console.log('HealthifyX is not running.')
  process.exit(0)
}
const { pids } = JSON.parse(fs.readFileSync(pidFile, 'utf8'))
pids.forEach((pid) => {
  try { execFileSync('kill', ['-TERM', String(pid)]) } catch { /* Process already stopped. */ }
})
fs.rmSync(pidFile, { force: true })
console.log('HealthifyX stopped.')