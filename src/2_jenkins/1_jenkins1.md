# Jenkins

## 1、jenkins: gitserver_webserver_jenkins server_插件管理 GitParameter_执行节点_流水线 pipeline

### 1.1 gitserver_webserver

```bash
# 持续集成
## 持续集成（Continuous Integration. CI）代码合并、构建、部署、测试为一体，不断执行这个过程并对结果进行反馈
## 持续部署（Continuous Deloyment. CD）部署到生产环境
## 持续交付（Continuous Delivery. CD）部署到生产环境，给用户使用

# 1. Git 服务器，就类似于搭建一个 github/gitee/gitlab
# 2. 搭建一个 Jenkins 服务器，类似老板角色
# 3. Jenkins 服务器有 slave 工作节点，负责工作
# 4. WebServer 部署服务器
# 新建 gitserver/webserver/jenkinsserver 服务器

# 安装 ifconfig
yum install net-tools -y

# IP
## gitserver 192.168.110.132
## webserver 192.168.110.133
## jenkins_server 192.168.110.134

# 关闭防火墙
systemctl stop firewalld.service
systemctl disable firewalld.service

# gitserver 服务器
yum install git -y
useradd git
passwd git # kong1994
su git
mkdir repos
pwd # /home/git/repos
mkdir dev-php.git && cd dev-php.git
git init --bare

# webserver 服务器
yum install git -y
cd /usr/local/src
git clone git@192.168.110.132:/home/git/repos/dev-php.git
cd dev-php
echo "<?php phpinfo()?>" > index.php
cat index.php
git add -A
git config --global user.name "KFT"
git config --global user.email kft@163.com
git commit -m "feat: 1. add index.php"
git push origin master

# 如何实现 SSH 的无密码登录
## 1. 要在客户端服务器生产一个公钥
## 2. 回到服务器，把这个客户端公钥添加到 authorize_keys

# 实现无密码登录
# webserver 服务器
ssh-keygen -t rsa
cat ~/.ssh/id_rsa.pub

# gitserver 服务器
cd /home/git/repos
ssh-keygen -t rsa
cd ~/.ssh
vi authorized_keys # webserver 公钥复制
chmod 600 authorized_keys
chmod 700  ~/.ssh

# webserver 服务器
cd /usr/local/src/dev-php
echo "<%php echo 'main' %>" > main.php
git add -A
git commit -m "feat: add main.php"
git push origin master
```

### 1.2 jenkins_server

```bash
# jenkins_server
# https://www.oracle.com/cn/java/technologies/javase/javase8u211-later-archive-downloads.html
wget https://download.oracle.com/otn/java/jdk/8u371-b11/ce59cff5c23f4e2eaf4e778a117d4c5b/jdk-8u371-linux-aarch64.tar.gz
tar -xzvf jdk-8u371-linux-aarch64.tar.gz
mkdir /usr/java
cp -r jdk1.8.0_371 /usr/java
ln -s /usr/java/jdk1.8.0_371/bin/java /usr/bin/java
/usr/bin/java -version
vi /etc/profile
  JAVA_HOME=/usr/java/jdk1.8.0_371
  export CLASSPATH=.:${JAVA_HOME}/jre/lib/rt.jar:${JAVA_HOME}/lib/dt.jar:${JAVA_HOME}/lib/tools.jar
  export PATH=$PATH:${JAVA_HOME}/bin
source /etc/profile
java -version
# https://pkg.jenkins.io/redhat-stable/
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install fontconfig java-11-openjdk -y
yum install jenkins -y
# 没有可用软件包 jenkins
## cd /etc/yum.repos.d/
## wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat/jenkins.repo
## rpm --import https://jenkins-ci.org/redhat/jenkins-ci.org.key
systemctl start jenkins
# http://192.168.110.134:8080/
# 初始密码-cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 1.3 插件管理_GitParameter

```bash
# 插件管理
## 升级站点
### https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json 
# 安装插件 
## Role-based Authorization Strategy; Extended Choice Parameter;Git Parameter; Pipeline: Groovy Libraries; Email Extension Plugin;
# 管理 Jenkins => 系统设置
## 主目录 /var/lib/jenkins
## 全局安全配置
### Jenkins 专有用户数据库 > “允许用户注册”选中
### 授权策略（插件安装完成后显示）
# Manage and Assign Roles
## Manage Roles
### 创建 dev/qa，选择 Read 权限
## Project roles
### mydev "dev-*" Build/Cancel/Read/Workspace
### myqa "qa-*" Build/Cancel/Read/Workspace
### dev 这个角色能管理看到任何以 dev- 开头的项目
# 创建账号 zhangsan 和 lisi
# Assign Roles
## Global roles
### zhangsan dev; lisi qa;
## Item roles
### zhangsan dev; lisi qa;
# 创建项目 dev-first
## dev-first 自由风格
### 执行 shell
#### echo dev-first
# 创建项目 qa-first
## qa-first 自由风格
### 执行 shell
#### echo dev-first

# dev-first
## 参数化构建过程
### branch master
## 执行 shell
  echo dev-first
  echo $branch
  sleep 5s
## 参数化构建过程
### branch 请输入你要部署的分支名
### Single Select; Delimiter ,; Choose Source for Value master,dev,first;

# webserver
git checkout -b dev
echo dev > dev.php
git add -A && git commit -m "feat: add dev.php" && git push origin master

# GitParameter
## jenkins_server
### Git Parameter
Name: branch
请选择一个分支
Parameter Type: Branch
Default Value: origin/master

# webserver
git remote -v

# jenkins_server
## 源码管理
### 选择 Git
### Repository URL: git_url
vi /etc/sysconfig/jenkins
JENKINS_USER="root"
systemctl restart jenkins
cd /usr/local/src
ssh-keygen -t rsa
cat /root/.ssh/id_rsa.pub
cat /root/.ssh/id_rsa # 私钥

# gitserver
vi ~/.ssh/authorized_keys

# jenkins_server JenkinsWeb
Credentials: xxx
## 开始构建 /origin/dev
```

### 1.4 执行节点

```bash
# 配置 => 执行者数量 2
# 节点管理 => webserver
# 标签 webserver; 描述: 这是一个工作节点，或者说从节点; 远程工作目录 /var/lib/jenkins; 

# webserver
ip addr # 192.168.110.133

# jenkins_server
vim /usr/lib/systemd/system/jenkins.service
  User=root
  Group=root
# 只允许运行绑定到这台机器的 Job
# 主机: 192.168.110.133
# 启动 webserver => 启动代理
ll /usr/bin/java
# dev-first 配置 限制项目运行节点 webserver
## webserver 配置 Java 环境
# dev-java 运行
```

### 1.5 流水线 pipeline

```bash
# 流水线 dev-php
  node('webserver'){
    stage ('checkout') {
      println "checkout"
    }
    stage ('build') {
      println "build"
    }
    stage ('deploy') {
      println "deploy"
    }
    stage ('test') {
      println "test"
    }
  }

# gitserver ============
mkdir -p /home/git/repos/Jenkinsfile.git
cd Jenkinsfile.git/
git init --bare

# jenkins_server ============
cd /usr/local/src
git clone git@192.168.110.132:/home/git/repos/Jenkinsfile.git
cd Jenkinsfile
vi Jenkinsfile
  node('webserver'){
    ...
  }
git add . && git commit -m 'feat: edit 1' && git push origin master
# 流水线配置
## SCM: Git; URL: git@gitserver:/home/git/repos/Jenkinsfile.git
## 脚本路径: Jenkinsfile
## 插件: Email Extension Plugin
```

## 2、jenkins

### 2.1 PHPInstall

```bash
# webserver ====
## 安装 php
cd /usr/local/src
yum -y install gcc gcc-c++ make automake autoconf libtool openssl-devel pcre-devel libxml2 libxml2-devel bzip2 bzip2-devel libjpeg-turbo libjpeg-turbo libjpeg-turbo-devel libpng libpng-devel freetype freetype-devel zlib zlib-devel libcurl libcurl-devel libjpeg-devel libmcrypt-devel
wget http://img.zhufengpeixun.cn/libmcrypt-2.5.8.tar.gz
tar -xzvf libmcrypt-2.5.8
cd /usr/local/src/libmcrypt-2.5.8 && \
./configure && \
make -j 2&& \
make install

## php-5.6.31
wget http://img.zhufengpeixun.cn/php-5.6.31.tar.gz
tar -xzvf php-5.6.31.tar.gz
cd /usr/local/src/php-5.6.31 && \
./configure --prefix=/usr/local/php --disable-debug --enable-shared --enable-fpm --with-fpm-user=root --with-fpm-group=root  --with-mysql=mysqlnd  --with-mysqli=mysqlnd --with-pdo-mysql=mysqlnd --with-libxml-dir=/usr --with-openssl --with-bz2 --with-mcrypt  --enable-gd-native-ttf --with-curl --with-zlib --with-zlib-dir -with-gettext --with-jpeg-dir --with-png-dir --with-bz2 --with-freetype-dir --with-iconv --with-config-file-path=/usr/local/php/etc --enable-mbstring --with-gd --disable-debug  --enable-short-tags --disable-posix --enable-exif --enable-ftp --enable-sockets --with-mhash --enable-zip --enable-xml && \
make -j 2 && \
make install
cp php.ini-production /usr/local/php/etc/php.ini
cp /usr/local/php/etc/php-fpm.conf.default /usr/local/php/etc/php-fpm.conf
# sed -i 's/127.0.0.1/0.0.0.0/g' /usr/local/php/etc/php-fpm.conf
# sed -i '89a daemonize = no' /usr/local/php/etc/php-fpm.conf
vi /usr/local/php/etc/php-fpm.conf
  user = root
  group = root
rm -rf /usr/local/src/php-5.6.31 && yum clean all
/usr/local/php/sbin/php-fpm -R -c /usr/local/php/etc/php-fpm.conf
kill -USR2 $(ps -ef | grep php-fpm | awk '{print $2}' | head -n 1)
netstat -anpt | grep 9000
```

### 2.2 部署Nginx_流水钱

```bash
# 部署 nginx
## 关闭防火墙
systemctl stop firewalld.service
systemctl disable firewalld.service
## 安装 nginx
vi /etc/yum.repos.d/nginx.repo
  [nginx]
  name=nginx repo
  baseurl=http://nginx.org/packages/centos/7/$basearch/
  gpgcheck=0
  enable=1
### 安装 nginx
yum install -y nginx
nginx -v
### 配置虚拟主机
mkdir -p /usr/share/nginx/html/dev-php
vi index.php
  <?php echo phpinfo() ?>
cd /etc/nginx/conf.d/
mv default.conf default.conf.bak
cp default.conf.bak dev-php.conf
vi dev-php.conf
  server_name www.dev-php.com;
  location ~\.php$ {
    root  /usr/share/nginx/html/dev-php;
    fastcgi_pass  127.0.0.1:9000
    fastcgi_index index.php
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
  }
http://localhost/index.php
vi /etc/nginx/nginx.conf
  user root;
systemctl start nginx.service
netstat -anpt | grep 80
vi /etc/hosts # 电脑配置 hosts
  192.168.110.133 www.dev-php.com
# cp /etc/hosts /Users/kongfanteng/Downloads/hosts
# http://www.dev-php.com/index.php # 电脑打开
git clone git@192.168.110.132:/home/git/repos/dev-php.git
cd dev-php

# jenkins_server
# JenkinsWeb
## 配置 Pipeline script from SCM
## URL: git@192.168.110.132:/home/git/repos/dev-php.git
## 生成流水线脚本
  checkout scmGit(branches: [[name: 'origin/master']], extensions: [], userRemoteConfigs: [[credentialsId: '50d80ba7-258f-4ce4-844f-018617995ac9', url: 'git@192.168.110.132:/home/git/repos/dev-php.git']])
vi Jenkinsfile
# 复制流水线脚本 checkout
git add -A && git commit -m "feat: edit" && git push origin master
# 测试：执行
# 流水线语法 => 全局变量参考
# 错误：ERROR: Error cloning remote repo 'origin'
## git 重新 yum install -y git

# webserver
# 配置假域名
vi /etc/hosts
192.168.110.134 www.dev-php.com

# jenkins_server
vi Jenkinsfile
stage('build') {
  sh '''
    rm -rf ${WORKSPACE}/.git
    [ -e /data/backup ] || mkdir -p /data/backup
    mv /usr/share/nginx/html/${JOB_NAME} /data/backup/${JOB_NAME}"_$(date +%F_%T)"
    cp -rf ${WORKSPACE} /usr/share/nginx/html
  '''
}
stage('test') {
  sh "curl http://www.${JOB_NAME}.com/index.php"
}

# webserver
echo new > new.php
git add -A && git commit -m "feat: add new.php" && git push origin master
```
