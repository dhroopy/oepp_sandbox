const api = require('express').Router()

const multer  = require('multer')
const file = multer({dest:'uploads'})
const fs = require('fs')
const moment = require('moment')
const {  insert, fetch, deactivate, fetch_row, update } = require('../model')
const { verifytoken, ss, logerr } = require('../helper')



api.use(async (req,res,next)=>{
    let result = await verifytoken(req,res)
    if(result==0){
        return res.status(401).send({status:1,msg:'unauthorized access'})
    }
    next()
})
module.exports = api

// ===========================================api======================================================
// ---------------------------------------------------users------------------------------------------------------- // 


// CREATE TABLE `users` (
//     `id` INT(10) NOT NULL AUTO_INCREMENT,
//     `user_id` INT(11) NULL DEFAULT NULL,
//     `name` VARCHAR(50) NULL COLLATE 'latin1_swedish_ci',
//     `email` VARCHAR(50) NULL COLLATE 'latin1_swedish_ci',
//     `phone` VARCHAR(50) NULL COLLATE 'latin1_swedish_ci',
//     `address` VARCHAR(50) NULL COLLATE 'latin1_swedish_ci',
//     )
//     ;)
/**
 * @swagger
 * /admin/add_users:
 *    post :
 *        tags :
 *           - admin
 *        description: 'add_users'
 *        parameters :
 *         - name : 'Authorization'
 *           description: 'Token in header'
 *           in : header
 *         - name: name
 *           description : 
 *           in : formData
 *           required: true
 *         - name: email
 *           description : 
 *           in : formData
 *           required: true
 *         - name: phone
 *           description : 
 *           in : formData
 *           required: true
 *         - name: name
 *           description : 
 *           in : formData
 *           required: true
 *         - name: address
 *           description : 
 *           in : formData
 *           required: false
 *        responses :
 *           '200':
 *             description: OK
 *           '403':
 *             description: Unauthorized access
 *           '500':
 *             description: Internal server error
 */
 api.post('/add_users',async (req,res)=>{try{
    let au = await add_users(req,res)
    res.send(au)
    }catch(err){logerr(err,'add_users')}
})
async function add_users(req,res){try{
    const {name,email,phone,address} = req.body
    var data = {}
    data['name'] = name
    data['email'] = email
    data['phone'] = phone
    data['address'] = address
    data['user_id'] = req.person.user_id

    let where_users = `user_id = ${req.person.user_id} AND phone = ${phone}`
    //check
    let check = await fetch_row('*','user',where_users)
    if(check){
        return await ss(null,'users with this phone/emails already exists')
    }
    let ins = await insert(data,'user')

    return await ss(ins)
}catch(err){return await logerr(err,'add_user')}}


/**
 * @swagger
 * /admin/update_user:
 *    post :
 *        tags :
 *           - admin
 *        description: 'update_user'
 *        parameters :
 *         - name : 'Authorization'
 *           description: 'Token in header'
 *           in : header
 *         - name: id
 *           description : primary key
 *           in : formData
 *           required: false
 * 
 *         - name: email
 *           description : 
 *           in : formData
 *           required: true
 *         - name: phone
 *           description : 
 *           in : formData
 *           required: true
 *         - name: name
 *           description : 
 *           in : formData
 *           required: true
 *         - name: address
 *           description : 
 *           in : formData
 *           required: falses
 *        responses :
 *           '200':
 *             description: OK
 *           '403':
 *             description: Unauthorized access
 *           '500':
 *             description: Internal server error
 */
api.post('/update_user',async (req,res)=>{try{
    let au = await update_user(req,res)
    res.send(au)
    }catch(err){logerr(err,'update_user')}
})
async function update_user(req,res){try{
    const {id,name,email,phone,address} = req.body
    let data = {}
    data['name'] = name
    data['email'] = email
    data['phone'] = phone
    data['address'] = address

    let where = {id:id}
    let ins = await update(data,'user',where)
    return await ss(ins)
}catch(err){console.log(err);return await logerr(err,'update_user')}}






/**
 * @swagger
 * /admin/delete_user:
 *    post :
 *        tags :
 *           - admin
 *        description: 'delete_user'
 *        parameters :
 *         - name : 'Authorization'
 *           description: 'Token in header'
 *           in : header
 *         - name: id
 *           description : primary key
 *           in : formData
 *           required: true
 *        responses :
 *           '200':
 *             description: OK
 *           '403':
 *             description: Unauthorized access
 *           '500':
 *             description: Internal server error
 */
api.post('/delete_user',async (req,res)=>{try{
    let au = await delete_user(req,res)
    res.send(au)
    }catch(err){logerr(err,'delete_user')}
})
async function delete_user(req,res){try{
    const {id} = req.body
    let where = {id:id}
    let ins = await deactivate('user',where)
    return await ss(ins)
}catch(err){return await logerr(err,'delete_user')}}



/**
 * @swagger
 * /admin/fetch_users:
 *    post:
 *        tags:
 *           - admin
 *        description: 'fetch_users'
 *        parameters: 
 *         - name : 'Authorization'
 *           description: 'Token in header'
 *           in : header
 *         - name: id
 *           description : primary key
 *           in : formData
 *           required: false
 *         - name: key
 *           description : search key word
 *           in : formData
 *           required: false
 *         - name: limit
 *           description : limit the number of results
 *           in : formData
 *           required: false
 *         - name: offset
 *           description : offset value
 *           in : formData
 *           required: false
 *         - name: mode
 *           description : mode of api data(default) ,pdf
 *           in : formData
 *           required: true
 *           enum:
 *            - data
 *            - pdf
 *         - name: sort
 *           description : {"key":"name","direction":"asc"}
 *           in : formData
 *           required: false
 *        responses :
 *           '200':
 *             description: OK
 *           '401':
 *             description: Unauthorized Access
 *           '500':
 *             description: Internal server error
 */
api.post('/fetch_users',async (req,res)=>{try{
    let ret = await fetch_users(req,res)
    res.send(ret)
    }catch(err){logerr(err,'fetch_users')}
})
async function fetch_users(req,res){try{
    var data = '*'
    var where = {}
    const { id, limit = 100, offset = 0 , key, mode, sort} = req.body
    id?where['id'] = id:''
    where['user_id'] = req.person.user_id
    let lmt = [offset,Number(limit)]
    let params = ['email','name','phone'] 
    var data_users = await fetch(data,'user',where,lmt,key,params,sort)
    return ss(data_users)
    }catch(err){return await logerr(err,'fetch_users')}
}

