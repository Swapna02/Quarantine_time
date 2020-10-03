const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qt', {useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex: true,});
var conn =mongoose.Collection;
var fbSchema =new mongoose.Schema({
    username: {
        type:String, 
    },
    Question: {
        type:String, 
    },
    date:{
        type: Date, 
        default: Date.now }
});

var fbModel = mongoose.model('Feedback', fbSchema);
module.exports=fbModel;