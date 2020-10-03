const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qt', {useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex: true,});
var conn =mongoose.Collection;
var likeSchema =new mongoose.Schema({
    username:{
        type:String,
    },
    id:{
        type:String,
    },
    date:{
        type: Date, 
        default: Date.now }
});

var likeModel = mongoose.model('likes', likeSchema);
module.exports=likeModel;
