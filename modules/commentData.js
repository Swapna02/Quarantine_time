const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qt', {useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex: true,});
var conn =mongoose.Collection;
var commentSchema =new mongoose.Schema({
    username: {
        type:String, 
    },
    id:{
        type:String,
    },
    comments: {
        type:String, 
    },
    date:{
        type: Date, 
        default: Date.now }
});

var commentModel = mongoose.model('comments', commentSchema);
module.exports=commentModel;