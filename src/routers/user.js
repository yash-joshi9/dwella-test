const express = require("express");
const User = require("../models/User");

const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

var cors = require('cors');

var app = express();
app.use(cors())

const router = new express.Router();


var corsOptions = {
  origin: '*',
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


router.post("/users-register", cors(corsOptions), async (req, res) => {

  let {username, fullname, address, email, phoneNumber, password } = req.body;
  
  const data = {username, fullname, address, email, phoneNumber, password}
  const user = new User(data);

  try {
    const email = req.body.email;
    const isUser = await User.findOne({email});

    if(isUser) {
      return res.status(200).send({ error: "Already registered" })
    }

    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e){
    console.log(e)
    res.sendStatus(400);
  }
});

router.post("/users-login", cors(corsOptions), async (req, res) => {
  try {
    let {email, password } = req.body;
    
    const user = await User.findByCredentials(
      email,
      password
    );
    
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    console.error(e);
    res.status(400).send({error: "Wrong email or password "});
  }
});



router.post("/users-change-password", cors(corsOptions), async (req, res) => {
  try {
    console.log(req.body);
    let {email, password, newPassword } = req.body;
    

    if(!newPassword) {
      return res.status(404).send({ error: "Please enter a new password" })
    }

    if(newPassword.length < 7) {
      return res.status(404).send({ error: "Please enter a valid password" })
    }

    let user = await User.findByCredentials(
      email,
      password
    );

    newPassword = await bcrypt.hash(newPassword, 8);

    const result = await user.updateOne({password: newPassword});
    
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token, message: "Successfully changed the password" });
  } catch (e) {
    console.error(e);
    res.status(400).send({error: "Wrong email or password "});
  }
});

router.post("/users-update-profile", cors(corsOptions), auth, async (req,res) => {
  try {
    const { fullname, address, phoneNumber, email, password } = req.body;
    let user = await User.findByCredentials(
      email,
      password
    );

    const result = await user.updateOne({fullname, address, phoneNumber});
    
    res.send({result, message: "Changed the values successfully"})
  } catch (error) {
      console.log(error);
      res.status(400).send({error: "failed to fetch the data "});
  }
})


router.get("/users-get-all", cors(corsOptions), async (req,res) => {
  try {
    const user = await User.find();

    res.send({user})
  } catch (error) {
      console.log(error);
      res.status(400).send({error: "failed to fetch the data "});
  }
})

router.get("/users-getByUserName", cors(corsOptions), async (req,res) => {
  try {
    const { username } = req.body;

    if(!username) {
      res.status(400).send({message: "Please enter a username"});

    }
    const user = await User.find({username});
    res.send({user})
  } catch (error) {
      console.log(error);
      res.status(400).send({error: "failed to fetch the data "});
  }
})

router.post("/users-delete", auth, async (req, res) => {
  try {
    console.log(req.body);
    let {email, password } = req.body;
    
    const user = await User.findByCredentials(
      email,
      password
    );

    user.remove();
    res.status(200).send({ message: "User removed" });
  } catch (e) {
    console.error(e);
    res.status(400).send({error: "Wrong email or password "});
  }
});

module.exports = router;
