const api = require('express').Router()
const jwt = require('jsonwebtoken')
const multer  = require('multer')
const moment = require('moment')
const file = multer({dest:'uploads'})

const {logerr,otp,notify,datetimesalt,ss,fcm} = require('../helper')
const {insert,fetch,fetch_row,update,reupdate,reinsert} = require('../model')
const logger = require('../logger')
module.exports = api


api.post('/',(req,res)=>{
    res.send('ok')
})
api.get('/',(req,res)=>{
    res.send('okk')
})


/**
 * @swagger
 * /central/login:
 *    post :
 *        tags :
 *           - central
 *        description: 'login'
 *        parameters :
 *         - name: contact
 *           description : email/phone
 *           in : formData
 *           required: true
 *         - name: password
 *           description:
 *           in : formData
 *           required : true
 *        responses :
 *           '200':
 *             description: OK
 *           '403':
 *             description: Unauthorized access
 *           '500':
 *             description: Internal server error
 */
api.post("/login",async(req,res)=>{
    let data = await login(req,res)
    res.send(data);
})


async function login(req,res){try{
    let where = {}
    let doc = {}
    let ip = {}
    let is_web = !req.headers['user-agent'].includes('Android')

    let contact = req.body.contact;
    let password = req.body.password;

    if(!(contact && password  )){
        return await ss(null,'fields missing')
    }
    isNaN(contact) ? where['email'] = contact : where['phone'] = contact
    let select = "*"
    let data_test = await fetch_row(select,'users',where);
    if(!data_test){
        return await ss(null,`Contact isn't registered`,2)
    }
    where['password'] = password;

    
    let data = await fetch_row(select,'users',where);
    
    if(!data){ 
        return await ss(null,'wrong password')
    }
    delete(data['password'])

    
    ip['ip'] = req.ip
    ip['user_id'] = data.user_id
    ip['coords'] = req.body.coords
    insert(ip,'login_log')
    doc['user_id'] = data.user_id
    doc['ip'] = req.ip;
    data.token = jwt.sign({data: doc}, process.env.JWT_KEY);
    return await ss(data,'login successful')
    }catch(err){console.log(err);return await logerr(err,'login')}
}

/**
 * @swagger
 * /central/register:
 *      post:
 *          tags:
 *           - central
 *          description: 'register'
 *          parameters:
 *           - name: contact
 *             description: contact number.
 *             in: formData
 *             required: true 
 *           - name: password
 *             description: password .
 *             in: formData
 *             required: true 
 *           - name: name
 *             description: name.
 *             in: formData
 *             required: false 
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
api.post("/register",async(req,res)=>{try{
    let data = {}
    const {contact , password , name} = req.body
    
    isNaN(contact) ? data['email'] = contact : data['phone'] = contact

    if(!(contact && password && name)){
        return res.send(await ss(null,'fields missing'));
    }
    
    let data_fetch = await fetch_row('*','users',data);
    console.log(data_fetch)
    if(data_fetch){
        return res.send(ss(null,'Already registered'))
    }

    data['password'] = password
    data['name'] = name
    console.log(data)
    await insert(data,'users');

    let login_response =  await login(req,res)

    let msg = [contact]

    login_response['msg'] = 'registration succesfull'
    return res.send(login_response);
    }catch(err){console.log(err);res.send(await logerr(err,'register'))}
})



/** 
 * @swagger
 * /central/fetch_logs/{file}:
 *    get:
 *        tags:
 *           - central
 *        description: 'fetch_logs'
 *        parameters: 
 *         - name: file
 *           description : 
 *           in : path
 *           required: true
 *           enum :
 *             - info.log
 *             - error.log
 *             - silly.log
 *        responses :
 *           '200':
 *             description: OK
 *           '403':
 *             description: Unauthorized access
 *           '500':
 *             description: Internal server error
 */
api.get('/fetch_logs/:filename',async (req,res)=>{try{
    let file = './logs/'+req.params.filename
    res.download(file)
    }catch(err){logerr(err,'fetch_logs')}
})
