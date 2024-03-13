
const nodemailer = require('nodemailer');

require('dotenv').config();
const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    post:process.env.SMTP_PORT,
    secure:false,
    requireTLS:true,
    auth:{
        user:process.env.SMPT_MAIL,
        pass:process.env.SPMT_PASSWORD
    }
});

const sendMail = async(email,subject,content)=>{
   try{
      
    var mailOptions = {
        from:process.env.SMTP_MAIL,
        to:email,
        subject:subject,
        html:content
    };

    transporter.sendMail(mailOptions,(error,info)=>{
        if(error){
            console.log(error);
        }
        console.log('mail send',info.messageId);
    });
   }catch(error){
    console.log(error.message);
   }
}

module.exports = {
    sendMail
}