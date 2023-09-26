# Nginx

## 1、nginx

### 1.1 nginx 背景

```bash
# nginx 应用场景
## 静态资源服务器
## 反向代理服务
## API 接口服务

# nginx 优势
## 高并发高性能
## 可扩展性好
## 高可靠性
## 热部署
## 开源许可证

# 同步、异步、阻塞、非阻塞
## 同步异步：大厅与后厨
## 阻塞非阻塞：后厨和厨师
## 大厅-用户空间；后厨-linux 内核；厨师-应用程序；

# 动静分离
## 静态内容 html、css、js 内核处理
## 动态内容 应用程序处理：内核->程序->内核->用户
## nginx 类似中间件
```

### 1.2 nginx 基础

```bash
# 关闭防火墙
systemctl stop firewalld.service
systemctl disable firewalld.service
vi /etc/selinux/config # SELINUX=disabled
yum -y install gcc gcc-c++ autoconf pcre pcre-devel make automake
yum -y install httpd-tools vim
# nginx download https://nginx.org/en/download.html
# https://nginx.org/en/nginx-1.24.0.tar.gz
# https://nginx.org/en/linux_packages.html
vi /etc/yum.repos.d/nginx.repo
/**
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1
 */
yum install nginx -y
nginx -v
nginx -V
rpm -ql nginx # nginx 资源位置
vi /etc/logrotate.d/nginx
ls /var/log/nginx/*.log
# include /etc/nginx/conf.d/*.conf;
systemctl restart nginx.service
tail -f /var/log/nginx/access.log
vi /etc/nginx/nginx.conf # 配置文件
/**
user nginx; # 设置运行此 nginx 用户名
worker_processes 1; # 工作的进程数
error.log ... # 指定错误日志的路径，日志的格式
pid ... # 文件，当前 nginx 的进程号
worker_connections 1024; # 工作进程的最大连接数 
include ... # 包含内容和文件后缀的对应关系
default_type ... # 默认的 Content-Type
log_format .. # 定义一个日志格式 main
access_log ... # 指定访问日志的存放位置，格式为 main
sendfile ... # 零拷贝模式
#tcp_nopush ... # TCP 不推有一定的缓存
keepalive_timeout 65; # 活动链接的超时时间
#gzip on; # 是否启动压缩
include ... # 包含其他配置文件
server # 每个 server 对应一个网站
listen 80; # 监听的端口号
server_name localhost 192.168.110.131; # 域名
#charset ... # 指定字符集
#access_log ... # 指定访问日志的位置和格式
location # 匹配所有路径
root ... # 静态文件根目录
index ... # 索引目录
# error_page 404 ... # 错误页面，返回的状态码是 404，会重定向到 /404.html
error_page 500 502 503 504 /50x.html; # 把服务器端错误状态码重定向到 50x.html 上
location = /50x.html {
  # 当路径是 /50x.html 时，转到 /usr/share/nginx/html/50x.html
  root /usr/share/nginx/html/50x.html
}
location ~\.php$ { # 如果访问的文件是 .php 结尾的话，会把此请求转发给 http://127.0.0.1
  proxy_pass http://127.0.0.1
} 
# location ~/\.ht {
  # 如果路径是 /.ht 时，禁止所有人访问
#   deny all;
# } 
 */
log_format main.. # 定义一个日志格式 main
http_x_forward_for=客户端 IP,Proxy(1)IP,Proxy(2)IP
cd /etc/nginx/conf.d/
cp default.conf default.conf.bak
mv default.conf status.conf
vi status.conf
/**
location = /status { # 监控 nginx 客户端状态
  stub_status on;
}
 */
nginx -s reload
http://192.168.110.131/status
```

### 1.3 随机主页_内容替换_请求限制_连接限制_访问控制

```bash
# 随机主页
cd / && mkdir -r /data/html
cd html
echo 1 > 1.html && echo 2 > 2.html && echo 3 > 3.html && ls
cp status.conf status.conf.bak
vi status.conf
  location / {
    root /data/html; # 静态文件根目录
    random_index on;
  }
nginx -s reload

# 内容替换
vi status.conf
# location / {
#   root /usr/share/nginx/index.html; # 静态文件根目录
#   index index.html index.htm;
#   sub_filter 'Welcome to nginx' 'Welcome KFT’;
#   sub_filter_once off;
# }

# 请求限制
ab -n 40 -c 20 http://localhost/ # 模拟并发请求
cp status.conf status.conf.bak
mv status.conf limit.conf
vi limit.conf
  http {
     …
     limit_req_zone $binary_remote_addr zone=req_zon:10m rate=1r/s;
  }
  location / {
    ...
    limit_req zone=req_zone burst=3 nodelay; # 每秒 1 个，偶尔 3 个
  }
ab -n 40 -c 20 http://localhost/

# 连接限制
vi limit.conf
  http {
     …
     limit_conn_zone $binary_remote_addr zone=conni:1m;
  }
  location / {
    ...
    limit_conn conn_zon 1;
  }

# 访问控制
mv limit.conf access.conf
vi access.conf
  location ~^/admin.html {
    root /usr/share/nginx/html;
    deny 192.168.110.131;
    allow all;
  }
cd /usr/share/nginx/html
touch admin.html
vi admin.html
tail -f /var/log/nginx/error.log
curl http://localhost/admin.html

# 必须登录后访问（用的不多）
vi access.conf
  server_name localhost;
  auth_basic ‘必须登录后才能访问此网站’;
  auth_basic_user_file /etc/nginx/users.conf;
htpasswd -c /etc/nginx/users.conf zhangsan
vi /etc/nginx/nginx.conf
  user  root;
  worker_processes  1;
systemctl restart nginx.service
```

### 1.4 下载 node

```bash
# 下载 nvm
# [Centos7安装nvm](https://www.cnblogs.com/hyf120/p/17447842.html)
wget https://codeload.github.com/nvm-sh/nvm/tar.gz/refs/tags/v0.39.3
tar -xvf v0.39.3
mv nvm-0.39.3/ /usr/local/nvm
cd /etc/profile.d/
vim nvm.sh
写入
#!/usr/bin/env bash
export NVM_DIR="/usr/local/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
sh ./nvm.sh
nvm -v
nvm node_mirror https://npm.taobao.org/mirrors/node/ 
nvm npm_mirror https://npm.taobao.org/mirrors/npm/
nvm install stable
```

### 1.5 node 执行文件_nginx 配置_gzip 压缩_download

```bash
# node 执行文件
npm -v #
mkdir -p /data/app && cd /data/app
vim 3000.js
const http = require('http')
const server = http.createServer(function(req, res) { res.end('3000') })
server.listen(3000, function(){ console.log('listen 3000') })
node 3000.js

# nginx 配置
ps -ef | grep nginx
pkill nginx
whereis nginx
mv access.conf static.conf
vi static.conf
location ~ ^/api {
  proxy_pass http://    localhost:3000;
}


# gzip 压缩
mv static.conf gzip.conf
vi gzip.conf
location ~ .*\.(jpg|png|gif) {
  gzip off;
  root /usr/share/nginx/html;
}
location ~ .*\.(html|js|css) {
  gzip on;
  gzip_min_length 1k;
  gzip_http_version 1.1;
  gzip_comp_level 9;
  gzip_types text/css application/javascript;
  root /usr/share/nginx/html;
}

# download
location ~ ^/download {
  gzip_static on;
  tcp_nopush on;
  root /usr/share/nginx/html;
}
mkdir -p /usr/share/nginx/html/download && cd /usr/share/nginx/html/download
touch gzip.txt
gzip gzip.txt
```
