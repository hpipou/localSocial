const express = require("express")
const app = express()

const bodyParser = require("body-parser")
const cors = require("cors")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

// Helmet pour sécuriser automatiquement divers en-têtes HTTP
const helmet = require("helmet");
app.use(helmet());

// limite le nombre de requêtes provenant d'une adresse IP 
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
app.use(limiter)

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
