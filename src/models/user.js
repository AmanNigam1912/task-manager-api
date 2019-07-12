//while using mongoose we do get a base level of validation 
//and can customize them
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//this will allow us to take advantage of middleware hence we create schema first
//middleware are used to customize the behaviour of mongoose model
//to enable timestamp customize the schema created
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        //create an index in mongodb db to guarantee uniqueness
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        //mongoose doesn't provide a lot of validations
        //but we can customize based on our needs
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('The password cannot contain the string "password!"')
            }
        }
    },
    tokens: [{ 
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        //allow Buffer to store the image with binary image data in db
        //alongside the user who the image belongs
        type: Buffer
    },
},
{
    //default is false
    timestamps: true
})

//set up a virtual property to have all the tasks owned by a user
//virtual property: not actual data stored in db, it's a relationship between two entities. here user and tasks
//virtual because we are not actually changing what we stored in user document
//virtual is just a way for mongoose to figure out how these two are related
//1st argument name for our virtual field
userSchema.virtual('tasks', {
    //not stored in db just for mongoose to figure out who own's what and how they are related
    ref: 'Task',
    //localfield is where the local data is stored
    //owner field is in task and that is associated with the _id field of user
    localField: '_id',
    //foreign field is the name of the field on the other thing i.e Task that will create this relationship
    foreignField: 'owner'
})

//methods are accessible on the instances or called instance methods
userSchema.methods.generateAuthToken = async function () {
    const user = this
    //user._id is an object id so we need to convert to string so we use toString()
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    //concat a new item to the db which is an object with token property defined in the array above
    user.tokens = user.tokens.concat({ token }) 
    await user.save()

    return token
}

//userSchema.methods.getPublicProfile = function () {
userSchema.methods.toJSON = function () {    
    const user = this
    //get back raw object with user data attached
    //this will remove all the operation mongoose have on that like save operation
    //we will have an object with just the user data
    //toObject provided by mongoose
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    //remove avatar data
    delete userObject.avatar

    return userObject
}
 
//we are setting up directly on the model
//statics method are accessible on the model or called model methods 
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Developer comment
//Hash the plain text password before saving
//function here is standard and not arrow as this binding plays an imp role and arrow func dont bind this
//next is called when we are done
userSchema.pre('save', async function (next) {
    //this give access to the individual user that is about to be saved
    const user = this

    //isModified will be true if user is created and if the user is updated
    if (user.isModified('password')) {
        //overwrite the plain text password value with the new one
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Developer comment
//Delete user tasks when user id removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

//'' is the name of model and 2nd argument is fields we want
const User = mongoose.model('User', userSchema)

//create instances of model to add documents to db
// const me = new User({
//     name: '     Aman',
//     email: 'MYEMAIL@AMAN.IO    ',
//     password: '  Aman123@   ' 
// })

// //save to db
// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })

module.exports = User