const jwt = require('jsonwebtoken');
const logger = require('./logger');
const fs = require('fs')

const moment = require('moment');


const yaml = require('js-yaml')
var doc = {}
module.exports = {
    /**
     * 
     * @returns date time in YYmmddhhiiss format
     */
    async datetime(){try{
        let date =  new Date;
        let datetime = ''+date.getFullYear()+(date.getMonth()+1)+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds()
        return datetime
        }catch(err){logger.log('err','datetime'+err.message)}
    },

    /**
     * 
     * @returns retuers random string with date time
     */
    async datetimesalt(){try{
        let date =  new Date;
        let datetime = ''+date.getFullYear()+(date.getMonth()+1)+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds()
        datetime = datetime + await this.otp(1000000)
        if(''){reject('')}
        else{return (datetime)}
        }catch(err){
            logger.log('error','datetimesalt ' +err.message)
            console.log(err)
        }
    },

    /**
     * 
     * @param {*} req req
     * @param {*} res res
     * @returns 0 for error, 1 for success and req.person consists decoded data
     */

    verifytoken(req,res){try{
        let token = req.headers.authorization 
        try{
            var decoded = jwt.verify(token,process.env.JWT_KEY)
        }
        catch(e){
            return 0
        }
        req.person = decoded.data
        return 1
        }catch(err){
            logger.log('error','verifytoken ' +err.message)
            console.log(err)
        }
    },




    /**
     * 
     * @param {*} err error object to be logged in error.log and console.log
     * @param {*} name name of method
     * @returns error object to be sent to client
     */
    async logerr(err,name){
        logger.log('error',name + ' ' +err)
        console.log('logging error')
        console.log(err)
        return await module.exports.ss(err,'Oops some error occured',-1)
    },

     /**
     * 
     * @param {*} data data to be sent array, object or string
     * @param {*} msg msg of the response
     * @param {*} status 0 for success , -1 for error , 1 for unsucess
     * @returns object to be sent to client
     */

      ss(data,msg = "",status = 0){try{

        let sss = {status:0,msg:'success',data:null}

        
        if(data==null){
            sss = {status: status || 1 ,msg: msg || 'No data' ,data:data}
        }

        else if(typeof(data)=='number'){
            sss = {status: status || 0 , msg: msg || 'success' ,data:data}
        }
        else if(typeof(data)=='object'){
            if(Array .isArray(data)){
                sss = data.length ? {status: status || 0 , msg: msg || 'success' ,size:data.length, data:data} : {status:status || 1 , msg: msg || 'No data' ,data:data}
            }
            else{
                sss = Object.entries(data).length ? {status: status || 0 , msg: msg || 'success' ,data:data} : {status:status || 1 , msg: msg || 'No data' ,data:data}
            }
        }
        if(status==-1){
            sss = {status:-1,msg:'Oops some Error occured',data:data}
        }
        return sss
        }catch(err){
            logger.log('error','ss ' +err.message)
            console.log(err)
        }
    },



        
    docify(){
        // do the regex work on all controllers
        let files = fs.readdirSync('./controllers')
        let set = ''
        files = files.filter(ele=>ele!='developer.js')
        files.map(ele=>{
            let file = fs.readFileSync('./controllers/'+ele,'utf-8')
            let p = file.split(`/**`)
            p.shift()
            p.map((e,i)=>{
                let s = e.split('*/')
                let para = s[0]
                if(para.includes('@swagger')){
                    para = para.split('@swagger').join('')
                    para = para.split(' *').join('')
                    set +=para +'\n'
                }
            })
            
        })

        // yaml parser of virtual files
        doc = yaml.load(set)
        // object to be used to verify
        let ent = Object.keys(doc)
        ent.map(ele=>{
            let data = doc[ele]
            let params = data?.post?.parameters ?? []
            if(!params.length)
                params = data?.get?.parameters ?? []
            params.map(e=>{
                let c = e.in
                switch (c) {
                    case 'formData':c='body';break;
                    case 'header':c='headers';break;
                    case 'path':c='params';break;
                }
                e.in = c
            })
        })

    },
        

    validate (req,res){
        let str1 = ''
        let str2 = ''
        let def = doc[req.url]
        if(!def){
            return 0
        }
        req.def = def
        let data = def[req.method.toLowerCase()]
        if(!data){
            return 0
        }
        let params = data?.parameters
        params.map(e=>{
            let val = req[e.in][e.name]
            if(e.required==true && !val)
                str1+=e.name+','
            if(e.type && e.type.length && val &&  !e.type.includes(typeof(val)))
                str2+=e.name +' must be of type '+e.type + ' '
        })
        if(str1 || str2){
            str1 ? str1 = str1 +' is missing' : ''
            return {status:1,msg:str1+str2,data:null}
        }
        return 0
    }


}