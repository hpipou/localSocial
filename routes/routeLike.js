const express = require("express")
const route = express.Router()
const models = require("../models")
const uuid = require("uuid")
const jwt = require("jsonwebtoken")
const validator = require("validator")
require("dotenv").config()

///////////////////////////////////////////////
// like une publication
///////////////////////////////////////////////
route.post("/:id",(req,res)=>{

    const token = req.headers.authorization.split(" ")[1]
    const tokenDecoded = jwt.decode(token)
    
    // verifier l'id du POST
    const id = req.params.id
    if(!validator.isUUID(id, 4))
        {return res.status(403).json({"error":"ID POST IS NOT VALID"})}

    // verifier si le post exist
    models.Post.findOne({attributes:['id','nbLike'], where:{id:id}})
    .then((data)=>{
            // verifier s'il est déjà liké ou non
            // s'il est liké, alors on supprime le like
            // s'il n'est pas liké, alors on ajour un like
            if(data){
                checkLikeInPost(data.nbLike)
            }else{
                return res.status(403).json({"error":"POST NOT FOUND"})
            }
    })
    .catch((error)=>{return res.status(500).json(error)})

    // vérifier s'il y'a un like
    function checkLikeInPost(dataNbLike){
        models.Like.findOne({attributes:['id'], where:{uuidPost:id,uuidUser:tokenDecoded.id}})
        .then((data)=>{
            if(data){
                // alors l'utilisateur a déjà liké le post 
                // DONC ----> on supprime le like et on fait -1 au post
                deleteMyLike(dataNbLike)
            }else{
                // alors l'utilisateur n'a pas liké le post
                // DONC ----> on ajoute le like et on fait +1 au post
                createMyLike(dataNbLike)
            }
        })
        .catch((error)=>{return res.status(500).json(error)})
    }

    // fonction supprimer le like
    function deleteMyLike(dataNbLike){
        models.Like.destroy({where:{uuidPost:id,uuidUser:tokenDecoded.id}})
        .then(()=>{removeMyLike(dataNbLike)})
        .catch((error)=>{return res.status(500).json(error)})
    }

    // fonction supprimer 1 dans le post
    function removeMyLike(dataNbLike){
        dataNbLike--
        models.Post.update({nbLike:dataNbLike},{where:{id:id}})
        .then(()=>{return res.status(200).json({"success":"DISLIKE COMPLETE"})})
        .catch((error)=>{return res.status(500).json(error)})
    }


    // fonction ajouter le like
    function createMyLike(dataNbLike){
        const uuidLike = uuid.v4()
        models.Like.create({
            id:uuidLike,
            uuidPost:id,
            uuidUser:tokenDecoded.id,
            uuidProfil:tokenDecoded.uuidProfil
        })
        .then(()=>{addMyLike(dataNbLike)})
        .catch((error)=>{return res.status(500).json(error)})
    }

    // fonction ajouter + 1 dans le post
    function addMyLike(dataNbLike){
        dataNbLike++
        models.Post.update({nbLike:dataNbLike},{where:{id:id}})
        .then(()=>{return res.status(200).json({"success":"LIKE COMPLETE"})})
        .catch((error)=>{return res.status(500).json(error)})
    }

    
})

module.exports = route