const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
        return (req , res , next) => {
            const tokenCookieVal = req.cookies[cookieName]
            if(!tokenCookieVal) {
                return next()
            }
            try {
                const userPayLoad = validateToken(tokenCookieVal)
                req.user = userPayLoad
            } catch (error) {
                
            }
            return next()
        }
}
module.exports = {
    checkForAuthenticationCookie
}