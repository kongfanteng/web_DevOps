# bash

## 1、用户和用户组

### 1.1 用户和用户组

- 使用操作系统的人都是用户
- 用户组是具有相同系统权限的一组用户

### 1.2 配置文件

```bash
cat /etc/group # root:x:0
cat /etc/gshadow # root::: 存放当前系统中用户组的密码信息
cat /etc/passwd # 存储当前系统中所有用户的信息 
# root:x:0:0:root:/root:/bin/bash
# x 密码占位符
# /root 用户主目录
# /bin/bash: shell 类型
```

### 1.3 用户命令

```bash
whoami # root
id root
groups root # 所在组
finger root # 用户详细资料
```

### 1.4 用户和用户组操作

```bash
groupadd stu # 添加用户组
cat /etc/group

groupmod -n student stu # 修改用户组名称
cat /etc/group

groupmod -g 666 student # 修改用户组编号
cat /etc/group

groupadd -g 888 teacher # 创建分组并指定编号
```

### 1.5 新增用户

```bash
useradd test1
cat /etc/passwd | grep test1
cat /etc/group | grep test1
groupadd zf
useradd -g zf z3
useradd -g zf l4
cat /etc/group | grep zf
cat /etc/passwd | grep z3
cat /etc/passwd | grep l4
id z3
id l4
cat /etc/passwd | grep z3
usermod -c boss z3
cat /etc/passwd | grep z3
usermod -l zhang3 z3
cat /etc/passwd | grep zhang3
mkdir /home/zhang3
usermod -d /home/zhang3 zhang3
cat /etc/passwd | grep zhang3
usermod -g jiagoustudent zhang3
cat /etc/passwd | grep zhang3
userdel zhang3 # 删除用户 zhang3
cat /etc/passwd | grep zhang3
passwd l4
cat /etc/shadow | grep l4
useradd user100
cat /etc/group | grep user100
cat /etc/passwd | grep user100
```

## 2、用户和用户组_文件权限_sudo 权限

### 2.1 用户管理

```bash
useradd user100
cat /etc/group | grep user100
cat /etc/passwd | grep user100
su user100
ls
cd ~
ls
touch 1.txt
ll
gpasswd -a user100 zf
cat /etc/group | grep zf
useradd user2000
gpasswd -a user2000 zf
cat /etc/group | grep zf
id user2000
```

### 2.2 文件权限

```bash
# 例：chmod -R 777 1.txt
su user100
cd ~
ll
touch 1.txt & touch 2.txt
chmod u+x 1.txt
ll
chmod g+x,o+x 1.txt
ll
chmod 764 1.txt
# 对文件最高权限是 `x`

su user100
mkdir folder
su root
ln -s 1.txt 11.txt
ll
chown root:root 1.txt # 修改文件所属用户
ll
groupadd zf1
chgrp zf1 folder # 修改所属组
ll
```

### 2.3 默认权限

```bash
# 文件 644，目录 755
umask # 掩码
umask 0033 # 临时修改
umask
umask 0044
touch 3.txt
ll
vi /etc/profile # 永久修改 umask
```

### 2.4 ACL 访问控制，分配权限

```bash
dumpe2fs -h /dev/sda1 # 查看分区权限
mount -o remount,acl /dev/sda1 # 临时开启 ACL 权限

# 永久开启 ACL
# vi /etc/fstab
useradd guest1
mkdir /home/guest1/folder
useradd teacher1
groupadd student1
chown teacher1:student1 /home/guest1/folder
cd /home/guest1
ll
# root
setfacl -m u:guest1:rw /home/guest1/folder # 设定 ACL
getfacl /home/guest1/folder # 获取 ACL
setfacl -m u:guest1:rx /home/guest1/folder & getfacl /home/guest1/folder
setfacl -x u:guest1 /home/guest1/folder & getfacl /home/guest1/folder
setfacl -m m:rx /home/guest1/folder & getfacl /home/guest1/folder # 设置 mask（最大权限）
su guest1
touch 3.txt
cd folder/ # 权限不够
su root
setfacl -b /home/guest1/folder # 删掉权限
setfacl -m u:guest1:rw folder & ll
cd folder & ll # 设置目录的权限，子文件不分配权限
setfacl -R -m u:guest1:rw folder & cd folder & ll # -R 递归赋予权限 
setfacl -m d:u:guest1:rwx folder # 设置默认权限
setfacl -k folder # 删除默认选项
```

### 2.5 sudo 权限

```bash
visudo # vi /etc/sudoers
guest1 ALL=(ALL) ALL
locate shutdown # /sbin/shutdown
guest1 localhost=(root) /sbin/shutdown

```

## 3、shell

### 3.1 shell 基础

```bash
cat /etc/shells # 查看支持的 shell
echo hello
echo -e "\e[1;31m warning \e[0m"
echo -e "\e[1;33m warning \e[0m"
vi hello.sh

#!/bin/bash
echo hello

chmod 744 hello.sh
./hello.sh
cat hello.sh
sh hello.sh
bash hello.sh

```

### 3.2 别名

```bash
ls -ahl
ls
ls -hl
ls
alias
alias ls='ls -hl --color=auto'
```

### 3.3 历史调用

```bash
history
history -c 清空历史
ls -al # .bash_history
cat /etc/profile
HISTORYSIZE=10000
echo hello
!!
echo hello
echo hello
!!
!echo
!ech
```

### 3.4 echo

```bash
echo hello > hello.txt
cat hello.txt # hello
echo world > hello.txt
cat hello.txt # world
echo hello > hello.txt
echo world >> hello.txt
cat xx.txt > error.log 1>&1
cat xx.txt &> error.log
cat error.log
cat xx.txt &>> error.log
cat error.log
echo right && cat xx > normal.log 2> error.log
cat normal.log
cat error.log
vi line.txt

1
2
3

cat line.txt
cat line.txt | wc
cat line.txt | wc -l
wc < line.txt
wc -l < line.txt
```

### 3.5 管道符号_变量

```bash
date;ls;date;ls
cat line.txt
cat line.txt | grep 2 # 搜索文件中值为 2
name=zdf
age=10
echo $name # zf
echo age # age
echo $age # 10
home='$name'
echo $name # zf
echo $home # $name
home="$name"
echo $home # zf
files=$(ls)
echo $files # 文件列表
dir=`ls`
echo $dir # 文件列表
```

## 4、shell

### 4.1 变量

```bash
age=10
a=5
b=5
c=$a+$b
echo $c # 5+5

name=zf
age=10
echo $name # zf
echo $age # 10
char=a
echo $char # a
char=$char$char
echo $char # aa

char=${char}2
echo $char # aa2
char="$char"3
echo $char # aa23
```

### 4.2 变量

```bash
echo $a
echo $xx
xx=
echo $xx
echo $yy
set -u
echo $yy
echo $a # 5
unset a
echo $a # -bash
```

### 4.3 环境变量

```bash
PATH=$PATH:/root/echo
echo $PATH
hello.sh
myname=zf
set | grep myname
export myage=10
set | grep myage
yum -y install psmisc
pstree
```

### 4.4 环境变量

```bash
echo $HOSTNAME
echo $SHELL
echo $TERM
echo $HISTSIZE
echo $SSH_CLIENT
echo $SSH_TTY
echo $USER
echo $PS1
PS1="[\u@ \W]\$"
echo $PS1
LANG=zh_CN.UTF-8 # 中文支持
df -h
```

### 4.5 位置参数变量

```bash
sum=$((4+6))
echo $sum # 10
sum1=$(4+6) # 报错
vi sum.sh

#!/bin/bash
sum=$((4+6))
echo $sum

chmod 755 sum.sh
./sum.sh
vi sum.sh

#!/bin/bash
num1=$1
num2=$2
sum=$((num1+num2))
echo $sum

./sum.sh 1 2 # 3
vi sum.sh

echo =$*===========
for i in "$*"
do
  echo $i + "X"
done
echo =$@===========
for i in "$@"
do
  echo $i + "X"
done
/* 
=1 2===========
1 2 + X
=1 2===========
1 + X
2 + X
*/
```

## 5、shell

### 5.1 预定义变量

```bash
echo xx ## xx
echo $? # 0
cat xx # 报错
echo $? # 1
echo $$ # 进程号
echo $! ## 上一个后台运行的进程号
vi calc.sh
/*
#! /bin/bash
for i in 1 2 3
do
echo $i
done
*/
sh calc.sh & # 进程号
i
echo $! # 进程号可以用以管理 nginx 任务，脚本中通过 pid 启动 nginx

```

### 5.2 read

```bash
vi sum.sh
/*
#!/bin/bash
read -p '请输入第一个数' num1
read -p '请输入第二个数' num2
sum=$((num1+num2))
echo $sum
*/
./sum.sh
vi register.sh
/*
#!/bin/bash
read -p '请输入用户名' -t 10 name
read -p '请输入性别[m/f]' -n 1 gender
echo -e "\n"
read -p '请输入密码' -s password
echo -e "\n"
echo $name $gender $password
*/
chmod 755 register.sh
./register.sh
a=1
b=2
c=$(($a+$b)) & echo $c
c=$[$a+$b] & echo $c
c=$(expr $a + $b) & echo $c
vi sum.sh
/*  #!/bin/bash
num1=$1
num2=$2
result=$(($num1+$num2))
echo $result  */
./sum.sh 2 2
vi show.sh
/*  #!/bin/bash
echo $*
echo $@-----
echo $#  */
chmod 755 show.sh
./show.sh 1 2 3
```

### 5.3 运算符

```bash
name=xx
a=2
b=3
c=$a+$b
echo $c # 2+3
declare -i c # 设定类型属性
c=$a+$b
echo $c # 5
declare +i c # 取消类型属性
c=$a+$b
echo $c # 2+3
age=10
bash
set | grep age
exit
declare -x age2=10 # 设置环境变量
bash
set | grep age2
export age3=11 # 设置环境变量
bash
set | grep age
declare -r radius=1 # 只读
radius=2 # 报错
declare -p age3 # 显示被声明的类型
declare -x age3="10" # 声明环境变量
names[0]=a
names[1]=b
echo ${names} # a
echo ${names[1]} # b
echo ${names[*]} # a b
```

### 5.4 环境变量配置文件

```bash
cat /etc/profile
ll /etc/profile.d/*.sh
. /etc/profile.d/lang.sh
source /etc/profile.d/lang.sh
cat ~/.bash_profile
cat ~/.bashrc
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv-i'
vi hello.txt
cat hello.txt | grep hello
alias grep='grep --color=auto'
cat hello.txt | grep hello
cat hello.txt | grep e
cat /etc/bashrc # 配置 PS1
cat /etc/issue.net
vi /etc/ssh/sshd_config
Banner /etc/issue.net
service sshd restart
cat /etc/motd
vi /etc/motd
#!/bin/bash
echo $0
vi hello.sh
sh hello.sh 1 2 3
```

### 5.5 正则表达式

```bash
ls
ls sum.sh
ll sum*
ll sum.??
ll sum.?[abch]
vi hello.txt
/** a
aa
aaa
aaaa
aaaaa

1
aop
abcp
d
asdfasd
fasdfads  
Hello.
Wrold.
 */
alias grep='grep --color=auto'
grep "a*" hello.txt
grep ".*" hello.txt
grep "\." hello.txt
grep "^a" hello.txt
grep "a[obc]\{1,3\}p" hello.txt
grep "a[obc]\{1,\}p" hello.txt
grep "a[obc]\{1\}p" hello.txt
grep "a[^obc]\{1,\}p" hello.txt
grep "a[^xyz]\{1,]p}" hello.txt
grep "" hello.txt
```
