const mongoose = require('mongoose')

//to connect the local db
//provide a different value when running in production
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    //mongoose works with mongodb our index are created, allowing us to quickly access the data we need to access
    useCreateIndex: true,
    //to not display the deprecated warning for findIdAndUpdate use the next line
    useFindAndModify: false
})