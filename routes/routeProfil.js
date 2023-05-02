const express = require("express")
const route = express.Router()
const models = require("../models")
const uuid = require("uuid")
const jwt = require("jsonwebtoken")
const validator = require("validator")
require("dotenv").config()

////////////////////////////////////////////////////////////
// créer un profil
////////////////////////////////////////////////////////////
route.post("/new",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)
    
    // vérifier les input
    const fname = req.body.fname
    const lname = req.body.lname
    const age = req.body.age
    const adresse = req.body.adresse
    const country = req.body.country
    const image = req.body.image

    if(validator.isEmpty(fname))
    {return res.status(403).json({"error":"UNDEFINED FIRST NAME"})}

    if(validator.isEmpty(lname))
    {return res.status(403).json({"error":"UNDEFINED LAST NAME"})}

    if(validator.isEmpty(adresse))
    {return res.status(403).json({"error":"UNDEFINED ADRESSE"})}

    if(validator.isEmpty(country))
    {return res.status(403).json({"error":"UNDEFINED COUNTRY"})}

    if(validator.isEmpty(image))
    {return res.status(403).json({"error":"UNDEFINED IMAGE"})}

    if(!validator.isLength(fname,{min:3, max:15}))
    {return res.status(403).json({"error":"FIRST NAME MUST BE MIN:3 MAX:15 CHARS"})}

    if(!validator.isLength(lname,{min:3, max:15}))
    {return res.status(403).json({"error":"LAST NAME MUST BE MIN:3 MAX:15 CHARS"})}

    if(typeof age != 'number')
    {return res.status(403).json({"error":"AGE MUST BE A NUMBER"})}

    if(age>100)
    {return res.status(403).json({"error":"AGE CAN'T BE MORE THAN 100 YEARS"})}

    if(!validator.isLength(adresse,{min:5, max:100}))
    {return res.status(403).json({"error":"ADRESSE MUST BE MIN:5 MAX:100 CHARS"})}

    if(!validator.isLength(country,{min:5, max:15}))
    {return res.status(403).json({"error":"COUNTRY MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(image,{min:5, max:300}))
    {return res.status(403).json({"error":"IMAGE LINK MUST BE MIN:5 MAX:300 CHARS"})}

    // verifier s'il existe déjà un profil
    models.Profil.findOne({attributes:['id','uuidUser'], where:{uuidUser:tokenDecoded.id}})
    .then((data)=>{
        if(data){
            return res.status(403).json({"error":"PROFIL ALREADY EXIST"})
        }else{
            const uuidProfil = uuid.v4()
            //changeUserInfo(uuidProfil)
            createProfil(uuidProfil);
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // créer le profil
    function createProfil(uuidProfil){
        
        models.Profil.create({
            id:uuidProfil,
            fname: fname,
            lname: lname,
            age: age,
            adresse: adresse,
            country: country,
            image: image,
            uuidUser: tokenDecoded.id
        })
        .then(()=>{
            changeUserInfo(uuidProfil)
        })
        .catch((error)=>{return res.status(503).json(error)})
    }

    // modifier isProfil et uuidProfil
    function changeUserInfo(uuidProfil){
        models.User.update({isProfil:true, uuidProfil:uuidProfil}, {where:{id:tokenDecoded.id}})
        .then(()=>{
            const token = jwt.sign({
                            "id":tokenDecoded.id,
                            "username":tokenDecoded.username,
                            "role":tokenDecoded.role,
                            "isProfil":true,
                            "uuidProfil":uuidProfil
                            }, 
                            process.env.SECTOKEN,
                            {expiresIn:'48h'})
            return res.status(201).json({
                                    "success":"PROFIL CREATED",
                                    "token":token,
                                    "id":tokenDecoded.id,
                                    "username":tokenDecoded.username,
                                    "role":tokenDecoded.role,
                                    "isProfil":true,
                                    "uuidProfil":uuidProfil
                                })
        })
        .catch((error)=>{return res.status(502).json(error)})
    }

})


////////////////////////////////////////////////////////////
// modifier un profil
////////////////////////////////////////////////////////////
route.patch("/edit",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)
    
    // vérifier les input
    const fname = req.body.fname
    const lname = req.body.lname
    const age = req.body.age
    const adresse = req.body.adresse
    const country = req.body.country
    const image = req.body.image

    if(validator.isEmpty(fname))
    {return res.status(403).json({"error":"UNDEFINED FIRST NAME"})}

    if(validator.isEmpty(lname))
    {return res.status(403).json({"error":"UNDEFINED LAST NAME"})}

    if(validator.isEmpty(adresse))
    {return res.status(403).json({"error":"UNDEFINED ADRESSE"})}

    if(validator.isEmpty(country))
    {return res.status(403).json({"error":"UNDEFINED COUNTRY"})}

    if(validator.isEmpty(image))
    {return res.status(403).json({"error":"UNDEFINED IMAGE"})}

    if(!validator.isLength(fname,{min:3, max:15}))
    {return res.status(403).json({"error":"FIRST NAME MUST BE MIN:3 MAX:15 CHARS"})}

    if(!validator.isLength(lname,{min:3, max:15}))
    {return res.status(403).json({"error":"LAST NAME MUST BE MIN:3 MAX:15 CHARS"})}

    if(typeof age != 'number')
    {return res.status(403).json({"error":"AGE MUST BE A NUMBER"})}

    if(age>100)
    {return res.status(403).json({"error":"AGE CAN'T BE MORE THAN 100 YEARS"})}

    if(!validator.isLength(adresse,{min:5, max:100}))
    {return res.status(403).json({"error":"ADRESSE MUST BE MIN:5 MAX:100 CHARS"})}

    if(!validator.isLength(country,{min:5, max:15}))
    {return res.status(403).json({"error":"COUNTRY MUST BE MIN:5 MAX:15 CHARS"})}

    if(!validator.isLength(image,{min:5, max:300}))
    {return res.status(403).json({"error":"IMAGE LINK MUST BE MIN:5 MAX:300 CHARS"})}

    // verifier s'il existe déjà un profil
    models.Profil.findOne({attributes:['id','uuidUser'], where:{uuidUser:tokenDecoded.id}})
    .then((data)=>{
        if(data){
            editProfil();
        }else{
            return res.status(403).json({"error":"PROFIL NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // créer le profil
    function editProfil(){
        
        models.Profil.update({
            fname: fname,
            lname: lname,
            age: age,
            adresse: adresse,
            country: country,
            image: image,
        },{where:{uuidUser:tokenDecoded.id}})
        .then(()=>{return res.status(200).json({"success":"PROFIL EDITED"})})
        .catch((error)=>{return res.status(503).json(error)})
    }

})


////////////////////////////////////////////////////////////
// afficher un profil
////////////////////////////////////////////////////////////

route.get("/view/:id",(req,res)=>{

    // verifier l'id du profil
    const idProfil = req.params.id
    if(!validator.isUUID(idProfil, 4))
        {return res.status(403).json({"error":"ID PROFIL IS NOT VALID"})}

    models.Profil.findOne({
        attributes:['fname','lname','age','adresse','country','image','uuidUser'],
        where:{id:idProfil},
        include : [{model:models.User, attributes:['username','role']}]
    })
    .then((data)=>{return res.status(200).json(data)})
    .catch((error)=>{return res.status(500).json(error)})
    
})

////////////////////////////////////////////////////////////
// afficher tous les profils
////////////////////////////////////////////////////////////
route.get("/view",(req,res)=>{

    models.Profil.findAll({
        attributes:['fname','lname','age','adresse','country','image','uuidUser'],
        include : [{model:models.User, attributes:['username','role']}]
    })
    .then((data)=>{return res.status(200).json(data)})
    .catch((error)=>{return res.status(500).json(error)})
    
})

module.exports = route