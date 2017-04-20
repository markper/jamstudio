/**
 * Created by maoztamir on 20/04/2017.
 */
/**
 * Created by Maoz on 2/16/2017.
 */
// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
    name: String ,
    password: String,
    admin: Boolean
}));
