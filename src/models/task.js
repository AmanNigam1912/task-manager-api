const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    //owner is a real field stored in the db
    owner: {
        //data store in an owner is going to be an object Id
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //ref allows us to create a reference from this field to another model
        //the model name should be exact same as it is written in user model
        //const User = mongoose.model('User', userSchema)
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)


// const taskInstance = new Task({
//     description: '   Eat lunch'
// })

// taskInstance.save().then(() => {
//     console.log(taskInstance)
// }).catch((error) => {
//     console.log('Error!', error)
// })

module.exports = Task