# Docker

## 1、Docker

### 1.1 Docker 介绍\_Docker 应用场景

```bash
# Docker 是什么？
## Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样。

# Docker 应用场景
## 节省项目环境部署时间
### 单项目打包
### 整套项目打包
### 新开源技术
## 环境一致性
## 持续集成
## 微服务
## 弹性伸缩
```

### 1.2 Docker 安装\_阿里云镜像服务

```bash
# Docker 安装
# 官网安装链接: https://docs.docker.com/install/linux/docker-ce/centos/
## 安装
yum list | grep docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
sudo docker run hello-world
## 启动
## 查看 docker 版本

# 阿里云镜像服务
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

### 1.3 docker 命令

```bash
# Docker 类似 git，只记录改变

# docker 命令
docker image ls # 查看镜像
docker search ubuntu # 查找镜像
# 镜像仓库 https://hub.docker.com
docker image history ubuntu
docker image inspect ubuntu # RootFS > Layers[] 系统分层
docker image pull centos # 拉取镜像
docker image ls
docker image rmi hello-world # 删除镜像
docker image ls # ubuntu IMAGE ID ba6acccedd29
docker image rmi ba6acccedd29
docker image prune
docker image tag centos kft/centos7:latest
docker image ls
# docker login # kongfanteng **
# docker push kft/centos7:latest
docker logout
docker login -u "kongfanteng" -p "***" docker.io
docker images
docker tag kft/centos7:latest kongfanteng/kft-repository:v202310010000
docker push kongfanteng/kft-repository:v202310010000 # 网站查看 https://hub.docker.com/
```

### 1.4 容器命令

```bash
# 容器命令
docker container run hello-world
docker container ps # 查看当前运行的容器
docker container ps -a # 容器启动后退出
docker container ls
docker container ls -a # hello-world PORTS = cd65a323f0aa
docker container inspect cd65a323f0aa # "Cmd": [ "/hello" ]
docker container run -it centos /bin/bash
```

### 1.5 映射

```bash
# 映射
# nginx 80 => http://localhost:8080
docker run -p 8080:80 nginx
docker container ps -l
curl http://120.26.84.165:8080
docker container ps -l
docker logs id
docker run -d -p 8080:80 nginx # 后台执行
docker container top id
docker container port id
docker container stop id
docker container start id
docker container stop id
docker container rm id
docker container ps -a
docker container ps -a -q
docker container rm $(docker container ps -a -q)
```

## 2、Docker

### 2.1 执行容器

```bash
docker run -it ubuntu bash
cd /root
touch myroot.txt
exit
docker container ps -a # id = xx
docker commit -a"kft" -m"add myroot.txt" id myroot:latest
docker image ls
docker image list
systemctl start docker
docker image list
docker search centos
docker pull centos
docker image ls
# 基于镜像创建容器并执行 /bin/bash
docker run -it centos /bin/bash
cd /root && touch root.txt && ls
exit
docker run -it hello-world
```

### 2.2 打包容器

```bash
# 打包容器
docker container ps -a
docker export -o centos.tar id
docker container rm $(docker container ps -a -q)
docker import centos.tar
docker image ls # REPOSITORY = <none>
docker image prune
docker image ls
docker save -o hello-world.tar hello-world:latest
docker image rmi hello-world:latest
docker image ls
docker load -i hello-world.tar
# export 导出容器到文件.tar
# import 引入文件为容器
# save 镜像导出为文件.tar
# load 文件.tar 导入为镜像，不修改名字和标签
docker image ls
```

### 2.3

```bash
docker tag hello-world:latest kft/centos:v1 # tag = v1
docker run --publish 8080:80 nginx
curl http://localhost:8080
# 一个进程只有一个前台程序，在后台运行的事另一个进程

# 环境变量
docker run -it -e name="kft" centos /bin/bash
echo $name # kft
exit
docker container ps -a
docker container stop id
docker container rm $(docker container ps -a -q)
docker container run -it --rm centos /bin/bash # 容器执行完成后删除容器
echo hello
exit
docker run -d -p 18 nginx # id
docker container port id # 查看暴露端口 = 32768
curl http://localhost:32768
docker container attach id # 共享
docker run -d centos /bin/sh -c "while true; do echo hello; sleep 1s;done" # id
docker container ps -a
docker container exec -it id /bin/sh # 建议用 exec 取代 attach
```

### 2.4

```bash
docker run -d -p 8080:80 nginx # id
docker container logs id
docker stop id # 停止容器进程
docker kill id # 杀死容器进程
docker container ps
# docker 文件拷贝到本机
docker run -it ubuntu /bin/bash
echo u >> u.txt
exit
docker container cp a1b0a5a5aa8e:/u.txt /root && ls
```

### 2.5 commit

```bash
# commit-个性化镜像
docker run -it ubuntu /bin/bash
cd /root && echo love > love.txt
exit
docker container commit -m"我的个性化 Ubuntu" -a "kft" id kft/myubuntu:v1
docker image ls
docker run -it 3e15f7ec13c4 /bin/bash
cd ~ && ls # love.txt # 直观但不好管理
```

## 3、Docker

### 3.1 Dockerfile

```bash
# Dockerfile
mkdir /root/nodeapp && cd nodeapp
vi .dockerignore
  .git
  node_modules

# 安装 node
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
# 国内: bash -c "$(curl -fsSL https://gitee.com/RubyMetric/nvm-cn/raw/main/install.sh)"
source /root/.bashrc
nvm install stable # v16.17.0
npm i cnpm nrm -g
npm install express-generator -g
express app
vi Dockerfile
FROM node
COPY ./app /app
WORKDIR /app
RUN npm install
EXPOSE 3000
```

### 3.2 Dockerfile

```bash
docker build -t express-demo .
docker image ls # id
docker run -it id /bin/bash
npm start

vi Dockerfile
  ...
  CMD npm start

docker run -d -p 8080:3000 7445d8188be5 npm start
```

### 3.3 volume 数据盘

```bash
# 数据盘
docker container stop $(docker container ps -a -q)
docker container kill $(docker container ps -a -q)
docker container rm $(docker container ps -a -q)
docker container ls -a
docker volume create nginx-logger
docker volume ls
docker volume inspect nginx-logger
docker volume create nginx-html
docker run -d --name nginx1 --mount src=nginx-html,dst=/usr/share/nginx/html nginx # id
docker run -d --name nginx2 -v nginx-html:/usr/share/nginx/html nginx
docker container exec -it f3bb85cfd934 /bin/bash
cd /usr/share/nginx/html && ls
exit
docker container ps -a # id1 id2
docker container kill id1 id2
docker container rm id1 id2
docker volume ls -f dangling=true
docker volume rm nginx-logger
docker volume prune
hadoop hive hbase kafaka flume # 分析日志工具
docker run -v /mnt:/mnt -it --name logs centos bash
cd /mnt && touch mnt.txt && ls
exit
cd /mnt
# 创建不启动
docker create -v /logger:/logger --name logger centos
docker container ps -a
docker run --volumes-from logger --name logger1 -it centos bash
cd /logger && touch logger1.txt
exit
docker run --volumes-from logger --name logger2 -it centos bash
cd /logger && touch logger2.txt
exit
cd /logger && ls
```

### 3.4 网络\_noneNet

```bash
# 网络
docker network ls
docker run -d --name nginx1 nginx # 172.17.0.2
docker run -d --name nginx2 nginx # 172.17.0.3
docker exec -it nginx2 bash
apt-get update && apt install -y inetutils-ping
ping 172.17.0.2
docker run -d --name nginx3 --link nginx1 nginx # 172.17.0.4
docker exec -it nginx3 bash
apt-get update && apt install -y inetutils-ping
ping nginx1
cat /etc/hosts
172.17.0.2 nginx1 id
172.17.0.4 id

# noneNet
docker run -d --name nginx_none --net none nginx
docker container inspect id # IPAddress = ""; 无网络不能下载
```

### 3.5 hostNet\_随机端口

```bash
# host
docker run -d --name nginx_host --net host nginx
docker exec -it nginx_host bash
apt-get update && apt install iproute2
ip addr | grep --color=auto 192

# 随机端口
docker image inspect nginx # "ExposedPorts"
docker run -d --name port_nginx -p 80 nginx
docker container port port_nginx
docker run -d --name port_nginx2 --publish-all nginx
docker container inspect port_nginx2
```

## 4、Docker

### 4.1 自定义网络

```bash
# 自定义网络
docker network create --driver bridge finance_web
docker network create --driver bridge dev_web
docker network ls
docker run -d --name dev_nginx_2 --net dev_web nginx
docker run -d --name dev_nginx_3 --net dev_web nginx
docker run -d --name fin_nginx_1 --net finance_web nginx
docker run -d --name fin_nginx_2 --net finance_web nginx
docker exec -it dev_nginx_2 bash
apt-get update && apt-get install inetutils-ping
ping dev_nginx_3
docker container inspect dev_nginx_2 # IPAddress = 172.19.0.2
docker container inspect dev_nginx_3 # IPAddress = 172.19.0.3
docker container inspect fin_nginx_1 # IPAddress = 172.18.0.2
docker container inspect fin_nginx_2 # IPAddress = 172.18.0.3
docker exec -it dev_nginx_2 bash
ping 172.19.0.3
```

docker container rm `docker container ps -a -q`
docker container ls

### 4.2 连接到指定网络

```bash
# 连接到指定网络
docker network connect dev_web no_nginx
docker container inspect no_nginx # Networks: bridge + dev_web

# 使用 Docker 注意事项
## 1. 考虑选择哪些镜像
## 2. 按照合适的顺序启动容器
## 3. 管理容器中服务器
## 4. 如果服务器宕机了，负责重启
## 5. 服务负载过大，动态扩容
## 6. 程序更新后，动态升级镜像、容器和服务

# 趋势：k8s 取代 docker-compose
```

### 4.3 docker-compose

```bash
# docker-compose
yum -y install epel-release
yum -y install python-pip
yum -y install docker-compose
# 下载 v2 版本
# curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
# chmod +x /usr/local/bin/docker-compose
# yarml 语法 http://nodeca.github.io/js-yaml/
# yarml 格式化 http://www.bejson.com/validators/yaml/
mkdir -p /usr/local/src/nginx && cd /usr/local/src/nginx
vi docker-compose.yml
version: "2"
services:
  nginx1:
    image: nginx
    ports:
      - "8080:80"
  nginx2:
    image: nginx
    ports:
      - "5000:80"

docker-compose up -d
ifconfig | grep 120.26
# 浏览器打开 http://120.26.84.165:8080 & http://120.26.84.165:5000
docker-compose ps
docker-compose stop
docker-compose ps
docker-compose start
docker-compose ps
docker-compose logs -f
docker container stop `docker container ps -a -q`
docker exec -it nginx_nginx1_1 bash
exit
docker network ls # nginx_default
```

### 4.4 配置数据卷

```bash
# 配置数据卷
cd /usr/local/src/nginx
mkdir -p /usr/local/src/nginx/front && mkdir backend
cd front && echo front > index.html
cd ../backend && echo backend > index.html && cd ../
yum install -y tree
tree
vi docker-compose.yml
version: "2"
services:
  nginx1:
    image: nginx
    volumes:
      - "data:/data"
      - "./front:/usr/share/nginx/html"
    ports:
      - "8080:80"
  nginx2:
    image: nginx
    volumes:
      - "data:/data"
      - "./backend:/usr/share/nginx/html"
    ports:
      - "5000:80"
volumes:
  data:
    driver: local

docker-compose up -d
# 浏览器打开 http://120.26.84.165:8080 & http://120.26.84.165:5000
```

### 4.5 配置数据卷

```bash
# 配置数据卷
cd /usr/local/src/ && cp -r nginx webserver && cd webserver
docker-compose up -d
# 浏览器打开 http://120.26.84.165:8080 & http://120.26.84.165:5000
docker exec -it webserver_nginx2_1 bash
cd /data && echo 1 > 1.txt
exit
docker exec -it webserver_nginx1_1 bash
cd /data && cat 1.txt
echo 2 > /data/2.txt && ls
exit

vi docker-compose.yml
nginx1:
  image: nginx
  networks:
    - "myweb"
    - "default"
  ...
networks:
  myweb:
    driver: bridge

docker-compose up -d
docker network ls # webserver_myweb
```

## 5、Docker

### 5.1 nodeapp

```bash
# nodeapp
cd /usr/local/src/ && mkdir nodeapp && cd nodeapp
touch docker-compose.yml
# node => 放 node 项目；nginx => 放 nginx 项目
mkdir images && cd images && mkdir node && mkdir nginx
cd node && mkdir web && cd web

# 安装 node
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
# 国内: bash -c "$(curl -fsSL https://gitee.com/RubyMetric/nvm-cn/raw/main/install.sh)"
source /root/.bashrc
nvm install stable # v16.17.0
npm i cnpm nrm -g
node -v # v16.17.0
npm init -y
npm install mysql -S #
```

### 5.2

```bash
vi server.js
const http = require('http')
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'db',
  user     : 'kft',
  password : '123456',
  database : 'nodeapp'
});
connection.connect();
http.createServer((req, res) => {
  connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) res.end(error.message);
    console.log('The solution is: ', results[0].solution);
    res.end("solution" + results[0].solution)
  });
}).listen(3000, function(){console.log('node server started at port 3000')})
```

### 5.3

```bash
vi package.json
"scripts": {
  "start": "node server.js"
}

rm -rf node_modules
mkdir public && cd public
echo index.html > index.html
pwd # /usr/local/src/nodeapp/images/node/web/public
cd /usr/local/src/nodeapp/ && tree
cd /usr/local/src/nodeapp/images/node
vi Dockerfile
FROM node
MAINTAINER kongfanteng
COPY web /web
WORKDIR /web
RUN npm install
CMD npm start
```

### 5.4

```bash
vi docker-compose.yml
version: "2"
services:
  db:
    image: mariadb
    environment:
      MYSQL_ROOT_PASSWORD: "123456"
      MYSQL_DATABASE: "nodeapp"
      MYSQL_USER: "kft"
      MYSQL_PASSWORD: "123456"
    volumes:
      - dbdata:/var/lib/mysql
  node:
    build:
      context: "./images/node"
      dockerfile: Dockerfile
    depends_on:
      - db
  web:
    image: nginx
    ports:
      - "8080:80"
    depends_on:
      - node
    volumes:
      - "./images/nginx/conf.d:/etc/nginx/conf.d"
      - "./images/node/web/public:/usr/share/nginx/html"
volumes:
  dbdata:
    driver: local
```

### 5.5

```bash
mkdir -p images/nginx/conf.d && cd images/nginx/conf.d
vi default.conf
server {
  listen 80;
  server_name localhost IP;
  location / {
    root /usr/share/nginx/html;
    index index.html;
  }
  location /api {
    proxy_pass http://node:3000/;
  }
}

cd /usr/local/src/nodeapp && tree
docker-compose up --build -d
curl http://localhost:8080/api
cd /usr/local/src/nodeapp/images/web/public && echo index.html > index.html
curl http://localhost:8080/index.html
```
