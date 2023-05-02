const express = require("express")
const route = express.Router()
const models = require("../models")
const uuid = require("uuid")
const jwt = require("jsonwebtoken")
const validator = require("validator")

/////////////////////////////////////////////////////
// ajouter un commentaire
/////////////////////////////////////////////////////
route.post("/new",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

     // input à vérifier : message / uuidPost
     const message = req.body.message
     const uuidPost = req.body.uuidPost

     if(validator.isEmpty(message))
     {return res.status(403).json({"error":"UNDEFINED MESSAGE"})}
 
     if(!validator.isLength(message,{min:5, max:300}))
     {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:300 CHARS"})}

     if(!validator.isUUID(uuidPost, 4))
     {return res.status(403).json({"error":"INVALID ID POST"})}

     // verifier si le post existe
     models.Post.findOne({attributes:['id', 'nbComment'], where:{id:uuidPost}})
     .then((data)=>{
        if(data){
            addComment(data.nbComment);
        }else{
            return res.status(403).json({"error":"POST NOT FOUND"})
        }
     })
     .catch((error)=>{return res.status(500).json(error)})

     // si oui, alors on ajoute le commentaire
     function addComment(nbComment){
        const myUUID = uuid.v4()
        models.Comment.create({
            id:myUUID,
            message:message,
            uuidPost:uuidPost,
            uuidUser:tokenDecoded.id,
            uuidProfil:tokenDecoded.uuidProfil
        })
        .then(()=>{
            
            const myJSON = {
                "success":"COMMENT ADDED",
                "id":myUUID,
                "message":message,
                "uuidPost":uuidPost,
                "uuidUser":tokenDecoded.id,
                "uuidProfil":tokenDecoded.uuidProfil
            }
            editNbComment(nbComment, myJSON);
            
        })
        .catch((error)=>{return res.status(500).json(error)})
     }

     // editer le nombre de like dans post
     function editNbComment(nbComment, myJSON){
        nbComment++
        models.Post.update({nbComment:nbComment},{where:{id:uuidPost}})
        .then(()=>{return res.status(201).json(myJSON)})
        .catch((error)=>{return res.status(500).json(error)})
     }

})

/////////////////////////////////////////////////////
// modifier un commentaire
/////////////////////////////////////////////////////
route.patch("/edit",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

     // input à vérifier : message / uuidComment
     const message = req.body.message
     const uuidComment = req.body.uuidComment

     if(validator.isEmpty(message))
     {return res.status(403).json({"error":"UNDEFINED MESSAGE"})}
 
     if(!validator.isLength(message,{min:5, max:300}))
     {return res.status(403).json({"error":"PASSWORD MUST BE MIN:5 MAX:300 CHARS"})}

     if(!validator.isUUID(uuidComment, 4))
     {return res.status(403).json({"error":"INVALID ID POST"})}

     // verifier si le commentaire existe et si c'est le propriétaire du commentaire
     models.Comment.findOne({attributes:['id','uuidPost','uuidUser'], where:{id:uuidComment}})
     .then((data)=>{
        if(data){
            if(data.uuidUser==tokenDecoded.id){
                editComment(data.uuidPost);
            }else{
                return res.status(403).json({"error":"THIS COMMENT IS NOT YOURS"})
            }
        }else{
            return res.status(403).json({"error":"COMMENT NOT FOUND"})
        }
     })
     .catch((error)=>{return res.status(500).json(error)})

     // si oui, alors on ajoute le commentaire
     function editComment(uuidPost){
        models.Comment.update({message:message},{where:{id:uuidComment}})
        .then(()=>{return res.status(201).json({
            "success":"COMMENT EDITED",
            "id":uuidComment,
            "message":message,
            "uuidPost":uuidPost,
            "uuidUser":tokenDecoded.id,
            "uuidProfil":tokenDecoded.uuidProfil
        })})
        .catch((error)=>{return res.status(500).json(error)})
     }

    
})

/////////////////////////////////////////////////////////////
// afficher un commentaire
/////////////////////////////////////////////////////////////
route.get("/:id",(req,res)=>{

    // input à vérifier : id
    const uuidComment = req.params.id

    if(!validator.isUUID(uuidComment, 4))
    {return res.status(403).json({"error":"INVALID ID COMMENT"})}

    models.Comment.findOne({
        attributes:['id','message','uuidPost'],
        where:{id:uuidComment},
        include:[
            {model:models.User, attributes:['id','username']},
            {model:models.Profil,attributes:['id','fname','lname','country']}
        ]
    })
    .then((data)=>{return res.status(200).json(data)})
    .catch((error)=>{return res.status(500).json(error)})
    
})

/////////////////////////////////////////////////////////////
// afficher tous les commentaires d'une publication
/////////////////////////////////////////////////////////////
route.get("/post/:id",(req,res)=>{

    const uuidPost = req.params.id

    if(!validator.isUUID(uuidPost, 4))
    {return res.status(403).json({"error":"INVALID ID COMMENT"})}

    models.Comment.findAll({
        attributes:['id','message','uuidPost'],
        where:{uuidPost:uuidPost},
        include:[
            {model:models.User, attributes:['id','username']},
            {model:models.Profil,attributes:['id','fname','lname','country']}
        ]
    })
    .then((data)=>{return res.status(200).json(data)})
    .catch((error)=>{return res.status(500).json(error)})
})

/////////////////////////////////////////////////
// supprimer un commentaire
/////////////////////////////////////////////////
route.delete("/:id",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)

    // input à vérifier : id
    const uuidComment = req.params.id

    if(!validator.isUUID(uuidComment, 4))
    {return res.status(403).json({"error":"INVALID ID COMMENT"})}

    // verifier s'il est le propriétaire du commentaire
    models.Comment.findOne({attributes:['uuidUser', 'uuidPost'], where:{id:uuidComment}})
    .then((data)=>{
        if(data){
            if(data.uuidUser==tokenDecoded.id){
                deleteComment(data.uuidPost);
            }else{
                return res.status(403).json({"error":"THIS COMMENT IS NOT YOURS"})
            }
        }else{
            return res.status(403).json({"error":"COMMENT NOT FOUND"})
        }
    })
    .catch((error)=>{return res.status(500).json(error)})
    
    // fonction supprimer le commentaire
    function deleteComment(uuidPost){
        models.Comment.destroy({where:{id:uuidComment}})
        .then(()=>{numberComment(uuidPost)})
        .catch((error)=>{return res.status(500).json(error)})
    }

    
    // afficher le nombre de commentaire
    function numberComment(uuidPost){
        models.Post.findOne({attributes:['nbComment'], where:{id:uuidPost}})
        .then((data)=>{editNumberComment(data.nbComment, uuidPost)})
        .catch((error)=>{return res.status(500).json(error)})
    }

    
    // modifier EditPostComment
    function editNumberComment(nbComment, uuidPost){
        nbComment--
        models.Post.update({nbComment:nbComment},{where:{id:uuidPost}})
        .then(()=>{return res.status(200).json({"error":"COMMENT DELETED"})})
        .catch((error)=>{return res.status(500).json(error)})
    }
    
})


module.exports = route