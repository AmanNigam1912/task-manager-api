const express = require('express')
//.. is used to get out of current directory
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, cancellationEmail } = require('../emails/account')


//route handler
//app.post('/users', (req, res) => {
    router.post('/users', async (req, res) => {    
        //here we can use the json parsed object received from above
        const user = new User(req.body)
    
        // user.save().then(() => {
        //     res.status(201).send(user)
        // }).catch((e) => {
        //     //following line should be before res.send
        //     res.status(400).send(e)
        //     //res.send(e)
        // })
    
        try{
            await user.save()
            //we can await this but not necessary as user will get the mail soon
            //no need to wait for this line to run and then see the status code
            sendWelcomeEmail(user.email, user.name)
            const token = await user.generateAuthToken()
            res.status(201).send({ user, token })
        } catch (e) {
            res.status(400).send(e)
        }
        
    })

    router.post('/users/login', async (req, res) => {
        try {
            //call a new method we will setup or create on our own
            //findByCredentials is created in User models
            const user = await User.findByCredentials(req.body.email, req.body.password)
            //generateAuthToken will generate the token for the user and give us the token and we will send that back to the user
            const token = await user.generateAuthToken()
            //to get the output in two different property like user{age:..,name:.., etc} and token{"agvshaksj..."}
            //res.send({ user: user.getPublicProfile(), token })
            //res.send is getting stringified i.e. object is converted to JSON
            res.send({ user, token })
        } catch (e) {
            res.status(400).send()
        }
    })

    router.post('/users/logout', auth, async (req, res) => {
        try {
            //to remove a particular token from the tokens array
            //since we have authenticated we already have access to user data
            //req. user is the user
            req.user.tokens = req.user.tokens.filter((token) => {
                //token is an object with a token property. so token.token
                // check that when it's not equal to one that was used
                //if not equal return true, keeping them in the tokens array
                //if equal return false, filter it out and removing it
                return token.token !== req.token
            })

            await req.user.save()

            //things went well
            res.send()
        } catch (e) {
            res.status(500).send()
        }
    })

    router.post('/users/logoutAll', auth, async (req, res) => {
        try {
            req.user.tokens = []
            await req.user.save()
            res.send()
        } catch (e) {
            res.status(500).send()
        }
    })
    
    //app.get('/users', (req,res) => {
    router.get('/users/me', auth , async (req,res) => {    
        //find() when kept blank will fetch all the users from the db
        //can access them from the promise
        // User.find({}).then((users) => {
        //     res.send(users)
        // }).catch((e) => {
        //     //500:internal server error i.e db connection lost
        //     res.status(500).send()    
        // })    

        // try{
        //     const users = await User.find({})
        //     res.send(users)
        // } catch (e) {
        //     res.status(500).send(e)
        // }  
        res.send(req.user)
    })
    
    //after /users/ will dynamic as it will fetch the id which is unique
    //after : can be anything and this will trigger the route handler (provided by express) will capture dynamic values
    //app.get('/users/:id', (req,res) => {
    // router.get('/users/:id', async (req,res) => {    
    //     //params provide all the route parameters
    //     //here it is an object with single value id
    //     const _id = req.params.id
        
    //     //mongoose converts the objects to string as id is an object
    //     // User.findById(_id).then((user) => {
    //     //     //even if find no match for the id entered in url
    //     //     //it is considered a success for MongoDB
    //     //     if (!user){
    //     //         return res.status(404).send()
    //     //     }
    
    //     //     res.send(user)
    //     // }).catch((e) => {
    //     //     res.status(500).send()
    //     // })
    
    //     try{
    //         const user = await User.findById(_id)
            
    //         if(!user){
    //             return res.status(404).send()
    //         }
    
    //         res.send(user)
    //     } catch (e) {
    //         res.status(500).send(e)
    //     }
    // })
    
    //to update a resource use patch
    //router.patch('/users/:id', async (req, res) => {
        //authentication will be used to know which user we are going to update since we are no longer accepting an id as a url parameter
    router.patch('/users/me', auth, async (req, res) => {
        //what are we trying to update with this operation
        //keys will return an arrays of strings, each is a property on that object
        //object to an array of properties
        const updates = Object.keys(req.body)
        //all the field that could be updated
        const allowedUpdates = ['name', 'email', 'password', 'age']
        //every will run for every item in the array
        //if there are 10 true's every will return true
        //if there are 9 tryes and 1 false every will return false
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
            //findByIdAndUpdate bypasses mongoose. It performs direct operation on the db. that is why we set the special operation runValidators true
            //this is done to allow middleware to consistently run
            //const user = await User.findById(req.params.id)

            //since updates is an array of strings. here update will be either name, email, password
            updates.forEach((update) => {
                //bracket notation to access the property dynamically because we dont know which roperty is the user trying to update
                req.user[update] = req.body[update]
            })
            
            await req.user.save()

            //2nd argument: update is done to the body and not a static value for a field
            //3rd argument (1): new:true will give a new user with updates applied
            //3rd argument (2): runValidators do run validations for the update like name update to something non existent should not run
            //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    
            // if (!user) {
            //     return res.status(404).send()
            // }
    
            res.send(req.user)
        } catch(e) {
            res.status(400).send(e)
        }
    })
    
    //router.delete('/users/:id', async (req, res) => {
    router.delete('/users/me', auth, async (req, res) => {
        try{
            //const user = await User.findByIdAndDelete(req.params.id)
            // const user = await User.findByIdAndDelete(req.user._id)
    
            // if(!user){
            //     return res.status(404).send()
            // }

            await req.user.remove()
            cancellationEmail(req.user.email, req.user.name)
            res.send(req.user)
        } catch (e) {
            res.status(500).send()
        }
    })

    const upload = multer ({
        //dest stands for destination folder name
        //dest:'avatars',
        limits: {
            fileSize: 1000000
        },
        fileFilter(req, file, cb) {
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Please upload a jpg, jpeg, png file only!'))
            }

            cb(undefined, true)

        }
    })

    router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
        //const for buffer of modified image file
        //toBuffer converts back to a buufer we can access
        //.png() converts the image to png format
        //.resize() to resize the image
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

        //can only be accessed after removing the dest property above
        //req.user.avatar = req.file.buffer
        req.user.avatar = buffer
        await req.user.save()
        res.send()
    }, (error, req, res, next) => {
        res.status(400).send({ error: error.message })
    })

    router.delete('/users/me/avatar' , auth, async (req, res) => {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    })

    //get the avatar for the user by their id
    router.get('/users/:id/avatar', async (req, res) => {
        try {
            const user = await User.findById(req.params.id)

            if (!user || !user.avatar) {
                throw new Error()
            }

            //the header
            //reformatting the image before saving it so we can use /png
            res.set('Content-Type', 'image/png')
            res.send(user.avatar)
        } catch (e) {
            res.status(404).send()
        }
    })

module.exports = router