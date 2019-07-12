const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        //console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //console.log(decoded)
        //in findOne {} 2nd argum is check for a token in tokens array with an id
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        //console.log(user)

        if (!user) {
            throw new Error()
        }

        //to let us have the token currently being used on the device
        req.token = token
        //give route handler access user that we fetched from db up above
        //prevent route handler to fetch them again
        req.user = user
        //if things went well. route handler should run so call next()
        next()
    } catch(e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth