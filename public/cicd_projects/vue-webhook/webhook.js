const crypto = require('crypto')
const SECRET = '123456'
const sign = (body) =>
  `sha1=${crypto.createHmac('sha1', SECRET).update(body).digest('hex')}`
const http = require('http')
let sendMail = require('./sendMail')
const { spawn } = require('child_process')

const server = http.createServer(function (req, res) {
  if (req.method === 'POST' && req.url == '/webhook') {
    const buffers = []
    req.on('data', function (buffer) {
      buffers.push(buffer)
    })
    req.on('end', function () {
      const body = Buffer.concat(buffers)
      const event = req.headers['x-github-event'] //evet = push
      const signature = req.headers['x-hub-signature']
      console.log('sign(body):', sign(body))
      console.log('signature:', signature)
      if (signature !== sign(body)) {
        return res.end('Not Allowed')
      }
      if (event === 'push') {
        // 开始部署
        const payload = JSON.parse(body)
        const child = spawn('sh', [`./${payload.repository.name}.sh`]);
        child.stdout.on('data', function (buffer) {
          buffers.push(buffer)
        })
        child.stdout.on('end', function () {
          const logs = Buffer.concat(buffers).toString();
          console.log('payload.head_commit:', payload.head_commit)
          sendMail(`
            <h1>部署日期: ${new Date()}</h1>
            <h1>部署人: ${payload.pusher.name}</h1>
            <h1>部署邮箱: ${payload.pusher.email}</h1>
            <h1>提交信息: ${payload.head_commit && payload.head_commit.id}</h1>
            <h1>部署日志: ${logs.replace("\r\n", "<br/>")}</h1>
          `)
        })
      } 
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true }))
    })
  } else {
    res.end('Not Found')
  }
})
server.listen(4000, () => {
  console.log('webhook 服务已经启动在 4000 端口！')
})
