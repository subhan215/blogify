const express = require("express")
const app = express()
require("dotenv").config()
const PORT = process.env.PORT || 8000 ; 
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog")
const cookieParser = require("cookie-parser")
const { connectMongoDb } = require("./connection/connection");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");
connectMongoDb(process.env.MONGOD_CONNECT_URI)
app.set('view engine'  ,'ejs')
app.set('views' , path.resolve("./views"))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public")))
app.get("/" , async (req , res) => {
    const allBlogs = await Blog.find({})
    return res.render("home" , {
        user: req.user , 
        blogs: allBlogs
    })
})
app.use("/user" , userRoute)
app.use("/blog" , blogRoute)
app.listen(PORT , () => {
    console.log("server connected!")
})
