var express = require('express');
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', function(req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
  });
  userModel.register(userData, req.body.password)
    .then((result)=> {
      passport.authenticate("local")(req, res, ()=> {
        res.redirect("/open");
      });
    })
    .catch((err)=> {
      res.send(err);
    });
});


router.post('/login', passport.authenticate("local", {
  successRedirect: "/open",
  failureRedirect: "/login"
}));

// GET logout route
router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  else {
    res.redirect('/');
  }
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

router.get('/open',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('open', {user});
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/searchUsers', async function(req, res, next) {
  try {
    const data = req.body.data;
    const users = await userModel.find({
      username: {
        $regex: data, 
        $options: "i"
      }
    });
    res.json({ users: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addFriend', isLoggedIn, async (req, res, next) => {
  try {
    const friendId = req.body.friendId;


    const loggedInUser = await userModel.findOne({
      username: req.session.passport.user
    });

    const isAlreadyFriend = loggedInUser.friends.includes(friendId);
    if (isAlreadyFriend) {
      return res.status(200).json({
        message: 'Already friends'
      });
    }

    
    loggedInUser.friends.push(friendId);

  
    await loggedInUser.save();

   
    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
