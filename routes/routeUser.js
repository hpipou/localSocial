const express = require("express")
const route = express.Router()
const models = require("../models")
const bcrypt = require("bcrypt")
const uuid = require("uuid")
const jwt = require("jsonwebtoken")
const validator = require("validator")
require("dotenv").config()

// créer un compte
route.post("/register",(req,res)=>{

    // input à vérifier : username / email / password
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    if(validator.isEmpty(username))
    {return res.status(403).json({"error":"UNDEFINED USERNAME"})}

    if(validator.isEmpty(email))
    {return res.status(403).json({"error":"UNDEFINED EMAIL"})}

    if(!validator.isEmail(email))
    {return res.status(403).json({"error":"INVALID EMAIL"})}

    if(validator.isEmpty(password))
    {return res.status(403).json({"error":"UNDEFINED PASSWORD"})}

    if(!validator.isLength(password,{min:5, max:15}))
    {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(username,{min:5, max:15}))
    {return res.status(403).json({"error":"USERNAME MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(email,{min:5, max:40}))
    {return res.status(403).json({"error":"EMAIL MUST BE MIN:5 MAX:40 CHARS"})}

    // verifier si l'adresse email existe déjà
    models.User.findOne({attributes:['username','email','password'], where:{email:email}})
    .then((data)=>{
        if(data){
            return res.status(403).json({"error":"EMAIL ALREADY EXIST"})
        }else{
            usernameCheck();
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // vérifier si l'username existe déjà
    function usernameCheck(){
        models.User.findOne({attributes:['username','email','password'], where:{username:username}})
        .then((data)=>{
            if(data){
                return res.status(403).json({"error":"USERNAME ALREADY EXIST"})
            }else{
                createAccount();
            }
        })
        .catch((error)=>{return res.status(500).json(error)})
    }

    // créer un compte
    function createAccount(){
        const myUUID = uuid.v4()
        models.User.create({                                    
                            id:myUUID,
                            username:username,
                            email:email,
                            password:bcrypt.hashSync(password,5),
                            role:"user",
                            isProfil:false,
                            uuidProfil:myUUID
        })
        .then(()=>{
            
            const token = jwt.sign({
                                    id:myUUID,
                                    username:username,
                                    role:"user",
                                    isProfil:false,
                                    uuidProfil:myUUID
                                    }, 
                                    process.env.SECTOKEN,
                                    {expiresIn:'48h'})
            return res.status(201).json({
                                            "success":"REGISTER COMPLETE",
                                            "id":myUUID,
                                            "token":token, 
                                            "role":"user",
                                            "isProfil":false,
                                            "uuidProfil":myUUID
                                        })
        })
        .catch((error)=>{return res.status(500).json(error)})
    }
})

// se connecter
route.post("/login",(req,res)=>{

    // input à vérifier : email / password
    const email = req.body.email
    const password = req.body.password

    if(validator.isEmpty(email))
    {return res.status(403).json({"error":"UNDEFINED EMAIL"})}

    if(!validator.isEmail(email))
    {return res.status(403).json({"error":"INVALID EMAIL"})}

    if(validator.isEmpty(password))
    {return res.status(403).json({"error":"UNDEFINED PASSWORD"})}

    if(!validator.isLength(password,{min:5, max:15}))
    {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(email,{min:5, max:40}))
    {return res.status(403).json({"error":"EMAIL MUST BE MIN:5 MAX:15 CHARS"})}

    // verifier si l'adresse email existe déjà
    models.User.findOne({attributes:['id','username','email','password','role','isProfil','uuidProfil'], where:{email:email}})
    .then((data)=>{
        if(data){
            // comparer les mots de passe
            const resultat = bcrypt.compareSync(password,data.password)
            if(resultat){
                const token = jwt.sign({
                                    id:data.id,
                                    username:data.username,
                                    role:data.role,
                                    isProfil:data.isProfil,
                                    uuidProfil:data.uuidProfil
                                    }, 
                                    process.env.SECTOKEN,
                                    {expiresIn:'48h'})
                return res.status(201).json({
                                            "success":"LOGIN COMPLETE",
                                            "token":token,
                                            "id":data.id,
                                            "username":data.username,
                                            "role":data.role,
                                            "isProfil":data.isProfil,
                                            "uuidProfil":data.uuidProfil
                                        })
            }else{
                return res.status(403).json({"error":"INVALID PASSWORD"})
            }
            
        }else{
            return res.status(403).json({"error":"EMAIL NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

})

// changer le mot de passe
route.patch("/password",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : password / newpassword
    const password = req.body.password
    const newpassword = req.body.newpassword

    if(validator.isEmpty(password))
    {return res.status(403).json({"error":"UNDEFINED PASSWORD"})}

    if(validator.isEmpty(newpassword))
    {return res.status(403).json({"error":"UNDEFINED NEW PASSWORD"})}

    if(!validator.isLength(password,{min:5, max:15}))
    {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(newpassword,{min:5, max:15}))
    {return res.status(403).json({"error":"NEW PASSWORD MUST BE MIN:5 MAX:15 CHARS"})}

    // verifier si l'adresse email existe déjà
    models.User.findOne({attributes:['id','password'], where:{id:tokenDecoded.id}})
    .then((data)=>{
        if(data){
            // comparer les mots de passe
            const resultat = bcrypt.compareSync(password,data.password)
            if(resultat){
                // si le mot de passe est correct alors on lance la fonction
                changePassword();
                
            }else{
                return res.status(403).json({"error":"INVALID PASSWORD"})
            }
            
        }else{
            return res.status(403).json({"error":"USER NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // fonction changer le mot de passe
    function changePassword(){
        
        models.User.update({password:bcrypt.hashSync(newpassword,5)},{where:{id:tokenDecoded.id}})
        .then(()=>{return res.status(201).json({"success":"PASSWORD CHANGED"})})
        .catch((error)=>{return res.status(500).json(error)})
    }

})

// changer l'email
route.patch("/email",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : email / new email / password
    const email = req.body.email
    const newemail = req.body.newemail
    const password = req.body.password

    if(validator.isEmpty(email))
    {return res.status(403).json({"error":"UNDEFINED EMAIL"})}

    if(!validator.isEmail(email))
    {return res.status(403).json({"error":"INVALID EMAIL"})}

    if(!validator.isLength(email,{min:5, max:40}))
    {return res.status(403).json({"error":"EMAIL MUST BE MIN:5 MAX:40 CHARS"})}

    if(validator.isEmpty(newemail))
    {return res.status(403).json({"error":"UNDEFINED NEW EMAIL"})}

    if(!validator.isEmail(newemail))
    {return res.status(403).json({"error":"INVALID NEW EMAIL"})}

    if(!validator.isLength(newemail,{min:5, max:40}))
    {return res.status(403).json({"error":"NEW EMAIL MUST BE MIN:5 MAX:40 CHARS"})}

    if(validator.isEmpty(password))
    {return res.status(403).json({"error":"UNDEFINED PASSWORD"})}

    if(!validator.isLength(password,{min:5, max:15}))
    {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:15 CHARS"})}

    // verifier si l'adresse email existe déjà
    models.User.findOne({attributes:['id','email','password'], where:{id:tokenDecoded.id}})
    .then((data)=>{
        if(data){
            // comparer les mots de passe
            const resultat = bcrypt.compareSync(password,data.password)
            if(resultat){
                checkNewEmail();
            }else{
                return res.status(403).json({"error":"INVALID PASSWORD"})
            }
            
        }else{
            return res.status(403).json({"error":"EMAIL NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // vérifier si la nouvelle adresse email existe déjà
    function checkNewEmail(){
        models.User.findOne({attributes:['id','email','password'], where:{email:newemail}})
        .then((data)=>{
            if(data){
                return res.status(403).json({"error":"NEW EMAIL ALREADY EXIST"})
            }else{
                changeEmail();
            }
        })
        .catch((error)=>{return res.status(500).json(error)})
    }

    // fonction changer l'email
    function changeEmail(){
        
        models.User.update({email:newemail},{where:{id:tokenDecoded.id}})
        .then(()=>{return res.status(201).json({"success":"EMAIL CHANGED"})})
        .catch((error)=>{return res.status(500).json(error)})
    }

})

// changer l'username'
route.patch("/username",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : username / newusername / password
    const username = req.body.username
    const newusername = req.body.newusername
    const password = req.body.password

    if(validator.isEmpty(username))
    {return res.status(403).json({"error":"UNDEFINED USERNAME"})}

    if(validator.isEmpty(newusername))
    {return res.status(403).json({"error":"INVALID NEW USERNAME"})}

    if(validator.isEmpty(password))
    {return res.status(403).json({"error":"INVALID PASSWORD"})}

    if(!validator.isLength(username,{min:5, max:15}))
    {return res.status(403).json({"error":"NEW EMAIL MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(newusername,{min:5, max:15}))
    {return res.status(403).json({"error":"NEW EMAIL MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(password,{min:5, max:15}))
    {return res.status(403).json({"error":"NEW EMAIL MUST BE MIN:5 MAX:15 CHARS"})}

    // verifier si l'adresse email existe déjà
    models.User.findOne({attributes:['id','email','password'], where:{id:tokenDecoded.id}})
    .then((data)=>{
        if(data){
            // comparer les mots de passe
            const resultat = bcrypt.compareSync(password,data.password)
            if(resultat){
                checkNewUsername();
            }else{
                return res.status(403).json({"error":"INVALID PASSWORD"})
            }
            
        }else{
            return res.status(403).json({"error":"USER NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // vérifier si la nouvelle adresse email existe déjà
    function checkNewUsername(){
        models.User.findOne({attributes:['id','email','password'], where:{username:newusername}})
        .then((data)=>{
            if(data){
                return res.status(403).json({"error":"NEW USERNAME ALREADY EXIST"})
            }else{
                changeUsername();
            }
        })
        .catch((error)=>{return res.status(500).json(error)})
    }

    // fonction changer l'email
    function changeUsername(){
        
        models.User.update({username:newusername},{where:{id:tokenDecoded.id}})
        .then(()=>{return res.status(201).json({"success":"USERNAME CHANGED"})})
        .catch((error)=>{return res.status(500).json(error)})
    }

})

// supprimer le compte
route.delete("",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : password
    const password = req.body.password

    if(validator.isEmpty(password))
    {return res.status(403).json({"error":"INVALID PASSWORD"})}

    if(!validator.isLength(password,{min:5, max:15}))
    {return res.status(403).json({"error":"NEW EMAIL MUST BE MIN:5 MAX:15 CHARS"})}

    // verifier si l'adresse email existe déjà
    models.User.findOne({attributes:['id','email','password'], where:{id:tokenDecoded.id}})
    .then((data)=>{
        if(data){
            // comparer les mots de passe
            const resultat = bcrypt.compareSync(password,data.password)
            if(resultat){
                deleteUser();
            }else{
                return res.status(403).json({"error":"INVALID PASSWORD"})
            }
            
        }else{
            return res.status(403).json({"error":"USER NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // supprimer le compte
    function deleteUser(){
        models.User.destroy({where:{id:tokenDecoded.id}})
        .then(()=>{
            
                return res.status(200).json({"success":"USER DELETE"})
            
        })
        .catch((error)=>{return res.status(500).json(error)})
    }

})


module.exports = route