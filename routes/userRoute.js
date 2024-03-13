

const express = require('express');
const router = express();


router.use(express.json());

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null,path.join(__dirname,'../public/images'));
        }
    },
    filename: function(req,file,cb){
        const name = Date.now() + '-' + file.originalname;
        cb(null,name);
    }
});

const fileFilter = (req,file,cb)=>{

    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
}
const upload = multer({
    storage:storage,
    fileFilter:fileFilter
});

const auth = require("../middleware/auth")
const userController = require('../controllers/userController')
const {resisterValidator,sendMailVerificationValidator,passwordResetValidator,loginValidator} = require("../helpers/validation")

router.post('/register',upload.single('image'),resisterValidator,userController.userRegister);

router.post('/send-mail-verification',sendMailVerificationValidator,userController.sendMailVerification);

router.post('/forgot-password',passwordResetValidator,userController.forgotPassword);
router.post('/reset-password',userController.resetpassword);
router.post('/reset-password',userController.updatepassword);
router.get('/reset-success',userController.resetSuccess);
router.post('/login',loginValidator,userController.loginUser);
//auttion use 
router.get('/userProfile',auth,userController.userProfile);


module.exports = router;