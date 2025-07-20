const { validateToken } = require("../services/authentication");
const { getUnreadChatCount } = require("../controllers/chat");

function checkForAuthenticationCookie(cookieName) {
        return async (req , res , next) => {
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

function authenticateToken(req, res, next) {
    const tokenCookieVal = req.cookies['token'];
    if (!tokenCookieVal) {
        return res.redirect('/user/signin');
    }
    try {
        const userPayload = validateToken(tokenCookieVal);
        req.user = userPayload;
        next();
    } catch (error) {
        return res.redirect('/user/signin');
    }
}

// Middleware to add unread chat count - use only on routes that need it
async function addUnreadChatCount(req, res, next) {
    if (req.user && req.user._id) {
        try {
            const unreadChats = await getUnreadChatCount(req.user._id);
            res.locals.unreadChats = unreadChats;
        } catch (error) {
            console.error('Error getting unread chat count:', error);
            res.locals.unreadChats = 0;
        }
    }
    next();
}

module.exports = {
    checkForAuthenticationCookie,
    authenticateToken,
    addUnreadChatCount
}