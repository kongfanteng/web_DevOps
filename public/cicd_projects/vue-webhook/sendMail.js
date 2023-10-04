const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
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
    console.log(`Message sent: ${info.messageId}`)
  })
}
module.exports = sendMail;
