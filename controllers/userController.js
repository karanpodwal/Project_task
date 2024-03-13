const User = require('../models/userModels');
const bcrypt = require('bcrypt');

const {validationResult} =require('express-validator');

const mailer = require('../helpers/mailer');

const randomstring = require('randomstring');
const passwordReset = require("../models/passwordReset");

const jwt = require('jsonwebtoken')

const userRegister = async(req,res)=>{
  
    try{
        
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success:false,
                msg:'errors',
                errors:errors.array()
            });
        }

        const {name,email,mobile,password} = req.body;

        const isExists = await User.findOne({email});

        if(isExists){
            return res.status(200).json({
                success:true,
                msg:'Email alreday exists',
            });
        }

        const hashPassword = await bcrypt.hash(password,10);

        const user = new User({
            name,
            email,
            mobile,
            password:hashPassword,
            image:'images/'+req.file.filename
        })

        const userData = await user.save();

        const msg = '<p> Hii, '+name+',please <a href="http://127.0.0.1:3000/mail-verification?id='+userData._id+'">Verify</a> your mail.</p>'
        mailer.sendMail(email,'mail verification', msg);

        return res.status(200).json({
            success:true,
            msg:'Registered successfully',
            user: userData
        })

    }catch(error){
        return res.status(400).json({
            success:false,
            msg:error.message
        })
    }
}

const mailverification = async(req,res)=>{
    try{

        if(req.query.id == undefined){
            return res.render('404');
        }
        const userData = User.findOne({_id:req.query.id});

        if(userData){
            if(userData.is_verified == 1){
                return res.render('mail-verification',{message:'your Mail has been alreday verified '});
            }
            await User.findByIdAndUpdate({_id:req.query.id},{
                $set:{
                    is_verified: 1
                }
            });
            return res.render('mail-verification',{message:'Mail has been verified Successfully'})

        }else{
            return res.render('mail-verification',{message:'user not found'});
        }
    }catch(error){
       console.log(error.message);
       return res.render('404');
    }
}


const sendMailVerification = async(req,res)=>{
    try{
         
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success:false,
                msg:'errors',
                errors:errors.array()
            });
        }
        const {email} = req.body;

        const userData = await User.findOne({email});

        if(!userData){
            return res.status(400).json({
                success:false,
                msg:"Email dosen't exists!"
            });
        }
        if(userData.is_verified == 1){
            return res.status(400).json({
                success:false,
                msg:userData.email+"mail is already verified!"
            });
        }
        const msg = '<p> Hii, '+userData.name+',please <a href="http://127.0.0.1:3000/mail-verification?id='+userData._id+'">Verify</a> your mail.</p>'
        mailer.sendMail(email,'mail verification', msg);

        return res.status(200).json({
            success:true,
            msg:'verification link sent to your mail , please check'
        })
    }catch(error){
    console.log(error.message);
       return res.render('404');
    }
}

const forgotPassword = async(req,res)=>{
   try{

    const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success:false,
                msg:'errors',
                errors:errors.array()
            });
        }
        const {email} = req.body;

        const userData = await User.findOne({email});

        if(!userData){
            return res.status(400).json({
                success:false,
                msg:"Email dosen't exists!"
            });
        }

        const randomString = randomstring.generate();
        const msg = '<p>Hii '+userData.name+',Please click <a href="http://127.0.0.1:3000/reset-password?token='+randomString+'">here</a> to Reset your Password.. </p>'
        await passwordReset.deleteMany({user_id:userData,_id});
        const passwordReset = passwordReset({
            user_id:userData._id,
            token:random
        });
        await passwordReset.save();

        mailer.sendMail(userData.email,'Reset Password',msg);
        return res.status(201).json({
            success:true,
            msg:'Reset Password Link send to your mail , pleasec check'
        })
        

   }catch(error){
    return res.status(400).json({
        success:false,
        msg:error.message
    })
   }
}

const resetpassword = async(req,res)=>{
   try{
         if(req.query.token == undefined){
            return res.render('404');
         }
        const resetData = await passwordReset.findOne({token:req.query.token});

        if(!resetData){
            return res.render('404');
        }
      
        return res.render('reset-password',{resetData});
        
       
         
   }catch(error){
    return res.status(400).json({
        success:false,
        msg:error.message
    })
   }
}

const updatepassword =async(req,res)=>{

    try{

        const {user_id,password,c_password} = req.body;
         const resetData = await passwordReset.findOne({user_id});
        if(password != c_password){
           return res.render('reset-password',{resetdata, error:'confirm password not matching'})
        }

         const hashepassword = await bcrypt.hash(c_password,10);

         await User.findByIdAndUpdate({
            _id:user_id},{
                $set:{
                    password:hashepassword
                }
            })

            passwordReset.deleteMany({uer_id});

            return res.redirect('/reset-success');
    }catch(error){
        return res.render('404');
    }
}

const resetSuccess = async(req,res)=>{
    try{
        return res.render('reset-success');
    }catch(error){
        return res.render('404');
    }
}

const generateAccessToken = async(user)=>{
   const token =  jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'2h'});
   return token;
}

const loginUser = async(req,res)=>{
  try{
        const errors =  validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success:Errors,
                msg:error.errors.array()
            })
        }
        const {email,password} = req.body;

       const userData =  await User.findOne({email});

       if(!userData){
        return res.status(401).json({
            success:false,
            msg:'Email and password is incorrect!'
        });
       }
       const passwordMatch = await bcrypt.compare(password,userData.password);

       if(!passwordMatch){
        return res.status(401).json({
            success:false,
            msg:'Email and password is incorrect!'
        });
       }

       if(userData.is_verified == 0){
        return res.status(401).json({
            success:false,
            msg:'please verify your account!'
        });
       }

     const accessToken = await generateAccessToken({user:userData});

     return res.status(200).json({
        success:true,
        msg:'Login successfully',
        user: userData,
        accessToken: accessToken,
        tokenType:'Bearer'
    });


  }catch(error){
    return res.status(400).json({
        success:false,
        msg:error.message
    })
  }
}

const userProfile = async(req,res)=>{

    try{
        return res.status(400).json({
            data:userData
        });

    }catch(error){
       return res.status(400).json({
        success:false,
        msg:error.message
       })
    }
}


module.exports = {
    userRegister,
    mailverification,
    sendMailVerification,
    forgotPassword,
    resetpassword,
    updatepassword,
    resetSuccess,
    loginUser,
    userProfile
}