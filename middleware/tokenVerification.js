const jwt = require("jsonwebtoken")
const validator = require("validator")
require("dotenv").config()

const tokenVerif = (req,res,next)=>{

    if(req.headers.authorization==null || req.headers.authorization==undefined)
    {return res.status(403).json({"error":"TOKEN UNDEFINED"})}

    const token = req.headers.authorization.split(" ")[1]
    if(validator.isEmpty(token))
    {return res.status(403).json({"error":"TOKEN UNDEFINED"})}

    try{
        const resultat = jwt.verify(token, process.env.SECTOKEN)
        if(resultat){
            next()
        }else{
            return res.status(403).json({"error":"INVALID TOKENE"})
        }

    }catch{
        return res.status(403).json({"error":"INVALID TOKENEE"})
    }
}

module.exports = tokenVerif