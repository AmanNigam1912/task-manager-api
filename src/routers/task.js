const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//app.post('/tasks', (req,res) => {
    // router.post('/tasks', async (req,res) => {    
    router.post('/tasks', auth, async (req,res) => {        
        //const task = new Task(req.body)

        const task = new Task({
            //we need all the stuff from req.body with an addition of owner property
            //ES6 spread operator lets us expand our object/array/strings 
            //this will copy all of the property from body to this object
            //description of the task as well as completed value if it's provided
            ...req.body,
            owner: req.user._id
        })
    
        // task.save().then(() => {
        //     res.status(201).send(task)
        // }).catch((e) => {
        //     res.status(400).send(e)
        // })
    
        try {
            await task.save()
            res.status(201).send(task)
        } catch(e) {
            res.status(400).send(e)
        }
    })
    
    //app.get('/tasks', (req, res) => {
    //router.get('/tasks', async (req, res) => {
    //filtering will be applied on this route as we are sending an array of data in this
    //can send as many documents as they were created hence do filter here
    //use query string for this
    // GET /tasks?completed=true
    //limit and skip will help us implement pagination
    //skip allows to iterate over pages. ex limit=10&skip=0 I am getting 1st 10 results
    //limit=10&skip=10 skipping the first 10 results and showing the next 10
    //GET /tasks?limit=10&skip=10
    //GET /tasks?sortBy=createdAt:asc or desc
    router.get('/tasks', auth, async (req, res) => {
        const match = {}
        const sort = {}
        //req.query.completed will contain the value of completed
        if (req.query.completed) {
            //req.query.completed is a string
            //so if req.query.completed is true we will set match.completed = true as it takes only boolean value
            match.completed = req.query.completed === 'true'
        } 

        if (req.query.sortBy) {
            //split returns an array of split elements
            //to access the elements in the array we use bracket notation
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        // Task.find({}).then((tasks) => {
        //     res.send(tasks)
        // }).catch((e) => {
        //     res.status(500).send()
        // })
    
        try {
            //const tasks = await Task.find({})
            //const tasks = await Task.find({ owner: req.user_id })
            //await req.user.populate('tasks').execPopulate()
            await req.user.populate({
                path: 'tasks',
                match,
                //options used for pagination and sorting
                options: {
                    //parse a string that contains a number into an actual integer which is what mongoose expect
                    //if limit not provided it will be ignored
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                    // : {
                    //     //sort by ascending is code 1 and descending is -1
                    //     //createdAt: 1
                    //     completed: 1
                    // }
                }
            }).execPopulate()
            res.send(req.user.tasks)
        } catch(e) {
            res.status(500).send() 
        }
    })
    
    //app.get('/tasks/:id', (req, res) => {
    router.get('/tasks/:id', auth, async (req, res) => {
        const _id = req.params.id
    
        // Task.findById(_id).then((task) => {
        //     if(!task){
        //         return res.status(404).send()
        //     }
    
        //     res.send(task)
        // }).catch((e) => {
        //     res.status(500).send()
        // })
        try{
            //const task = await Task.findById(_id)
            //we need to rake into account the owner field
            //findOne allows us to limit by multiple fields
            //details of the task I have logged in and the task I have created 
            //so if i am not the owner or id doesn't match, i will get 404
            const task = await Task.findOne({ _id, owner: req.user._id })
    
            if(!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch(e) {
            res.status(500).send(e)
        }
    })
    
    //router.patch('/tasks/:id', async (req, res) => {
    router.patch('/tasks/:id', auth, async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['description', 'completed']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if(!isValidOperation){
            return res.status(400).send({ error: 'Inavlid updates!'})
        }
    
        try {
            //owner should come from the id of the authenticated user
            const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
            //const task = await Task.findById(req.params.id)
            
            //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    
            if(!task) {
                return res.status(404).send(task)
            }
            updates.forEach((update) => task[update] = req.body[update])
            await task.save()

            res.send(task)
        } catch (e) {
            res.status(400).send(e)
        }
    })
    
    //router.delete('/tasks/:id', async(req, res) => {
    router.delete('/tasks/:id', auth, async(req, res) => {    
        try{
            //const task = await Task.findByIdAndDelete(req.params.id)
            //owner should come from the id of the authenticated user
            const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        
            if(!task) {
                return res.status(404).send()
            }
    
            res.send(task)
        } catch (e) {
            res.status(500).send()
        }
    })

module.exports = router