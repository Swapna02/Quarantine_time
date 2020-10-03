var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');
var likeModule = require('../modules/like');
var fbModule = require('../modules/feedback');
var FeededModule = require('../modules/feedData');
var CommentModule = require('../modules/commentData');
var jwt = require('jsonwebtoken');
// const ejsLint = require('ejs-lint');
const multer = require('multer');
const  path  = require('../app');
var parth = require('path');
const { post, render } = require('../app');
const fs = require('fs');
const commentModel = require('../modules/commentData');
const FeededModel = require('../modules/feedData');
var ObjectId = require("mongodb").ObjectId;
// const FeededModel = require('../modules/feedData');
// var bcrypt =require('bcrypt.js');
/* GET home page. */

router.use(express.static(__dirname+"./public/"));

function TimeFunc(D) {
  var str = D+"";
  var res = str.split(" ");
  var cdate = new Date()+"" ;
  var d = cdate.split(" ");
  if(d[3] != res[3]){
  var y2= parseInt(res[3], 10);
  var y1= parseInt(d[3], 10);
  if(y1-y2 == 1){return "1 yr ago";}
  return y1-y2+" yr ago";
  }else if(d[1] != res [1])
  {
  
  	month2 = res[1].toLowerCase();
    month1 = d[1].toLowerCase();
		var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
		month1 = parseInt( months.indexOf(month1),10);
        month2 = parseInt( months.indexOf(month2),10);
        if(month1-month2 == 1){return "1 yr ago";}
        return month1-month2+"month ago";
  }
  else if(d[2] != res [2])
  {
  	
  	var y2= parseInt(res[2], 10);
  	var y1= parseInt(d[2], 10);
    if(y1-y2 == 1){return "1 day ago";}
  	else {return y1-y2+" days ago";}
  }
  else {
  	var t1 = d[4].split(":");
    var t2 = res[4].split(":");
    if(t1[0] != t2[0]){
    	 var h2= parseInt(t2[0], 10);
  		 var h1= parseInt(t1[0], 10);
    return h1-h2+" hr ago";
    }
    else if(t1[1] != t2[1]){
    	 var m2= parseInt(t2[1], 10);
  		 var m1= parseInt(t1[1], 10);
         return m1-m2+" min ago";
         }
         else
         {
         var s2= parseInt(t2[2], 10);
  		 var s1= parseInt(t1[2], 10);
         return s1-s2+" sec ago";
         
         }
  }
  
}


function checkLoginUser(req,res,next)
{
  var UserToken=localStorage.getItem('UserToken')
  try {
    var decoded = jwt.verify(UserToken, 'LoginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var Storage = multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+parth.extname(file.originalname));
    // cb(null,file.fieldname+"_"+Date.now()+parth.e);
  }
});
var upload = multer({
  storage:Storage
}).single('file');
function getLikes(id){
  var u= localStorage.getItem('loginUser');
  likeModule.find({id:id}).then(
    (likes)=>{
      var l=likes.length;
      FeededModule.findOneAndUpdate({_id:id},{
        likes:l
      },{new:true},(err,doc)=>{
        if(err) throw err;
        // console.log("like Added");
      })
    })
}
function getComments(id){
  var u= localStorage.getItem('loginUser');
  CommentModule.find({id:id}).then(
    (cmnt)=>{
      var l=cmnt.length;
      FeededModule.findOneAndUpdate({_id:id},{
        comments:l
      },{new:true},(err,doc)=>{
        if(err) throw err;
        // console.log("Commnt Added");
      })
    })
}
function checkemail(req,res,next){
  var email=req.body.uremail;
  var checkexitemail=userModule.findOne({email:email});
  checkexitemail.exec((err,data)=>{
    if(err) throw err;
    if(data){
     return res.render('index', { title: 'Quartine Time', msg:'email already exists bro!',user:''});
    }
    next();
  });
}
// Function to get current filenames 
// in directory with specific extension 
function getFilesInDirectory() { 
  // console.log("\nFiles present in directory:"); 
  let files = fs.readdirSync("./public/uploads/"); 
  files.forEach(file => { 
    // console.log(file); 
  }); 
}

router.get('/', function(req, res, next) {
  FeededModule.find().then(
    (things) => {
      var u= localStorage.getItem('loginUser');
      things=things.reverse();
      var length=4;
      var i;
     for( i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      getLikes(things[i]._id);
      getComments(things[i]._id);
      // console.log(rt);
      FeededModule.findOneAndUpdate({ date:things[i].date },{
        crDate:rt,
      },{new:true},(err,doc) => {
        if(err) throw err;
     });
    }
    // console.log(things);
    res.render('index', { title: 'Quartine Time',msg:'',things:things,tl:things.length ,l:length,user:u});
     }
  ).catch((error) => {
      res.status(400).json({
        error: error
      });});
});
router.get('/Gallery',checkLoginUser, function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  // console.log(u);

  FeededModule.find({username:u}).then(
    (things) => {
      if(things.length > 0){
        things=things.reverse();
        // console.log(things);
        for(var i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      console.log(rt);
      FeededModule.findOneAndUpdate({date:things[i].date},{
        crDate:rt,
      },{new:true},(err,doc)=>{
        // console.log("updated");
        if(err) throw err
     })
    }
          res.render('gallery', { title: 'Quartine Time',msg:'',things:things,user:u,tl:things.length});
          // res.redirect('/feed');
        // console.log(things);
      }
        else{ 
          res.render('gallery', { title: 'Quartine Time',msg:'',things:'',user:u,tl:things.length});
        }
      }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
        
      });
    }
  );
  // res.redirect('/');
  // res.render('Gallery', { title: 'Quartine Time',msg:''});
});
router.post('/Gallery',upload, function(req, res, next) {
  var category = req.body.selection;
  var info = req.body.text;
  var image = req.file.filename;
  var u= localStorage.getItem('loginUser');
  userModule.find({name:u}).then(
    (data) =>{
     var up=data[0].image;
     var n=data[0].name;
  var feedefDetails = new FeededModule({
    category:category,
    info:info,
    image:image,
    username:n,
    userpic:up,
    crDate:'',
    likes:0,
    comments:0,
  });
  feedefDetails.save((err,doc)=>{
    // console.log("feededdd");
    if(err) throw err
    res.redirect('Gallery');
    // console.log(feedefDetails);
  })
}
) .catch(
  (error) => {
    var feedefDetails = new FeededModule({
      category:category,
      info:info,
      image:image,
      username:u,
      userpic:up,
    });
    feedefDetails.save((err,doc)=>{
      // console.log("feededdd");
      if(err) throw err
      res.redirect('/Gallery');
      // console.log(feedefDetails);
    })
  }
);
  
  // res.render('Gallery', { title: 'Quartine Time',msg:''});
});
router.post('/',checkemail, function(req, res, next) {
  var UserEmail = req.body.uremail;
  var UserPassword = req.body.urpswd;
  // localStorage.removeItem('loginUser');
  
  var n= UserEmail.split('@');
  console.log(n[0]);
//   var UserConfrmPassword = req.body.urcpswd;
// UserPassword=bcrypt.hashSync(req.body.urpswd,10);
  var userDetails = new userModule(
    {
      email: UserEmail,
    password:UserPassword,
    name:n[0],
    mob:'',
    image:'',
    add:'',
    about:'',
  });
  // console.log("HIII");
  // console.log(userDetails);
  userDetails.save((err,doc)=>
  {
    
    // console.log("swap");
    if(err)
    res.render('index', { title: 'Quartine Time', msg:'INvalid email or password!',things:'',tl:'' ,l:'',user:UserEmail});
    
    else{
    console.log(userDetails);
      res.render('index', { title: 'Quartine Time', msg:'Register succesfully!',things:'',tl:'' ,l:'',user:UserEmail});
    }
  });

});
router.post('/Explore',function(req,res,next){
  var email=req.body.uemail;
  var password=req.body.upassword;
  var checkuserEmail=userModule.findOne({email:email});
  checkuserEmail.exec((err, data)=>{
    if(err) throw err;
    var getPassword=data.password;
    var getUserId=data._id;
    var n=data.name;
    console.log(data);
    // console.log(getPassword);
    if(password==getPassword){
      var token = jwt.sign({ UserId: getUserId }, 'LoginToken');
      // localStorage.removeItem('loginUser');
      localStorage.setItem('UserToken', token);
      localStorage.setItem('loginUser', n);
      // res.redirect('/feed');
      res.render('feed', { title: 'Quartine Time', msg:'User logged in successfully!'});
    }else
    res.render('index', { title: 'Quartine Time', msg:'INvalid email or password!',things:'',tl:'' ,l:'',user:email});
  });

})
router.get('/Explore', function(req, res, next) { 
  FeededModule.find().then(
    (things) => {
      things=things.reverse();
      var u= localStorage.getItem('loginUser');
      for(var i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      getLikes(things[i]._id);
      getComments(things[i]._id);
      // console.log(rt);
      FeededModule.findOneAndUpdate({date:things[i].date},{
        crDate:rt,
      },{new:true},(err,doc)=>{
        // console.log("updated");
        if(err) throw err
     })
    }
      res.render('Explore', { title: 'Quartine Time',msg:'',things:things,tl:things.length,user:u });
      // console.log(things);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
        
      });
    }
  );
    
});
router.get('/Categories/:cat', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  if(req.params.cat == "ALL")
  {
    FeededModule.find().then(
      (things) => {
        if(things.length > 0){
          for(var i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      // console.log(rt);
      FeededModule.findOneAndUpdate({date:things[i].date},{
        crDate:rt,
      },{new:true},(err,doc)=>{
        // console.log("updated");
        if(err) throw err
     })
    }
          things=things.reverse();
          res.render('Category', { title: 'Quartine Time',msg:'',things:things,tl:things.length,user:u });
          // console.log(things);
        }
          else{ 
            res.render('Category', { title: 'Quartine Time',msg:'Not availabe',things:things,tl:things.length,user:u });
          }
        }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
          
        });
      }
    );
  }
  else{
  FeededModule.find({category:req.params.cat}).then(
    (things) => {
      if(things.length > 0){
      things=things.reverse();
      res.render('Category', { title: 'Quartine Time',msg:'',things:things,tl:things.length,user:u });
      // console.log(things);
    }
      else{ 
        res.render('Category', { title: 'Quartine Time',msg:'Not availabe',things:things,tl:things.length,user:u });
      }
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
        
      });
    }
  );
  }
});
router.get('/UserCats/:cat',checkLoginUser, function(req, res, next) {
  if(req.params.cat == "ALL")
  {
    var u= localStorage.getItem('loginUser');
    FeededModule.find({username:u}).then(
      (things) => {
        if(things.length > 0){
          for(var i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      getLikes(things[i]._id);
      getComments(things[i]._id);
      // console.log(rt);
      FeededModule.findOneAndUpdate({date:things[i].date},{
        crDate:rt,
      },{new:true},(err,doc)=>{
        // console.log("updated");
        if(err) throw err
     })
    }
          things=things.reverse();
          res.render('UserCat', { title: 'Quartine Time',msg:'',things:things,tl:things.length });
          // console.log(things);
        }
          else{ 
            res.render('UserCat', { title: 'Quartine Time',msg:'Not availabe',things:things,tl:things.length });
          }
        }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
          
        });
      }
    );
  }
  else{
    var u= localStorage.getItem('loginUser');
  FeededModule.find({category:req.params.cat,username:u}).then(
    (things) => {
      if(things.length > 0){
      things=things.reverse();
      res.render('Category', { title: 'Quartine Time',msg:'',things:things,tl:things.length });
      // console.log(things);
    }
      else{ 
        res.render('Category', { title: 'Quartine Time',msg:'Not availabe',things:things,tl:things.length });
      }
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
        
      });
    }
  );
  }
});
router.get('/posts/:id',upload, function(req, res, next) {
  var j = true;
  var u= localStorage.getItem('loginUser');
  if(req.params.id != "..." && j== true){
  FeededModule.find().then(
    (things) => {
      for(var i=0;i<things.length;i++){
        console.log(things[i]._id);
        console.log(req.params.id);
        if(things[i]._id==req.params.id)
      {console.log(things[i]._id);
      var p=things[i];
    break;}
  }
  for(var i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      getLikes(things[i]._id);
      getComments(things[i]._id);
      // console.log(rt);
      FeededModule.findOneAndUpdate({date:things[i].date},{
        crDate:rt,
      },{new:true},(err,doc)=>{
        // console.log("updated");
        if(err) throw err
     })
    }
      things=things.reverse();
      res.render('post', { title: 'Quartine Time',msg:'',things:things,p:p,user:u});
      // res.send(things);
      // console.log(things);
      // console.log(p);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
        
      });
    }
  );
  }
});
router.get('/Userposts/:id',upload,checkLoginUser, function(req, res, next) {
  var j = true;
  var u= localStorage.getItem('loginUser');
  // console.log(u);
  // console.log(req.params.id);
  if(req.params.id != "..." && j== true){
  FeededModule.find({username:u}).then(
    (things) => {
      // console.log(things);
      for(var i=0;i<things.length;i++){
        // console.log(things[i]._id);
        // console.log(req.params.id);
        if(things[i]._id==req.params.id)
      {
        // console.log(things[i]._id);
      var p=things[i];
    break;}
  }
  for(var i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      getLikes(things[i]._id);
      getComments(things[i]._id);
      // console.log(rt);
      FeededModule.findOneAndUpdate({date:things[i].date},{
        crDate:rt,
      },{new:true},(err,doc)=>{
        // console.log("updated");
        if(err) throw err
     })
    }
      things=things.reverse();
      res.render('Userpost', { title: 'Quartine Time',msg:'',things:things,p:p});
      // res.send(things);
      // console.log(things);
      // console.log(p);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
        
      });
    }
  );
  }
});
router.get('/logout',checkLoginUser, function(req, res, next) {
  localStorage.removeItem('UserToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});
router.get('/deleteAcc',checkLoginUser, function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  userModule.findOneAndDelete({name:u},function(err,docs){
    if(err) throw err;
    console.log(docs);
    FeededModel.deleteMany({username:u}).then(
      (things)=>{
        console.log("Deleted");
      }).catch((error) => {
        res.status(400).json({
          error: error
        });});
        likeModule.deleteMany({username:u}).then(
          (things)=>{
            console.log("Deleted");
          }).catch((error) => {
            res.status(400).json({
              error: error
            });});
    commentModel.deleteMany({username:u}).then(
      (things)=>{
        console.log("Deleted");
      }).catch((error) => {
        res.status(400).json({
          error: error
        });});
        fbModule.deleteMany({username:u}).then(
          (things)=>{
            console.log("Deleted");
          }).catch((error) => {
            res.status(400).json({
              error: error
            });});
    localStorage.removeItem('UserToken');
    localStorage.removeItem('loginUser');
    res.redirect('/');
  })
  
});
router.get('/feed',checkLoginUser, function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  // if(u){
  res.render('feed', { title: 'Quartine Time',msg:'',user:u});
// }
  // else{
    // res.redirect('/')
  // }
});
router.post('/feed', function(req, res, next) {
  var email=req.body.uemail;
  var password=req.body.upassword;
  var checkuserEmail=userModule.findOne({email:email});
  checkuserEmail.exec((err, data)=>{
    FeededModule.find().then(
      (things) => {
        var u= localStorage.getItem('loginUser');
        // console.log(u);
        things=things.reverse();
        var length=4;
        var i;
       for( i=0;i<things.length;i++){
        var rt= TimeFunc(things[i].date);
          getLikes(things[i]._id);
          getComments(things[i]._id);
        FeededModule.findOneAndUpdate({ date:things[i].date },{
          crDate:rt,
        },{new:true},(err,doc) => {
          if(err) throw err;
       });
      }
      if(err) {
        console.log(err);
        res.render('index', { title: 'Quartine Time', msg:'Register youself !!!',things:things,tl:things.length ,l:length,user:''});}
        if(!data){
        // console.log(data);
        res.render('index', { title: 'Quartine Time', msg:'Register youself !!!',things:things,tl:things.length ,l:length,user:''});}
      var getPassword=data.password;
      var getUserId=data._id;
      var nm=data.name;
      // console.log(data);
      // console.log(getPassword);
      if(password==getPassword){
        var token = jwt.sign({ UserId: getUserId }, 'LoginToken');
        // localStorage.removeItem('loginUser');
        localStorage.setItem('UserToken', token);
        localStorage.setItem('loginUser', nm);
        // res.redirect('/feed');
        res.render('feed', { title: 'Quartine Time', msg:'User logged in successfully!',user:email});
      }else
      res.render('index', { title: 'Quartine Time', msg:'INvalid email or password!',things:things,tl:things.length ,l:length,user:''});
    }
    ).catch((error) => {
        res.status(400).json({
          error: error
        });});
      });
      
    
});
router.get('/User_profile',checkLoginUser, function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  // console.log(u);
  if(u){
  userModule.find({name:u}).then(
    (things) => {
      // console.log(things);
      // console.log(things[0].name);
      // things=things.reverse();
      for(var i=0;i<things.length;i++)
     {
      var rt= TimeFunc(things[i].date);
      getLikes(things[i]._id);
      getComments(things[i]._id);
      // console.log(rt);
      FeededModule.findOneAndUpdate({date:things[i].date},{
        crDate:rt,
      },{new:true},(err,doc)=>{
        // console.log("updated");
        if(err) throw err
     })
    }
      res.render('User_profile', { title: 'Quartine Time',user:things[0].email,things:things[0]});
      }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
        
      });
    }
  );
}
else{
  res.redirect('/');
}
});
router.post('/User_profile',checkLoginUser,upload,function(req,res,next){
  var mobile = req.body.mobile;
  var pass = req.body.pass;
  var add = req.body.add;
  var about = req.body.aein;
  var image = req.file.filename;
  var u= localStorage.getItem('loginUser');
   userModule.findOneAndUpdate({name:u},{
     name:u,
    mob:mobile,
    image:image,
    add:add,
    about:about,
    password:pass,
  },{new:true},(err,doc)=>{
    // console.log("updated");
    if(err) throw err
    // res.render('User_profile', { title: 'Quartine Time',user:'',things:''});

    var u= localStorage.getItem('loginUser');
    console.log(u);
    userModule.find({name:u}).then(
      (things) => {
        console.log(things);
        console.log(things[0].name);
        things=things.reverse();
        res.render('User_profile', { title: 'Quartine Time',user:u,things:things[0]});
        }
      
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
          
        });
      }
    );

    // res.render('User_profile', { title: 'Quartine Time',user:'',things:''});
    // console.log(userModule);
  })
});
router.get('/news', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('news', { title: 'Quartine Time',user:u });
});
router.get('/edu', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('edu', { title: 'Quartine Time',user:u });
});
router.get('/ente', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('ente', { title: 'Quartine Time',user:u });
});
router.get('/misc', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('misc', { title: 'Quartine Time' ,user:u});
});
router.get('/politics', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('politics', { title: 'Quartine Time' ,user:u});
});
router.get('/science', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('science', { title: 'Quartine Time',user:u });
});
router.get('/sports', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('sports', { title: 'Quartine Time',user:u });
});
router.get('/travel', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('travel', { title: 'Quartine Time',user:u });
});
router.get('/world', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('world', { title: 'Quartine Time',user:u });
});
router.get('/like/:id',checkLoginUser, function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  
  if(!u)
  res.redirect('/');
  else{
    var id=req.params.id;
    getLikes(id);
    likeModule.find({id:id}).then(
      (likers)=>{
        
          
          if(likers.length==0){
            var likeDoc = new likeModule({
              username:u,
              id:id,
            });
            likeDoc.save((err,docs)=>{
              if(err) throw err;
              res.redirect('/');
            });

          }
            else{
              var got=true;
              for(var i=0;i<likers.length;i++)
              {
                if(likers[i].username == u)
                {
                  got=false;
                }
              }
              if(got)
              {
                var likeDoc = new likeModule({
                  username:u,
                  id:id,
                });
                likeDoc.save((err,docs)=>{
                  if(err) throw err;
                  res.redirect('/');
                });
    
              }else{
                res.redirect('/')
              }
            }
          
      }).catch((error)=>{
        console.log(error);
        });
  }
});
router.get('/share/:id', function(req,res,next){
  var u= localStorage.getItem('loginUser');
  console.log(u);
  if(!u)
  {res.redirect('/');}
  else{
    var  id=req.params.id;
    FeededModule.findOne({_id:id}).then(
      (things)=>{

        // console.log(things);
        // console.log(things.username);
        // console.log(u);
        if(things.username == u)
        {
          // console.log('good try');
          res.redirect('/Gallery');
        }
        else{
          userModule.find({email:u}).then(
            (data) => {
              // console.log(data[0].image);  
          
          var feedefDetails = new FeededModule({
            category:things.category,
            info:things.info,
            image:things.image,
            username:u,
            userpic:data[0].image,
          });
          feedefDetails.save((err,doc)=>{
            // console.log("feededdd");
            if(err) throw err
            res.redirect('/Gallery');
            // console.log(feedefDetails);
          })

        }
        ).catch((error) => {
          
            res.status(400).json({
              error: error
            });});

        }
      }
    )
  }
});
router.post('/comment/:id',function(req,res,next){
  var u= localStorage.getItem('loginUser');
  var id=req.params.id;
  getComments(id);
  var commnt=req.body.cmnt;
  var commentDetails = new CommentModule({
    comments:commnt,
    username:u,
    id:id,
  });
  commentDetails.save((err,doc)=>{
    if(err) throw err;
    res.redirect('../comment/'+id);
    // res.render('comments', { title: 'Quartine Time',msg:'',things:'',tl:'',t:'',l:'',user:'',pre:''});
  });
});
router.get('/Comment/:id', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  getComments(id);
  var id = req.params.id;
  var show= FeededModule.findOne({_id:id});
  FeededModule.find().then(
    (things) => {
      var u= localStorage.getItem('loginUser');
      things=things.reverse();
      var length=parseInt(things.length/3);
      var c=parseInt(3);
      if(things.length%3 != 0)
      {
        length+=1;
      }
      // console.log(length);
      // console.log(c);
      
    show.exec((err,data)=>{
      if(err) throw err;
      // console.log(data.image);
      commentModel.find({id:id}).then(
        (d)=>{
          // console.log(d);
        res.render('comments', { title: 'Quartine Time',msg:'',things:things,tl:things.length,t:c,l:length,user:u,pre:data,cmnts:d});
      }).catch((error)=>{
        res.status(400).json({
          error:error
        });});
      
    })
     }
  ).catch((error) => {
      res.status(400).json({
        error: error
      });});
  // res.render('comments', { title: 'Quartine Time',user:u });
});
router.get('/deletecmt/:id',function(req,res,next){
  var id=req.params.id;
commentModel.findByIdAndDelete(id,function(err,docs){
if(err)
console.log(err);
else{
  // console.log(docs.id);
  res.redirect('../comment/'+docs.id);
}
})
});
router.get('/deletePost/:id',function(req,res,next){
  var id=req.params.id;
  // Storage._removeFile()

  FeededModule.findByIdAndDelete(id,function(err,docs){
    if(err)
console.log(err);
else{
  var nm="./public/uploads/"+docs.image;
  getFilesInDirectory(); 
  console.log("heyyy");
// Delete example_file.txt 
fs.unlink(nm, (err => { 
  if (err) console.log(err); 
  else { 
    console.log("\nDeleted file"+nm); 
  
    // Get the files in current diectory 
    // after deletion 
    getFilesInDirectory(); 
  } 
})); 
  
  // console.log(docs.id);
  res.redirect('/gallery');
}
  })
});
router.get('/About', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('About', { title: 'Quartine Time',user:u });
});
router.get('/Help', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('Help', { title: 'Quartine Time',user:u });
});
router.post('/Help',checkLoginUser, function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  var feedback = req.body.fback;
  if(!u)
  {
    res.redirect('/');
  }else{
  var feedData = new fbModule({
    username:u,
    Question:feedback,
  });
  feedData.save((err,doc)=>{
    if(err) throw err;
    res.render('Help', { title: 'Quartine Time',user:u });
  });
}
});
router.get('/Developer', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('Developer', { title: 'Quartine Time',user:u });
});
router.get('/Privacy', function(req, res, next) {
  var u= localStorage.getItem('loginUser');
  res.render('Privacy', { title: 'Quartine Time',user:u });
});
module.exports = router;





