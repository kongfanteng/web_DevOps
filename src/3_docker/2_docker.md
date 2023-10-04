# Docker

## 1、Docker

### 1.1 准备工作

```bash
# 准备工作

## 阿里云购买域名、ECS 服务器、备案
## 配置 ECS 服务器：root 密码；安全规则；
## 登录服务器 ssh root@120.26.84.165
### 新建用户
useradd devops
visudo # 授予 sudo 权限
devops ALL=(ALL:ALL) ALL

## 配置无密码登录

### 客户端
ssh-keygen -t rsa -b 4096 -C "1228318390@qq.com"
cat ~/.ssh/id_rsa.pub

### 服务器端
ssh-keygen -t rsa -b 4096 -C "1228318390@qq.com"
vi ~/.ssh/authorized_keys
chmod 644 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

## 修改SSH 端口
vi /etc/ssh/sshd_config
Port 22222
systemctl restart sshd.service
```

### 1.2 准备工作 & 安装 docker

```bash
# 准备工作

## 添加安全组规则
### 端口范围 22222/22222

# 安装 docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
docker version # docker 版本
docker info
```

### 1.3 阿里云加速

```bash
# 阿里云加速
# https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://qxbjf9n4.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 1.4

```bash
# docker-compose
下载 v2 版本
curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose 
docker-compose -v # v2.22.0
```

### 1.5 整体架构

#### 前端架构

虚拟 IP <=抢占= { 容器 1: ['keepalived', 'nginx1'], 容器 2: ['keepalived', 'nginx2'] } =负载均衡=> { nginx 集群: ['nginx1', 'nginx2'] }

#### 后端架构

虚拟 IP <=抢占= { 容器 1: ['keepalived', 'nginx均衡器1'], 容器 2: ['keepalived', 'nginx均衡器2'] } =负载均衡=> { node 服务器集群: ['node server1', 'node server2', 'node server3'] }

#### mysql 数据库集群

接收连接请求的虚拟 IP <= keepalived <= docker 内的虚拟 IP <=抢占= { 容器 1: ['keepalived', 'nginx均衡器1'], 容器 2: ['keepalived', 'nginx均衡器2'] } =负载均衡=> { mysql 服务器集群: ['mysql1', 'mysql2', 'mysql3'] }

#### mongodb 数据库集群

- 主服务器只有一台，主从复制（数据库同步备份的集群技术）

#### mysql 集群

- percona-xtradb-cluster 主主复制
- 数据强制一致性，要么所有节点都提交，要么不提交

## 2、Docker

### 2.1 安装集群

```bash
# 安装集群

## 下载镜像
docker pull percona/percona-xtradb-cluster:5.7.21
docker tag percona/percona-xtradb-cluster:5.7.21 pxc
docker image rm percona/percona-xtradb-cluster:5.7.21
docker image ls

## 创建内部网络
docker network create --subnet=172.18.0.0/24 znet
docker network inspect znet
docker network rm znet

docker container stop $(docker container ps -a -q)
docker container rm $(docker container ps -a -q)
```

### 2.2 数据库配置信息

```bash
连接名: 47.96.93.240（主）
主机: 47.96.93.240
端口: 3306
用户名: root
密码: 123456
```

### 2.3 创建主数据库

```bash
# 创建数据库 mysql2 & mysql3
vi pxc-master.yaml
version: '3'
services:
  pxc1:
    image: pxc
    restart: always
    container_name: node1_master
    privileged: true
    ports:
      - 3306:3306
    environment:
      - MYSQL_ROOT_PASSWORD=123456
      - CLUSTER_NAME=pxc_cluster
      - XTRABACKUP_PASSWORD=123456
    volumes:
      - v1:/var/lib/mysql
    networks:
      default:
        ipv4_address: 172.18.0.2
networks:
  default:
    external:
      name: znet
volumes:
  v1:
    driver: local

# 启动
docker-compose -f pxc-master.yaml up -d
# 数据库进行连接
```

### 2.4 新建从数据库

```bash
vi pxc-follow.yaml
version: '3.3'
services:
  pxc2:
    image: pxc
    restart: always
    container_name: node2
    privileged: true
    ports:
      - 3307:3306
    environment:
      - MYSQL_ROOT_PASSWORD=123456
      - CLUSTER_NAME=pxc_cluster
      - CLUSTER_JOIN=172.18.0.2
    volumes:
      - v2:/var/lib/mysql
    networks:
      default:
        ipv4_address: 172.18.0.12
  pxc3:
    image: pxc
    restart: always
    container_name: node3
    privileged: true
    ports:
      - 3308:3306
    environment:
      - MYSQL_ROOT_PASSWORD=123456
      - CLUSTER_NAME=pxc_cluster
      - CLUSTER_JOIN=172.18.0.2
    volumes:
      - v3:/var/lib/mysql
    networks:
      default:
        ipv4_address: 172.18.0.13
networks:
  default:
    external:
      name: znet
volumes:
  v2:
    driver: local
  v3:
    driver: local

# 启动
docker-compose -f pxc-follow.yaml up -d
# 数据库链接
```

### 2.5 数据库备份

```bash
# 数据库备份
wget -i -c https://dev.mysql.com/get/Downloads/MySQL-8.1/mysql-community-server-8.1.0-1.el7.x86_64.rpm
yum -y install mysql-community-server-8.1.0-1.el7.x86_64.rpm

wget -i -c http://dev.mysql.com/get/mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql-community-server
# 更新秘钥后重新下载: rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
systemctl start mysqld.service
## 3306 被占用解决: vi /etc/my.cnf => port=3309
systemctl status mysqld.service
mysql -uroot -p
## 查看初始密码: cat /var/log/mysqld.log | grep 'temporary password'
## 2SN%&tC)lTru
mysql -uroot -p2SN%&tC)lTru -P3309

## 修改密码: 
### set global validate_password_policy=LOW;
### set global validate_password_length=6;
### ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
## 刷新权限: FLUSH PRIVILEGES;

#!/bin/bash
DATE=$(date +%F_%H-%M-%S)
HOST=192.168.0.1
DB=test
USER=root
MAIL="18210591009@163.com"
BACKUP_DIR=/data/db_backup
SQL_FILE=${DB}_FULL_${DATE}.sql
cd $BACKUP_DIR
mysqldump -h$HOST -u$USER -p$PASS > $SQL_FILE
echo "$DATE 备份成功" | mail -s "备份成功通知" $MAIL
```

## 3、Docker

### 3.1 haproxy

```bash
useradd devops
# visudo # 授予 sudo 权限
# devops ALL=(ALL:ALL) ALL

docker pull haproxy:2.0
mkdir -p /home/devops/haproxy/
vi haproxy.cfg
global
  # 工作目录
  chroot /usr/local/etc/haproxy
  # 日志文件，使用 rsyslog 服务中的 lacal5 日志设备（/var/log/local5），等级 info
  log 127.0.0.1 local5 info
  # 守护进程运行
  daemon
defaults
  log   global
  mode    http
  # 日志格式
  option  httplog
  # 日志中不记录负载均衡的心跳检测记录
  option dontlognull
  # 连接超时（毫秒）
  timeout connect 5000
  # 客户端超时
  timeout client 50000
  # 服务器超时
  timeout server 50000
# 监控界面
listen  admin_stats
  # 监控界面的访问的 IP 和端口
  bind 0.0.0.0:8888
  # 访问协议
  mode  http
  # URI 相对地址
  stats uri /dbs
  # 统计报告格式
  stats realm   Global\ statistics
  # 登录账号信息
  stats auth    admin:123456
# 数据库负载均衡
listen proxy-mysql
  # 访问的 IP 和端口
  bind  0.0.0.0:3306
  # 网路协议
  mode tcp
  # 负载均衡算法（轮询算法）
  # 轮询算法：roundrobin
  # 权重算法：static-rr
  # 最少连接算法：leastconn
  # 请求源 IP 算法：source
  balance roundrobin
  # 日志格式
  option tcplog
  # 在 MySQL 中创建一个没有权限的 haproxy 用户，密码为空。Haproxy 使用这个账户对 MySQL 数据库心跳检测
  option mysql-check user haproxy
  server MySQL_1 172.18.0.2:3306 check weight 1 maxconn 2000
  server MySQL_2 172.18.0.12:3306 check weight 1 maxconn 2000
  server MySQL_3 172.18.0.13:3306 check weight 1 maxconn 2000
  # 使用 keepalive 检测死链
  option tcpka

# 在 MySQL 中创建一个没有权限的 haproxy 用户，密码为空。Haproxy 使用这个账户对 MySQL 数据库心跳检测
mysql -uroot -p123456
create user haproxy@'%';
GRANT privileges ON cms.* TO 'haproxy'@'%';
grant all privileges on cms.* to 'haproxy'@'%' with grant option;
FLUSH PRIVILEGES;

docker run -it -d -p 4001:8888 -p 4002:3306 -v /home/devops/haproxy:/usr/local/etc/haproxy --name haproxy1 --privileged --net=znet --ip 172.18.0.5 haproxy:2.0 # 启动容器脚本
docker container ls
## 数据库连接 4002
```

### 3.2 keepalived

```bash
# keepalived 双机热备
docker exec -it haproxy1 sh
apt-get update
apt-get install -y keepalived
vi keepalived.conf
vrrp_instance VI_1 {
  state MASTER
  interface eth0
  virtual_router_id 100
  priority 100
  advert_int 1
  authentication {
    auth_type PASS
    auth_pass 123456
  }
  virtual_ipaddress {
    172.18.0.201
  }
}

docker cp keepalived.conf haproxy1:/etc/keepalived
docker exec -it haproxy1 sh
service keepalived start
exit;
ping 172.18.0.201
docker container rm haproxy1 -f
docker run -it -d -p 4001:8888 -p 4002:3306 -v /home/devops/haproxy:/usr/local/etc/haproxy --name haproxy1 --privileged --net=znet --ip 172.18.0.5 haproxy:2.0
# 浏览器打开 ip:4001/dbs
```

### 3.3 持续集成和部署_后端项目

```bash
# 持续集成和部署
## 技术栈: 前台 Vue 后台 Node.js
## 服务器: 前台 nginx 后台 Node.js

# 后端服务(本地)
cd workspace
mkdir -p /Users/workplace/web_DevOps/public/cicd_projects/vue-back && cd /Users/workplace/web_DevOps/public/cicd_projects/vue-back

npm init -y
vi server.js
const http = require('http')
const users = [
  { id: 1, name: 'kft1' },
  { id: 2, name: 'kft2' },
]
const server = http.createServer(function(req, res) {
  if(req.url === '/api/users') {
    res.end(JSON.stringify(users));
  } else {
    res.end('Not Found');
  }
})
server.listen(3000, () => {
  console.log('后端 API 接口服务已经启动在 3000 端口！')
})

echo -e 'node_moudle\nlib\n.idea\n.package-lock.json\n.dockerignore' > .gitignore

vi package.json
"start": "node server.js"

npm run start # 启动
```

### 3.4 前端项目

```bash
# 前端项目
sudo npm install -g @vue/cli
vue create vue-front
cd vue-front
yarn add axios
vi src/App.vue
v-for="user in users" :key="user.id"
{{ user.id }}: {{ user.name }}

import axios from 'axios'

users: []

const { data } = await axios.get('http://localhost:3000/api/users')
this.users = data;

# 后端项目
cd vue-back
res.setHeader('Access-Control-Allow-Origin', '*');
```

### 3.5 WebHook

```bash
# CICD 服务器
mkdir vue-webhook && cd vue-webhook && npm init -y
yarn add nodemailer -S

# 后端项目
# GitHub 新建项目 vue-back & vue-front & vue-webhook
cd ../vue-back
git init
git remote add origin git@github.com:kongfanteng/vue-back.git
git push -u roigin master

# 前端项目
cd vue-front
git remote add origin git@.../vue-front.git
git push -u roigin master

# 阿里云申请 47.96.93.240; 实例名称: github;
# github 上填写 webhook 链接 http://47.96.93.240:4000/webhook

# 进入 github 阿里云服务器
yum update -y
## 安装 docker, 进行阿里云加速, 搜索 yum-utils & aliyuncs
yum install git -y ## 安装 git
# 生成公钥 搜索 ssh-keygen, 公钥复制到 github 仓库
mkdir /usr/projects && cd /usr/projects
git clone git@github.com:kongfanteng/vue-front.git
git clone git@github.com:kongfanteng/vue-back.git
git clone git@github.com:kongfanteng/vue-webhook.git
# 安装 node 和 npm: 搜索 v16.17.0
nrm use taobao
## 阿里云开放对应端口 3000
## 本地启动 vue-front 和 vue-back, 查看是否正确
```

## 4、Docker

### 4.1 vue-webhook

```bash
# 本地 vue-webhook
cd ../vue-webhook && vi webhook.js
const http = require('http')
const server = http.createServer(function(req, res) {
  console.log('req, res:', req, res)
  if(req.method === 'POST' && req.url == '/webhook') {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ok: true}))
  } else {
    res.end('Not Found');
  }
})
server.listen(4000, () => {
  console.log('webhook 服务已经启动在 4000 端口！')
})

echo -e 'node_modules\nlib\n.idea\n.package-lock.json\n.dockerignore' > .gitignore

## GitHub 新建仓库 vue-webhook
git remote add origin git@github.com:kongfanteng/vue-webhook.git
git a && git c && git p
```

### 4.2 vue-webhook

```bash
# 阿里云服务器

cd /usr/projects && git clone git@.../vue-webhook.git
node webhook.js

# 本地 vue-webhook
sudo npm i pm2 -g
vi package.json
"script": {
  "start": "pm2 start ./webhook.js --name webhook --watch",
  "stop": "pm2 stop webhook"
},
## 提交

# 阿里云服务器
cd /usr/projects/vue-webhook && git pull origin master

# 本地项目设置 Git 别名
vi ~/.gitconfig
[alias]
  a = add -A
  c = commit -m"msg"
  p = push origin master
  pull = pull origin master
```

### 4.3 vue-webhook

```bash
# 阿里云服务器
cd /usr/projects/vue-webhook && npm run start

# 本地 vue-back
git a && git c && git p

# 本地 vue-webhook
vi webhook.js
if (req.method == 'POST' && req.url === '/webhook') {
  const buffers = []
  req.on('data', function (buffer) {
    buffers.push(buffer);
  });
  req.on('end', function(buffer) {
    const body = Buffer.concat(buffers)
    const event = req.headers['x-github-event']; //evet = push
    const signature = req.headers['x-hub-signature']
  })
  // ...
}
```

### 4.4 vue-webhook

```bash
vi webhook.js
const crypto = require('crypto')
const SECRET = '123456'
const sign = (body) => `sha1=${ crypto.createHmac('sha1', SECRET).update(body).digest('hex') }`

vi webhook.js
if (signature !== sign(body)){
  return res.end('Not Allowed')
}

git a && git c && git pu
## 阿里云服务器拉取 git pull

# 本地 vue-back
cd ../vue-back && vi Dockerfile
FROM node
LABEL name="vue-back"
LABEL version="1.0"
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3000
CMD npm start

vi dockerignore
.gitignore
# Dockerfile
node_modules
```

### 4.5 vue-back

```bash
# 本地 vue-webhook
cd ../vue-webhook && vi vue-back.sh
#!/bin/bash
WORK_PATH='/usr/projects/vue-back'
cd $WORK_PATH
echo "先清除老代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "开始执行构建"
docker build -t vue-back:1.0 .
echo "停止旧容器并删除旧容器"
docker stop vue-back-container
docker rm vue-back-container
echo "启动新容器"
docker container run -p 3000:3000 --name vue-back-container -d vue-back:1.0

# 阿里云部署
cd /usr/projects/vue-webhook && sh vue-back.sh

curl http://localhost:3000/api/users
```

## 5、Docker

### 5.1

```bash
# 本地 vue-webhook
cd ../vue-webhook && vi vue-front.sh
#!/bin/bash
WORK_PATH='/usr/projects/vue-front'
cd $WORK_PATH
echo "先清除老代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "开始执行构建"
docker build -t vue-front:1.0 .
echo "停止旧容器并删除旧容器"
docker stop vue-front-container
docker rm vue-front-container
echo "启动新容器"
docker container run -p 80:80 --name vue-front-container -d vue-front:1.0

# 本地 vue-front
cd ../vue-front && vi Dockerfile
FROM nginx
LABEL name="vue-front"
LABEL version="1.0"
COPY ./dist /usr/share/nginx/html
WORKDIR ./vue-front.conf /etc/nginx/conf.d
EXPOSE 80

vi vue-front.conf
server {
  listen 80;
  server_name 47.96.93.240; // 填写的 ip
  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }
  location /api {
    proxy_pass http://47.96.93.240:3000;
  }
}

vi .dockerignore
.gitignore
# Dockerfile
node_modules
## 完成后提交 GitHub

# 阿里云服务器
cd /usr/projects/vue-webhook && sh vue-front.sh

# 浏览器查看 http://47.96.93.240
```

### 5.2

```bash
# 本地 vue-webhook
vi webhook.js
const { spawn } = require('child_process');
...
if (event == 'push') { // 开始部署
  const payload = JSON.parse(body);
  const child = spawn('sh', [`./${payload.repository.name}.sh`]);
  child.stdout.on('data', function(buffer) {
    buffers.push(buffer)
  })
  child.stdout.on('end', function(buffer) {
    const log = Buffer.concat(buffers);
    console.log('log:', log)
  })
}

# 提交到阿里云查看

# 本地 vue-front
vi /src/App.js
axios.get('/api/users')...

# 本地 vue-webhook
vi sendMail.js
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransporter({
  service: 'qq',
  port: 465,
  secureConnection: true,
  auth: {
    user: '1228318390@qq.com',
    pass: 'nlhmtanupfwnbagb',
  }
})
function sendMail(message) {
  const mailOptions = {
    from: '"1228318390" <1228318390@qq.com>', // 发送地址
    to: '1228318390@qq.com', // 接收者
    subject: '部署通知', 
    html: message, // 内容主体
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      return console.log(error)
    }
    console.log(`Message sent: %s ${info.messageId}`)
  })
}
module.exports = sendMail;

vi webhook.js
let sendMail = require('./sendMail')
...
child.stdout.on('end', function(buffer) {
  const logs = Buffer.concat(buffers).toString();
  sendMail(`
    <h1>部署日期: ${new Date()}</h1>
    <h1>部署人: ${payload.pusher.name}</h1>
    <h1>部署邮箱: ${payload.pusher.email}</h1>
    <h1>提交信息: ${ payload.head_commit && payload.head_commit.id }</h1>
    <h1>部署日志: ${logs.replace("\r\n", "<br/>")}</h1>
  `)
})

sudo npm i nodemailer -S
```

### 5.3

```bash

```

### 5.4

```bash

```

### 5.5

```bash

```
