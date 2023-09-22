# Linux

## 1、shell: cut_awk_sed_sort_wc_条件判断

### 1.1 cut

```bash
vi score.txt
/** 
name  score
z3  95
l4  85
w5  75
 */
cat score.txt | cut -f 2
cat /etc/passwd | cut -f 1,3 -d :
printf "%s\t%s\n" aa bb cc dd ee
printf "%s\n" abc def
printf "%1s\n" abc def
printf "%4s\n" abc def
printf "%5s\n" abc def
printf “%6.2f\n" 8988.888
df -h | grep /dev/sda5
printf "%s\t%s\t%s\t%s\t%s\t%s\n" $(df -h | grep /dev/sda5)
printf "%s\n" a b c
printf "%s\t%s\t%s\t%s\t%s\t%s\n" $(df -h | grep /dev/sda5) | cut -f 5
printf "%s\t%s\t%s\t%s\t%s\t%s\n" $(df -h | grep /dev/sda5) | cut -f 5 | cut -d % -f 1
```

### 1.2 awk

```bash
df -h | grep /dev/nvme0n1p1 | awk '{print $5}'
df -h | awk '{print $5}'
df -h | grep /dev/nvme0n1p1 | awk '{print $5}' | cut -d % -f 1
awk '{print $1}' numbers.txt
awk 'BEGIN{sum=0}{sum=sum+$1}END{print sum}' numbers.txt
awk 'BEGIN{print "开始"}{print $1}END{print "结束"}' numbers.txt
awk 'BEGIN{FS=":"}{print $1,$3}' /etc/passwd
cat score.txt | grep -v score | awk '$2>90{print $1"\t优秀"}$2>80{print $1"\t良好""}'
```

### 1.3 sed 轻编辑器

```bash
sed 'a newline' line.txt
/** 
a
newline
bob
newline
cccc
asdfsd
asdfsdf
sadfds
 */
sed 'c newline' line.txt
sed 'li newline' line.txt
sed '3d' line.txt
sed -n '2p' line.txt
sed '2p' line.txt
sed -n '2p' line.txt
sed 's/cccc/ffff/g' line.txt
sed 's/c/f/g' line.txt
sed -i 's/c/f/g' line.txt # 改变源文件
cat line.txt
sed -e 's/k/2/g;s/p/3/g' line.txt # 批量
```

### 1.4 sort & wc

```bash
cat /etc/passwd | sort -r -f -k 3,3 -t ":" -n # -r 倒序
vi line.tt
/** 
I love
you
 */
cat line.tt
cat line.tt | wc # 行数 单词数 字符数; 2 3 11
cat line.tt | wc -l # 行数
cat line.tt | wc -w # 单词数
cat line.tt | wc -m # 字符数
```

### 1.5 条件判断

```bash
touch 1.txt
test -e 1.txt
echo $?
[ -e 1.txt ] && echo 'yes' || echo 'no' # 文件是否存在判断
[ -e 2.txt ] && echo 'yes' || echo 'no'
rm -rf *
touch 1.txt
test -e 1.txt
echo $?
[ -e 1.txt ] && echo 'yes' || echo 'no'
[ -e 2.txt ] && echo 'yes' || echo 'no'
[ -f 2.txt ] && echo 'yes' || echo 'no' # 文件是否存在且是普通文件
[ -f 1.txt ] && echo 'yes' || echo 'no'
[ -d 1.txt ] && echo 'yes' || echo 'no'
mkdir folder
[ -d folder ] && echo 'yes' || echo 'no'
```

## 2、shell: 内核&内存&硬盘_判断文件权限_比较_if_case

### 2.1 内核&内存&硬盘

```bash
# 内核写入内存（快），内存写入硬盘（慢）
# 内存小
# 字符设备 c
cd /dev/input
# 管道文件
find / -type p
# 套接字
find / -type s # 找 .socket 文件
ll xx.socket
# tcp 连接是基于 socket

let net = require('net')
# socket .i websocket socket
let server = net.createConnection(function(socket){
  # socket 套接字的，为什么它叫 socket（插座、套接字）
  # 双方都是异构的，但遵守一样的标准和协议
  socket.write('hello')
})
server.listen(8080)

```

### 2.2 判断文件权限

```bash
cd /root
touch read.txt
touch write.txt
touch exec.txt
[ -r read.txt ] && echo 'yes' || echo 'no' # yes
[ -w write.txt ] && echo 'yes' || echo 'no' # yes
[ -x exec.txt ] && echo 'yes' || echo 'no' # no
chmod 755 exec.txt
./exec.txt
```

### 2.3 比较

```bash
touch old.txt
touch new.txt
[ new.txt -ot old.txt ] && echo 'yes' || echo 'no' # 判断文件新旧 # no
[ new.txt -nt old.txt ] && echo 'yes' || echo 'no'
ln new.txt new2.txt # yes
[ new.txt -ef new2.txt ] && echo 'yes' || echo 'no'
name=zf # yes∫∫∫∫
[ -z name ] &&  && echo 'yes' || echo 'no' # 是否为空 no 
[ -n name ] && echo 'yes' || echo 'no' # 是否非空 yes
[ a != a ] && echo 'yes' || echo 'no' # no
[ a == a ] && echo 'yes' || echo 'no' # yes
[ name == 'zf' ] && echo 'yes' || echo 'no' # yes
[ "$name" == 'zf' ] && echo 'yes' || echo 'no' # yes
age=x100
[ -z age ] && echo 'yes' || echo 'no' # no
age=
unset age
echo $age # 空
[ -z age ] && echo 'yes' || echo 'no' # no
[ -z 'age' ] && echo 'yes' || echo 'no' # no
[ -z '' ] && echo 'yes' || echo 'no' # yes
```

### 2.4 比较

```bash
# 多重条件判断
[ 2 -gt 1 -a 3 -gt 2 ] && echo 'yes' || echo 'no' # yes
[ 2 -gt 1 -o 2 -gt 1 ] && echo 'yes' || echo 'no' # yes
[ ! 2 -gt 1 ] && echo 'yes' || echo 'no' # no

# 单分支 if 语句
# if fi case esac
if [ 2 -gt 1 ]
then
echo "2 > 1"
fi
# usr(Unix System Resource)
vi isRoot.sh
/**
#!/bin/bash
currentUser=$(whoami)
if [ "$currentUser" == root ]
then
echo "当前登录用户是 root"
fi
 */
chmod 755 isRoot.sh
./isRoot.sh

# 双分支 if 语句
vi isDir.sh
/**
#!/bin/bash
read -t 10 -p "请输入一个目录名或文件名" dir
if [ -d "$dir" ]
then
  echo "$dir 是一个目录"
else
  echo "$dir 不是一个目录"
fi
 */
sh isDir.sh
/root/xx.txt
```

### 2.5 if_case

```bash
# 多分支 if 语句
## 用户输入一个分数 95
## 给出判断 >90 优秀 >70 良好 >=60 及格 <60 不及格
vi grade.sh
/**
#!/bin/bash
read -p "请输入一个分数：" grade
if [ "$grade" -gt 90 ]
then
  echo "优秀"
elif [ "$grade" -gt 70 ]
then
  ehco "良好"
elif [ "$grade" -ge 60 ]
Then
  ehco "及格"
else
  ehco "不及格"
fi
 */
sh grade.sh
91, 90, 80, 50, 60

# case 语句
## 给出判断 A-优秀 B-中等 C-及格 其他-不及格
vi level.sh
/**
#!/bin/bash
read -p "请输入一个级别（A/B/C）？ " -n 1 level
echo -e "\n"
case $level in
  "A")
    echo "优秀"
  ;;
  "B")
    echo "中等"
  ;;
  "C")
    echo "及格"
  ;;
  *)
    echo "不及格"
  ;;
esac
 */
sh level.sh
依次调用输入: A, B, C, D
```

## 3、shell: for_while_until_函数_profile_软件包管理_yum

### 3.1 for_while_until

```bash
# for 循环 =================
for i in 1 2 3 4
do
echo $i
done;
for i in $(ls)
do
echo $i
done
for( (i = 1; i<=10; i++) )
do
echo $((i))
done

# echo =================
echo 1 > 1.txt
x=$(cat 1.txt)
echo $x # 1
a=10 && b=10
y=$((a+b))
echo $y # 20

# while 循环 =================
vi while.sh
/**
#!/bin/bash
read -p "请输入一个数字：" max
echo -e "\n"
i=1
result=0
while [ $i -le $max ]
do 
  result=$((result + $i))
  i=$(($i + 1))
done
echo $result
 */
sh while.sh
# 输入 55

# echo =================
x=10
y=$((x + 10))
echo $y # 20
y=$(($x + 10))
echo $y # 20

# until 循环 =================
## 直到条件不成立停止
vi until.sh
/**
#!/bin/bash
read -p "请输入一个数字：" max
echo -e "\n"
i=1
result=0
until [ $i -gt $max ]
do 
  result=$((result + i))
  i=$((i + 1))
done
echo $result
 */
sh until.sh
```

### 3.2 函数

```bash
# 函数 ======================
function hello() {
  echo hello
}
hello # 调用; 输出 hello
sum() {
  return $(($1 + $2))
}
sum 1 2
echo $?
sum2() {
  for i in "$@"
  do
    echo "$i"
  done
}
sum2 1 2 3
vi hello.sh
/**
echo 1
echo 2
echo 3
 */
sh -x hello.sh # 调试
```

### 3.3 profile

```bash
# profile
set -x # 打开 shell 调试开关
echo $-
set +x
echo $-
echo "${-#*i}"
echo a
!!
!!
echo g{a,b,c}$
set +B
echo g{a,b,c}$
sleep 100s
fg 1
a=${-#*i} # 删掉 $- 值中 i 之前的数据
echo $a
b=$-
echo $b
name1=aibic
echo "${name1}" # aibic
echo "${name1#*i}" # bic
echo "${name1%i*}" # aib
[ "${name1#*i}" != "$name1" ] && echo 'yes' || echo no # yes
[ "${name1#*z}" != "$name1" ] && echo 'yes' || echo no # no

# 拷贝
## 本地文件拷贝到 linux 服务器
scp mlog root@192.168.0.22:/root
## linux 服务器拷贝到本地
scp root@192.168.0.22:/root/new.txt new.txt

# profile
name2=aibicid
echo "${name2}"
echo "${name2#*i}" # bicid
echo "${name2#*I}" # aibicid

# 标准输出与错误输出
touch a.txt
vi a.txt
cat a.txt > a.log
cat a.log
cat aaa.txt >> a.log 2>&1
cat a.log
cat a.txt > a.log # 标准输出
echo "" > a.log
cat aa.txt > a.log 2> a.log # 错误输出
cat a.txt && cat aa.txt >> a.log 2>&1
```

### 3.4 软件包管理

```bash
# RPM(RedHat Package Manager)(RedHat 软件包管理工具)，类似 Windows 的“添加/删除程序”
# 软件包的分类：源码包、二进制包、脚本安装包
mdkir /mnt/cdrom
cd /mnt/cdrom
mount /dev/sr0 /mnt/cdrom # 加载光驱
ll | grep httpd # apache 2.0 改名 httpd
vi txt
# 1
# 222
# 3333
# 44444
# 555555
tail -f txt
echo `date` >> txt

# 安装 htppd
yum -y install httpd mod_wsgi
systemctl start httpd
# 启动 httpd 报错解决
/**
ps –aux | grep http
kill -9 pid
yum remove httpd mod_wsgi
yum -y install httpd mod_wsgi
service httpd restart
*/
curl http://localhost # 创建服务器
service iptables stop # 关闭防火墙，通过 IP 访问
rpm -e httpd # 卸载 httpd
rpm -q httpd # 查看 httpd 是否安装
rpm -qi httpd # 查看 httpd 详情
rpm -qR httpd | more
vi /etc/httpd/conf/httpd.conf # apche 配置文件
rpm -V httpd # 配置文件位置
```

### 3.5 YUM 在线管理

```bash
cd /etc/yum.repos.d/
cat CentOS-Base.repo

# 光盘搭建 YUM 源
mv CentOS-Base.repo CentOS-Base.repo.bak # 失效在线 yum 源
ls
yum list | grep httpd
yum install httpd
vi CentOS-Media.repo # enabled=1
yum list | grep httpd

# yum 命令
mv CentOS-Base.repo.bak CentOS-Base.repo
yum list | grep httpd
yum search httpd
yum grouplist | grep 中
yum groupinstall "中文支持"
yum install gcc
```

## 4、shell: 源码包管理_脚本安装包

### 4.1 源码包管理

```bash
# Mac M2 芯片虚拟机安装 httpd
yum install gcc
wget http://archive.apache.org/dist/httpd/httpd-2.4.9.tar.gz
wget http://archive.apache.org/dist/apr/apr-1.5.0.tar.gz
wget http://archive.apache.org/dist/apr/apr-util-1.5.3.tar.gz
wget http://downloads.sourceforge.net/pcre/pcre-8.34.tar.bz2

tar -xzvf apr-1.5.0.tar.gz
cd apr-1.5.0/
./configure --prefix=/usr/local/apr 
make && make install

tar -xzvf apr-util-1.5.3.tar.gz
cd apr-util-1.5.3/
./configure --prefix=/usr/local/apr-util --with-apr=/usr/local/apr/
make && make install

tar -xvjf  pcre-8.34.tar.bz2
cd ./pcre-8.34/
./configure --prefix=/usr/local/pcre/
make && make install

tar -zxvf  httpd-2.4.9.tar.gz
cd ./httpd-2.4.9/
cp -rf /root/apr-1.5.0 /root/httpd-2.4.9/srclib/apr
cp -rf /root/apr-util-1.5.3 /root/httpd-2.4.9/srclib/apr-util
cp -rf /root/pcre-8.34 /root/httpd-2.4.9/srclib/pcre
./configure --prefix=/usr/local/httpd --with-apr=/usr/local/apr/ --with-apr-util=/usr/local/apr-util/ --with-pcre=/usr/local/pcre/ --with-included-apr --with-included-pcre
make && make install

/usr/local/httpd/bin/apachectl start
ps -aux | grep httpd # 查看 httpd 运行 pid
举例: http://192.168.0.102 # 浏览器打开 It works!
cd /usr/local/httpd/htdocs && ls
cat index.html
cat /etc/httpd/conf/httpd.conf # 配置文件：端口、域名...
```

### 4.2 脚本安装包

```bash
# LNMP https://lnmp.org/install.html
wget http://soft.lnmp.com/lnmp/lnmp2.0.tar.gz -O lnmp2.0.tar.gz && tar zxf lnmp2.0.tar.gz && cd lnmp2.0 && ./install.sh lnmp
runlevel # 运行级别
cat /etc/inittab
chkconfig --list | wc -l
sleep 10000s
ps aux | grep sleep
netstat -tunl
netstat -tulp # 查询系统中监听的端口
cat /etc/services | grep smtp

# nginx
yum list | grep nginx
rpm -ivh http://nginx.org/packages/centos/7/aarch64/RPMS/nginx-1.24.0-1.el7.ngx.aarch64.rpm
yum info nginx
yum install epel-release
yum install -y nginx
ps aux | grep nginx
cd /etc/init.d
ll | grep nginx
service iptables stop # 关闭防火墙
/etc/init.d/nginx start
./nginx stop
service nginx status
./nginx
./nginx configtest # 查看配置文件 /usr/local/nginx/conf/nginx.conf
chkconfig --list | grep nginx
/etc/init.d/iptables stop
chkconfig --list | grep iptables
# redhat centos 关系：centos 是 redhat 的免费
```

### 4.3 源码包服务管理

```bash
# 源码包服务管理
yum remove nginx
cd /etc/init.d/
ll | grep nginx
cd /usr/local/src
yum install gcc gcc-c++ perl -y
wget https://nchc.dl.sourceforge.net/project/pcre/pcre/8.43/pcre-8.43.tar.gz
wget http://prdownloads.sourceforge.net/libpng/zlib-1.2.11.tar.gz
wget https://www.openssl.org/source/openssl-1.0.2n.tar.gz
wget http://nginx.org/download/nginx-1.10.1.tar.gz
tar -zxvf nginx-1.10.1.tar.gz
tar -zxvf openssl-1.0.2n.tar.gz
tar -zxvf pcre-8.43.tar.gz
tar -zxvf zlib-1.2.11.tar.gz
cd nginx-1.10.1
./configure --prefix=/usr/local/nginx \
--pid-path=/usr/local/nginx/nginx.pid \
--error-log-path=/usr/local/nginx/error.log \
--http-log-path=/usr/local/nginx/access.log \
--with-http_ssl_module \
--with-mail --with-mail_ssl_module \
--with-stream --with-threads \
--user=www --group=www \
--with-pcre=/usr/local/src/pcre-8.43 \
--with-zib=/usr/local/src/zlib-1.2.11 \
--with-openssl=/usr/local/src/openssl-1.0.2n
cd /usr/local/nginx
cd sbin
cd ../conf
vi nginx.conf
# user www
useradd www
cd ../sbin
./nginx -t
./nginx
ps aux | grep nginx
kill -9 pid
cd /etc/init.d
vi nginx
/**
#!/bin/bash
DEMON=/usr/local/nginx/sbin/nginx
dostart(){
  $DEMON
  echo "nginx is running!"
}
case "$1" in
  start)
    dostart
  ;;
  *)
    echo 'Usage: {start}'
  ;;
esac  
 */
chmod 755 ./nginx
./nginx start
vi nginx
/**
# }...
dostop(){
  if [ -f /usr/local/nginx/nginx.pid ]
  then
    kill -INT `cat /usr/local/nginx/nginx.pid` && echo "nginx is stopped!" || "stop failed"
  else
    echo "nginx is not running"
  fi
}
case "$1" in
  # ;;...
  stop)
    dostop
  ;;
  # *)...
 */
./nginx stop
vi nginx
/**
# }...
dorestart(){
  dostop
  dostart
}
case "$1" in
  # ;;...
  restart)
    dorestart
  ;;
  # *)...
 */
/etc/init.d/nginx (stop|start|restart)
vi /etc/rc.local # nginx 自启动配置
# /etc/init.d/nginx start
vi /etc/init.d/nginx
/**
#!/bin/bash
# chkconfig: 35 86 76
# description nginx manager
## 35 启动 3 和 5
## 86 启动顺序
## 76 关闭顺序
 */
chkconfig --add nginx
chkconfig --list | grep nginx # 3 和 5 是启动的
cd /etc/rc3.d && ll
../init.d/mumad # 86
```

## 5、shell: 进程管理_工作管理_系统资源查看_配置 IP 地址_搭建 FTP 服务器_SSH

### 5.1 进程管理

```bash
# 工厂：
## 单进程 单线程 nodejs
## 多进程 fastcgi
## php 多线程的 php apache httpd
ps aux | wc -l
pstree
# 内存 buffers 的作用：加快写入速度
# cached 缓存：提高读取速度
yum install httpd
kill -l
yum install psmisc -y
killall -i httpd
ps aux | grep httpd
service httpd start
vi /etc/httpd/conf/httpd.conf
ServerName localhost:80
pkill httpd
service httpd status
ps aux | grep httpd
uname
uname -a
cat /proc/cpuinfo
w
ps -le | more
service httpd start
ps -le | grep httpd
service httpd stop
nice -n 5 service httpd start
ps -le | grep httpd
renice -10 2461
ps -le | grep httpd
```

### 5.2 工作管理

```bash
# 当个登录终端同时管理多个工作的行为
vi hello.sh
/**
#!/bin/bash
i=0
while [ $i -le 100 ]
  do
    echo `date` >> /root/date.log
    sleep 1s
  done
 */
chmod 755 hello.sh
sh hello.sh 
sh hello.sh &
jobs # 查看后台的工作
tail -f /root/date.log
fg
fg 2
jobs
vi /etc/rc.local
echo hello
ps -ef | grep hello
kill -9 pid
nohup ./hello.sh &
```

### 5.3 系统资源查看

```bash
free -m
uptime
uname -a
yum install -y lsof
lsof /sbin/init
yum install -y at
at 20:20
at 20:13
echo ``
at 20:15
echo `date` > /root/date.log
<EOT>
at now +3 minutes
echo `date` >> /root/d.log
<EOT>
atq
atrm id # 关闭某 at
atq
vi /etc/at.deny # z3
cat /etc/at.deny
useradd z3
su z3
at # 报错
vi /etc/at.allow # z3
useadd l4
at # 报错
crontab -e
crontab -l
vi /etc/crontab # 5  5  *  *  *  echo `date` >> /root/date.log
tail -f /root/date.log
cd /var/spool/anacron # 定时任务
ll
cat cron.daily
cat cron.monthly
cat cron.weekly
cat /etc/anacrontab
whereis run-parts
ll /usr/bin/run-parts
cd /etc/cron.daily && ll
```

### 5.4 配置 IP 地址

```bash
ifconfig eth0 192.168.0.35 netmask 255.255.255.0 # 临时配置 IP
cat /etc/sysconfig/network-scripts/ifcfg-*
cat /etc/sysconfig/network
hostname
hostname local
hostname
cat /etc/resolv.conf
ifdown lo
ifconfig
ifup lo
netstat -tunl
netstat -tunlp
yum install bind-utils
nslookup www.baidu.com
nslookup # 查看 DNS
yum install traceroute -y
traceroute www.baidu.com
```

### 5.5 搭建 FTP 服务器（未测通）_SSH

```bash
rpm -q vsftpd
yum install -y vsftpd
vi /etc/vftpd/vsftpd.conf
/**
anonymous_enable=NO # 是否允许匿名用户登录
local_enable=YES # 运行本地用户登录
write_enable=YES # 是否可以写入
chroot_local_user=YES # 是否将所有用户限制在主目录
chroot_list_enable=YES # 是否启动限制用户的名单
chroot_list_file=/etc/vsftpd/chroot_list # 是否限制在主目录下的用户名单
 */
getsebool -a | grep ftp
setsebool -P tftp_home_dir 1 # 更改设置
service vsftpd restart # 重启vsftpd
vi /etc/selinux/config
SELINUX=disable
service iptables stop
chmod -R 777 /home/zhangsan2
chkconfig vsftpd on
service iptables stop
service vsftpd restart
useradd zhangsan2
passwd zhangsan2 zhangsan2
tcpdump -i ens160 -nnX port 21
ftp 192.168.0.106 # 电脑端
systemctl enable vsftpd.service # 开机自启动

## SSH
ssh root@192.168.110.131
cd ~/.ssh
cat ~/.ssh/konwn_hosts
scp 1.node+vue.xlsx root@192.168.110.131:scp # 本地服务器拷贝到远程服务器
```
