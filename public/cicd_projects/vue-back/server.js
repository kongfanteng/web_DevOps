const http = require('http')
const users = [
  { id: 1, name: 'kft1' },
  { id: 2, name: 'kft2' },
]
const server = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if(req.url === '/api/users') {
    res.end(JSON.stringify(users));
  } else {
    res.end('Not Found');
  }
})
server.listen(3000, () => {
  console.log('后端 API 接口服务已经启动在 3000 端口！')
})
