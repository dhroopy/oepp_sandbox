// var sqlite3 = require('sqlite3').verbose();
// var file = "mydb";
// var db = new sqlite3.Database(file);
var knex = require('knex')({
    client:'sqlite3',
    connection:{
        filename:"./mydb.sqlite"
    },
    useNullAsDefault:true
})

module.exports = {

    async fetch(data,table,...where){
        let and_where = where[6]??{}
        let or_where = where[5]??{}
        let sort = where[4]??null
        let properties = where[3]??[]
        let key = where[2]??null
        let lmt = where[1]??[0,100]
        where = where[0]
        typeof(where)=='object' ? '': where = knex.raw(where)

        if(data){
            var val = knex.select(knex.raw(data)).offset(lmt[0]).limit(lmt[1])
        }
        else{
            var val = knex.select(knex.raw('count(id) as count'))
        }
        val.from(table).where(where)
        if(key){
            val.where(properties[0],'like','%'+key+'%')
            for (let i = 1; i < properties.length; i++) {
                val.orWhere(properties[i],'like','%'+key+'%')
            }
        }
        if(or_where){
            for (const [key,value] of Object.entries(or_where)) {
                val.orWhere(key,value).where(and_where)
            }
        }
        if(sort){
            val.orderBy(sort.key,sort.direction)
        }

        // console.log(val.toString())
        return val
    },


    async fetch_row(data,table,...where){
        where[1] = [0,1]
        return (await module.exports.fetch(data,table,...where))[0]
    },

    async insert(data,table){
        let val = await knex(table).insert(data)
        return val[0]
    },
    update(data,table,where){
        return knex(table).where(where).update(data)
    },

    deactivate(table,where){
        return knex(table).where(where).delete()
    },
}