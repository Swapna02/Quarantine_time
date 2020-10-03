const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qt', {useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex: true,});
var conn =mongoose.Collection;
var userSchema =new mongoose.Schema({

	email: {
        type:String, 
        required: true,
        index: {
            unique: true, 
        },},
    password: {
        type:String, 
        required:true,
    },
    image: {
        type:String, 
    },
    name: {
        type:String, 
    },
    mob: {
        type:String, 
    },
    add: {
        type:String, 
    },
    about: {
        type:String, 
    },
    date:{
        type: Date, 
        default: Date.now }
});

var userModel = mongoose.model('users', userSchema);
module.exports=userModel;