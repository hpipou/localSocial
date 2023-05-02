const express = require("express")
const app = express()

const bodyParser = require("body-parser")
const cors = require("cors")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

// token verification
const tokenVerif = require("./middleware/tokenVerification")

// importation des routes
const routeUser     = require("./routes/routeUser")
const routePost     = require("./routes/routePost")
const routeLike     = require("./routes/routeLike")
const routeProfil   = require("./routes/routeProfil")
const routeComment  = require("./routes/routeComment")

app.use("/user", routeUser)
app.use("/post",tokenVerif, routePost)
app.use("/like",tokenVerif, routeLike)
app.use("/profil",tokenVerif, routeProfil)
app.use("/comment",tokenVerif, routeComment)

app.listen(3000, ()=>{console.log("SERVER START AT PORT 3000")})
