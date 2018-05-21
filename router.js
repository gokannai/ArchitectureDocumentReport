var express = require('express');
//var router = express.Router();
const router = express();
var User = require('./models/user');


// GET route for reading data
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//router.get('/api/adrmn', function(req, res) {
    //res.sendFile(__dirname + '/ApiFrontend/test.html');
//});

//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          //return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>' + '<br><a type="button" href="/api/adrmn2">Home Page</a>')
		  return res.redirect('/api/adrmn2');
        }
      }
    });
});


router.use('/api/adrmn2', express.static(__dirname+'/templateLogReg/client'));
adrmn = require('./models/adrmn');


router.get('/api/adrmn',function(req,res){
	
	adrmn.getadr((err, adrmn) => {
		if(err){
			throw err;
		}
		res.json(adrmn);
       
	});
	
});

router.get('/api/adrmn/:_id', (req, res) => {
	adrmn.getadrById(req.params._id, (err, adrmn) => {
		if(err){
			throw err;
		}
		res.json(adrmn);
	});
});

//ADD ADR
router.post('/api/adrmn', (req, res) => {
	var Adrmn = req.body;
	adrmn.addadr(Adrmn, (err, Adrmn) => {
		if(err){
			throw err;
		}
		res.json(Adrmn);
	});
});

//Update ADR Doc 
router.put('/api/adrmn/:_id', (req, res) => {
	var id = req.params._id;
	var Adrmn = req.body;
	adrmn.updateadr(id, Adrmn, {}, (err, Adrmn) => {
		if(err){
			throw err;
		}
		res.json(Adrmn);
	});
});

//Delete ADR Doc

router.delete('/api/adrmn/:_id', (req, res) => {
	var id = req.params._id;
	adrmn.removeadr(id, (err, Adrmn) => {
		if(err){
			throw err;
		}
		res.json(Adrmn);
	});
});


// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;