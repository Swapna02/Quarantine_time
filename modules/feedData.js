const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qt', {useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex: true,});
var conn =mongoose.Collection;
var FeededSchema =new mongoose.Schema({

	category: {
        type:String,
        required: true,
       },
    info: {
        type:String, 
    },
    image:{
        type:String,
    },
    username:{
        type:String,
    },
    likes:{
            type:String,
    },
    comments:{
            type:String,
    },
    userpic:{
        type:String,
    },
    crDate:{type:String,},
    date:{
        type: Date, 
        default: Date.now }
});

var FeededModel = mongoose.model('feeded', FeededSchema);
module.exports=FeededModel;
