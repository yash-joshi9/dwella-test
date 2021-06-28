const express = require("express");
const axios = require("axios")
var cors = require('cors');

var app = express();
app.use(cors())

const router = new express.Router();
const RealEstate = require("../models/RealEstate");


var corsOptions = {
  origin: '*',
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


router.post("/realestate/new-listing", cors(corsOptions), async (req, res) => {

    let { title, address, price, city, owner, typeOfEstate  } = req.body;
    

    const params = {
        access_key: process.env.ACCESS_KEY,
        query: `${address} ${city}`
      }

      const data = { title, address, price, city, owner, typeOfEstate }
      try {
          let coordinates = null;
          await axios.get('http://api.positionstack.com/v1/forward', {params})
          .then(response => {
              if(response.data != null) {
                    const { latitude, longitude } = response.data.data[0]
                    coordinates = [latitude, longitude]
                }
            }).catch(error => {
                console.log(error);
            });

            const estate = new RealEstate(data);
            await estate.save();
            res.status(201).send({ estate, coordinates });
    } catch (e){
      console.log(e)
      res.sendStatus(400);
    }
  });



  router.post("/realestate/update/id", cors(corsOptions), async (req, res) => {
      try {
        const { id, ...values } =  req.body
        const realEstate = await RealEstate.findByIdAndUpdate(id, values)

        if(realEstate.isDeleted) {
            return res.status(404).send({ error: "No listing found with this id" });
        }
        const newEstate = await RealEstate.findById({_id: id})
        return res.status(200).send({ newEstate });
    } catch (error) {
        console.log(error)
        return res.status(400).send({ error });
    }
  })
  
  router.post("/realestate/delist", cors(corsOptions), async (req, res) => {
    try {
      const { id, delist } =  req.body
      const realEstate = await RealEstate.findByIdAndUpdate(id, {isDeleted: delist})
      const newEstate = await RealEstate.findById({_id: id})
      res.status(200).send({ newEstate });
  } catch (error) {
      console.log(error)
      res.status(400).send({ error });
  }
    })

    router.post("/realestate/delete-listing", cors(corsOptions), async (req, res) => {
        try {
          const { id } =  req.body
          const realEstate = await RealEstate.deleteOne({_id: id})
          res.status(200).send({ realEstate });
      } catch (error) {
          console.log(error)
          res.status(400).send({ error });
      }
        })


    router.get("/realestate/get-listing", cors(corsOptions), async (req, res) => {
        try {
            const realEstate = await RealEstate.find({isDeleted: false})
            res.status(200).send({ realEstate });
        } catch (error) {
            console.log(error)
            res.status(400).send({ error });
        }
        })

    router.get("/realestate/get-listing-by-city", cors(corsOptions), async (req, res) => {
        try {
            const { city } = req.body;
            const realEstate = await RealEstate.find( { "city" : { "$regex" : city, "$options" : "-i"}, isDeleted: false })
            res.status(200).send({ realEstate });
        } catch (error) {
            console.log(error)
            res.status(400).send({ error });
        }
    })

    router.get("/realestate/get-City-Price", cors(corsOptions), async (req, res) => {
        try {
            const { city, lower, higher } = req.body;
            const realEstate = await RealEstate.find({ "city" : { "$regex" : city, "$options" : "-i"}, isDeleted: false, "price": { $gt: lower , $lt: higher } })
            res.status(200).send({ realEstate });
        } catch (error) {
            console.log(error)
            res.status(400).send({ error });
        }
    })




module.exports = router;
