
const jwt = require("jsonwebtoken");

const verifyToken = async(req,res,next)=>{
  
    const token = req.body.token || req.query.token || req.headers["authorization"];

    if(!token){
        return res.status(403).json({
            success:false,
            msg:'A token is required for autheniation'
        });
    }

    try{

        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        const decodeddata = jwt.verify(bearerToken,config.ACCESS_SECRET);
        req.user = decodeddata;

    }catch(error){
        return res.status(403).json({
            success:false,
            msg:"Invalid token"
        })
    }
    return next();
}

module.exports = verifyToken