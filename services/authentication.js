const JWT = require("jsonwebtoken")

const secret = process.env.JWT_SECRET || "$uperMan@123"

function createTokenForUser(user) {
    const payload = {
        _id: user._id , 
        email : user.email ,
        profileImageUrl :user.profileImageUrl , 
        role: user.role , 
        fullName: user.fullName
        
    }
    const token = JWT.sign(payload , secret)
    return token
}
function validateToken(token) {
    const payload = JWT.verify(token , secret)
    return payload
}

module.exports = {
    createTokenForUser , 
    validateToken
}