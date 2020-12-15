//code necessary to set db
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
//setting up test data for our test cases to interact with
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@example.com',
    password: '56what!!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
//setting up test data for our test cases to interact with
const userTwo = {
    _id: userTwoId,
    name: 'Rahul',
    email: 'rahul@example.com',
    password: 'myhouse099@@',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    //owner: userOneId or the next line. Both are identical
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    //owner: userOneId or the next line. Both are identical
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third task',
    completed: true,
    //owner: userOneId or the next line. Both are identical
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new task(taskOne).save()
    await new task(taskTwo).save()
    await new task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}