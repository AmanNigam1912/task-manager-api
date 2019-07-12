const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
//process.env is where environment variables are stored
//access Port environment variable which is provided by heroku when heroku runs our node appl
//const port = process.env.PORT || 3000
const port = process.env.PORT

// //multer is used to uploasd files
// const multer = require('multer')
// //to get an instance of multer
// const upload = multer({
//     dest: 'images',
//     limits: {
//         //max file size we want to allow in bytes
//         fileSize: 1000000
//     },
//     //to mention the type of file we want to upload
//     //3 arguments req made, file being uploaded and callback to tell multer what to do when we are done filtering the file   
//     fileFilter(req, file , cb) {
//         //only accept pdf's 1 MB in size
//         //if(!file.originalname.endsWith('.pdf')) {
//             //match allows us to provide a regular expression in between of //
//         if(!file.originalname.match(/\.(doc|docx)$/))   { 
//             return cb(new Error('Please upload a word document'))
//         }

//         cb(undefined, true)
//         // //to send an error back
//         // cb(new Error('File must be a PDF'))
//         // // to accept it
//         // cb(undefined, true)
//         // //silently send an error back
//         // cb(undefined, false)


//     }
// })

// const errorMiddleware = (req, res, next) => {
//     throw new Error ('From my middleware')
// }

//upload.single will return the middleware we are going to use
//2nd argument tells multer to look for a file with a name 'upload' when the request comes from /upload url
// app.post('/upload', upload.single('upload'), (req, res) => {
// //app.post('/upload', errorMiddleware , (req, res) => {
//     res.send()
// }, 
// //express will know the following function is designed to handle errors by seeing the 4 arguments
// (error, req, res, next) => {
//     //the client gets useful message in json rather than default html page
//     res.status(400).send({ error: error.message })
// })

//register a new express middleware to run
//req and res same as route handler
// next is additional
// app.use((req, res, next) => {
//     //to allow next thing in chain to run
//     //if do something ie this function is never calling next the route handler would never run
//     //next()
//     if(req.method == 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site under maintenance!')
// })

//will automatically parse incoming json to an object
//so we can access in our request handlers
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// //create a new router
// const router = new express.Router()
// //set up the routes
// router.get('/test', (req, res) => {
//     res.send('This is from my other router')
// })
// //register it with express application
// app.use(router)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

//const bcrypt = require('bcryptjs')

// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     // //Plain text password is what user provides us as in next line
//     // const password = 'Red12345!'
//     // //hashedPassword is what we will end up storing in db
//     // //2nd argument no. of round we want to perform i.e. how many times the hashing algo is executed
//     // //8 is not to less neither too many
//     // const hashedPassword = await bcrypt.hash(password, 8)

//     // // console.log(password)
//     // // console.log(hashedPassword)

//     // //1st argument is plain text pass and 2nd argument is hashed password
//     // //return a boolean value true is both arguments match else false
//     // const isMatch = await bcrypt.compare('red12345!', hashedPassword)
//     // // console.log(isMatch)

//     //return value from sign is our new authentication token
//     //token is provided to client and later on they can perform task operations
//     //the 1st argum in sign is an object that should be unique identifier which id
//     //2nd argum is a string that is a secret to sign a  token making sure it is not tampered or altered
//     //3rd argum to expire the token after a certain amount of time
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' })
//     console.log(token)

//     //will return payload if things go well otherwise throw an error
//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data)
// }

// myFunction()

// const pet = {
//     name: 'Hal'
// }

// pet.toJSON = function () {
//     // console.log(this)
//     // return this
//     //to allow none of the data getting exposed as no properties are attached
//     return {}
// }

// //convert an object to a JSON
// console.log(JSON.stringify(pet))


// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     //the next 3 code lines finds out which user created this task
//     // const task = await Task.findById('5d2382133343a51b2054d3ac')
//     // //populate allows us to populate data from a relationship such as the data we have here for owner
//     // //so owner being just an id to being an entire profile
//     // //the following line : find the user associated with this task and task.owner will be their profile as just supposed to being the id 
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     //finding out the user and their tasks
//     const user = await User.findById('5d237dfdf951b90948910e77')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()