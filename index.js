const express = require('express')
const app = express()
app.use(require('body-parser').urlencoded({limit:'20mb' ,extended:true}))
app.use(express.json({limit:'20mb'}))

const dotenv = require('dotenv')
dotenv.config()

app.listen(process.env.PORT || 3000)

app.use(require('cors')())
app.use(express.static('htmls'))

const fs = require('fs')
const swaggerDoc = require("./swaggerDoc");
swaggerDoc(app);
const { docify} = require("./helper");
docify()


const logger = require("./logger")
app.use((req,_,next)=>{
	logger.log({level: 'info',api:req.originalUrl,ip:req.ip});
	next()
})


app.get('/',async (req,res)=>{ 
    res.send('ok')
})
app.post('/',(req,res)=>{
    res.send('okk')
})


const events = require('events')
const eventemitter = new events.EventEmitter()
eventemitter.on('thisevent',(data)=>{})

app.use('/central',require('./controllers/central.js'))
app.use('/admin',require('./controllers/admin.js'))


app.use(async (data,req,res,next)=>{
	if(res.statusCode==500){
		return res.send(data.message ?? data.msg)
	}
	else{
		return res.send(data)
	}
})