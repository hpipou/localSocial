const express = require("express")
const app = express()

const bodyParser = require("body-parser")
const cors = require("cors")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

// importation des routes
const routeUser     = require("./routes/routeUser")
const routePost     = require("./routes/routePost")
const routeLike     = require("./routes/routeLike")
const routeProfil   = require("./routes/routeProfil")
const routeComment  = require("./routes/routeComment")

app.use("/user", routeUser)
app.use("/post", routePost)
app.use("/like", routeLike)
app.use("/profil", routeProfil)
app.use("/comment",routeComment)

app.listen(3000, ()=>{console.log("SERVER START AT PORT 3000")})
