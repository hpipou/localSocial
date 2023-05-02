const express = require("express")
const route = express.Router()
const models = require("../models")
const uuid = require("uuid")
const jwt = require("jsonwebtoken")
const validator = require("validator")
require("dotenv").config()

// créer une publication
route.post("/new",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : message
    const message = req.body.message

    if(validator.isEmpty(message))
    {return res.status(403).json({"error":"UNDEFINED MESSAGE"})}

    if(!validator.isLength(message,{min:5, max:300}))
    {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:300 CHARS"})}

    // générer un uuid v4
    const postUUID = uuid.v4()

    // créer le post
    models.Post.create({
        id:postUUID,
        message:message,
        uuidUser:tokenDecoded.id,
        uuidProfil:tokenDecoded.uuidProfil,
        nbLike:0,
        nbComment:0
    })
    .then(()=>{return res.status(201).json({
        "success":"POST CREATED",
        "id":postUUID,
        "uuidUser":tokenDecoded.id,
        "uuidProfil":tokenDecoded.uuidProfil,
        "nbLike":0,
        "nbComment":0
    })})
    .catch((error)=>{return res.status(500).json(error)})

})

// modifier une publication
route.patch("/edit",(req,res)=>{
    
    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : message et l'id
    const message = req.body.message
    const uuidPUB = req.body.id

    if(!validator.isUUID(uuidPUB, 4))
    {return res.status(403).json({"error":"INVALID ID POST"})}

    if(validator.isEmpty(message))
    {return res.status(403).json({"error":"UNDEFINED MESSAGE"})}

    if(!validator.isLength(message,{min:5, max:300}))
    {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:300 CHARS"})}
    
    
    // verifier s'il est le propriétaire du post
    models.Post.findOne({ attributes:['uuidUser'], where:{id:uuidPUB}})
    .then((data)=>{

        if(data){
            if(data.uuidUser==tokenDecoded.id){
                editPost();
            }else{
                return res.status(403).json({"error":"YOU HAVE NOT PERMISSION TO EDIT THIS POST"})
            }

        }else{
            return res.status(403).json({"error":"POST NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // modifier le post
    function editPost(){
        models.Post.update({message:message},{where:{id:uuidPUB}})
        .then(()=>{return res.status(200).json({"success":"POST EDITED"})})
        .catch((error)=>{return res.status(500).json(error)})
    }

})

// afficher une publication
route.get("/view/:id",(req,res)=>{

    // input à vérifier : id
    const uuidPUB = req.params.id

    if(!validator.isUUID(uuidPUB, 4))
    {return res.status(403).json({"error":"INVALID ID POST"})}

    models.Post.findOne({
        attributes:['id','message','nbLike','nbComment'],
        where:{id:uuidPUB},
        include:[
            {model:models.User, attributes:['id','username']},
            {model:models.Profil,attributes:['id','fname','lname','country']}
        ]
    })
    .then((data)=>{return res.status(200).json(data)})
    .catch((error)=>{return res.status(500).json(error)})

})

// afficher toutes les publications
route.get("/view",(req,res)=>{
    models.Post.findAll({
        attributes:['id','message','nbLike','nbComment'],
        include:[
            {model:models.User, attributes:['id','username']},
            {model:models.Profil,attributes:['id','fname','lname','country']}
        ]
    })
    .then((data)=>{return res.status(200).json(data)})
    .catch((error)=>{return res.status(500).json(error)})
})

// afficher toutes les publication d'un profil
route.get("/profil/:id",(req,res)=>{

    // input à vérifier : id
    const uuidProfil = req.params.id

    if(!validator.isUUID(uuidProfil, 4))
    {return res.status(403).json({"error":"INVALID ID PROFIL"})}

    models.Post.findAll({
        attributes:['id','message','nbLike','nbComment'],
        where:{uuidProfil:uuidProfil},
        include:[
            {model:models.User, attributes:['id','username']},
            {model:models.Profil,attributes:['id','fname','lname','country']}
        ]
    })
    .then((data)=>{return res.status(200).json(data)})
    .catch((error)=>{return res.status(500).json(error)})
})

// supprimer une publication
route.delete("/:id",(req,res)=>{
    
    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : id
    const uuidPost = req.params.id

    if(!validator.isUUID(uuidPost, 4))
    {return res.status(403).json({"error":"INVALID ID POST"})}
    
    // verifier s'il est le propriétaire du post
    models.Post.findOne({ attributes:['uuidUser'], where:{id:uuidPost}})
    .then((data)=>{

        if(data){
            if(data.uuidUser==tokenDecoded.id){
                deletePoste();
            }else{
                return res.status(403).json({"error":"YOU HAVE NOT PERMISSION TO DELETE THIS POST"})
            }
        }else{
            return res.status(403).json({"error":"POST NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // supprimer le post
    function deletePoste(){
        models.Post.destroy({where:{id:uuidPost}})
        .then(()=>{return res.status(200).json({"success":"POST DELETED"})})
        .catch((error)=>{return res.status(500).json(error)})
    }

})

// supprimer toutes les publications d'un profil
route.delete("",(req,res)=>{
    
    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    models.Post.destroy({where:{uuidUser:tokenDecoded.id}})
    .then(()=>{return res.status(200).json({"success":"ALL POST DELETED"})})
    .catch((error)=>{return res.status(500).json(error)})
    
})

module.exports = route