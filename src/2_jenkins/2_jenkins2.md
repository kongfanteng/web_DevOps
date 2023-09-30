# Jenkins2

## 1、jenkins

### 1.1

```bash
# Jenkins 持续集成工具；自动化构建、测试和部署功能；
sudo npm i create-react-app -g
create-gatsby react-cicd
# ci 持续集成 cd 持续部署
# https://gitee.com
# 创建 react-cicd 仓库


# 安装 jenkins
# 安装 插件

# 阿里云创建实例、按量付费、镜像 CentOS 7.6 64位、存储 40G，登录密码 1234，设置自动释放时间，12 小时后
# WebServer_47.99.118.19; JenkinsServer_120.26.84.165

cd /usr/local/src

# 安装 JDK
wget https://download.oracle.com/otn/java/jdk/8u381-b09/8c876547113c4e4aab3c868e9e0ec572/jdk-8u381-linux-x64.tar.gz
tar -xzvf jdk1.8.0_381.tar.gz
mkdir /usr/java
cp -r jdk1.8.0_381 /usr/java
ln -s /usr/java/jdk1.8.0_381/bin/java /usr/bin/java
ll /usr/bin/java
java -version
vi /etc/profile
  JAVA_HOME=/usr/java/jdk1.8.0_371
  export CLASSPATH=.:${JAVA_HOME}/jre/lib/rt.jar:${JAVA_HOME}/lib/dt.jar:${JAVA_HOME}/lib/tools.jar
  export PATH=$PATH:${JAVA_HOME}/bin
source /etc/profile
```

### 1.2

```bash
# 安装 jenkins
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install fontconfig java-11-openjdk -y
yum install jenkins -y
systemctl start jenkins
curl http://120.26.84.165:8080
cat /var/lib/jenkins/secrets/initialAdminPassword # 查看 Jenkins 密码
# 修改 Jenkins 密码，Jenkins 设置 system
# 插件管理-升级站点-https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json

# 安装插件
# Generic Webhook Trigger; Publish Over SSH; nvm wrapper;

# 关闭防火墙
systemctl stop firewalld.service
systemctl disable firewalld.service

# 配置 webhook

# jenkins 新建项目 react-cicd

# WebServer&jenkinsServer 安装 git
yum install -y git

# jenkins 添加全局凭据: 用户名 + 密码
```

### 1.3

```bash
# API Token -> 用户设置 -> 生成
# 项目 react-cicd 配置，构建触发器，勾选 Generic Webhook Trigger
# http://admin:11d04ffce08350f6398f1ca9502f13d94b@120.26.84.165:8080/generic-webhook-trigger/invoke?token=react-cicd
# JenkinsWeb，设置，API Token，复制 Token，替换 11d04ffce08350f6398f1ca9502f13d94b
# gitee，WebHooks 设置，粘贴 URL，勾选 Push 和激活
# 提交 gitee 后，JenkinsServer 服务器中搜索项目 
cd /var/lib/jenkins/workspace/react-cicd && ls
# 当前任务只负责拉取代码

# NVM Settings，Node version: v16.17.0

# 编写构建脚本
npm config set registry http://registry.npm.taobao.org
npm install
rm -rf build
npm run build
# 执行项目，查看下载目录中是否有 node_modules
cd /var/lib/jenkins/workspace/react-cicd && ls
```

### 1.4

```bash
# WebServer 安装 nginx
vi /etc/yum.repos.d/nginx.repo
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enable=1
yum install nginx -y
cd /usr/share/nginx/html
systemctl start nginx.service
# 安装成功后通过 ip 浏览器打开 http://47.99.118.19

# JenkinsWeb 执行 shell 新增压缩命令
cd build
tar -zcvf build.tar.gz *
# 查看 build 目录下存在 build.tar.gz

# 部署服务器
# JenkinsServer 生成 ssh
ssh-keygen -t rsa
# 系统设置，Publish over SSH, Path to key: /root/.ssh/id_rsa
# SSH Server, Name: WebServer, HostName: 47.99.118.19, Username: root, Remote Directory: /usr/share/nginx/html

# WebServer 免密码登录
ssh-copy-id 47.99.118.19
ssh-copy-id 120.26.84.165
```

### 1.5

```bash
# JenkinsWeb 增加构建后操作步骤; Send build artifacts over SSH
# Transfer Set, Source files: build/build.tar.gz; Remove prefix: build/; Exec command:
cd /usr/share/nginx/html
tar -xzvf build.tar.gz
rm -rf build.tar.gz
# 执行项目，浏览器打开 WebServerIP

# 执行项目后进行邮件提醒
# Extended E-mail Notification, SMTP server: smtp.qq.com; Default user E-mail suffix: @qq.com; User Name: nlhmtanupfwnbagb; 
# QQ 邮箱开启 SMTP 服务
# 填写密码
# 执行项目后查看是否收到邮箱 

# 参数化构建过程
# react-cicd 项目新增 dev 分支，修改后上传
git add -A && git commit -m "feat: xx" && git push origin master
```

## 2、jenkins

### 2.1

```bash
# JenkinsWeb 执行 shell
echo $BARNCH_NAME
echo $GIT_BRANCH
if [ $BARNCH_NAME == "master" ]; then
do
npm config set registry http://registry.npm.taobao.org
npm install
rm -rf build
npm run build
cd build
tar -zcvf build.tar.gz *
done
fi

# WebServer 测试 if.sh
vi if.sh
#!/bin/bash
if [ "a" == "a" ]; then
  echo "a"
fi

# JenkinsWeb 执行 shell
if [ $GIT_BRANCH == "origin/master" ]; then
  npm config set registry http://registry.npm.taobao.org
  npm install
  rm -rf build
  npm run build
fi
```
