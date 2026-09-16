const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const pidFile = path.join(root, '.healthifyx-dev.json')
const apiPort = process.env.API_PORT || '4000'
const children = [
  spawn(process.execPath, ['server/index.js'], { cwd: root, detached: true, stdio: 'ignore', env: { ...process.env, PORT: apiPort } }),
  spawn('npm', ['run', 'dev', '--prefix', 'client', '--', '--host', '127.0.0.1'], { cwd: root, detached: true, stdio: 'ignore', env: { ...process.env, VITE_API_PORT: apiPort } }),
]
children.forEach((child) => child.unref())
fs.writeFileSync(pidFile, JSON.stringify({ pids: children.map((child) => child.pid) }))
console.log(`HealthifyX started: API http://localhost:${apiPort}, dashboard http://localhost:5173`)