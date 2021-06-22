const express = require("express");
const db = require("../database");
const {getAllEquipments, getEquipmentsToRent, getEquipmentsToBuy, getEquipmentByPriceInc, updateInCartValue, getElementInCart} = require('../database/query.js')
const app = express();
const port = process.env.PORT || 3001;
var cors = require('cors')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

app.use(cors())


var cors = require('cors')

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }))


const fileupload = require('express-fileupload');
app.use(fileupload({ useTempFiles: true }))

var cloudinary = require("cloudinary").v2
cloudinary.config({
  cloud_name: 'rbkescape',
  api_key: '451369544519695',
  api_secret: 'VIQOj1T-DuUD0goCYRK3WwqeK2k'

})


app.post("/api/upload", async (req, res) => {

  try {

    const image = req.body.data
    let data = req.body
    const result = await cloudinary.uploader.upload(image, {
      upload_preset: 'Escape',
    })
    if (data.rent === "rent") {
      db.postRent(data, result.secure_url, (err, result) => {
        if (err) console.log(err)
        console.log(result)
      })
    } else {
      db.postSell(data, result.secure_url, (err, result) => {
        if (err) console.log(err)
        console.log(result)
      })
    }
  }
  catch (err) {
    console.log("Error", err)
    return res.status(400).json({ error: err })
  }
})


///////////////////////////////////////////////////////////
// fetch element for the store.js component
//////////////////////////////////////////////////////////

//get all equipmenets
app.get('/api/allEquipments', (req, res) => {
  getAllEquipments().then((data) => {
    res.send(data[0])
  })
})

//get equipToBeRent
app.get('/api/toRent', (req, res) => {
  getEquipmentsToRent().then((data) => {
    res.send(data[0])
  })
})

//get equipToBesold
app.get('/api/toBuy', (req, res) => {
  getEquipmentsToBuy().then((data) => {
    res.send(data[0])
  }).catch((err) => {console.log(err);})
})

//filter by price
app.get('/api/select/:price', (req, res) => {
  let price = req.params.price;
  getEquipmentByPriceInc(price).then((data) => {
    if(price === 'priceRent') {
    res.send( data[0].filter((element) => {
           return element.toRent
      }))
    } else if (price === 'priceSell') {
      res.send( data[0].filter((element) => {
        return element.toSell
   }))
    }
  }).catch((err) => {console.log(err);})
})

//update item in cart
app.patch('/api/catItem/:id', (req, res) => {
  let id = req.params.id;
  updateInCartValue(id).then(() => {
    res.status(201).send('updated')
  }).catch((err) => {console.log(err);})
})

//get element inCart

app.get('/api/inCart', (req, res) => {
  getElementInCart().then((result) => {
    console.log(result[0])
    res.status(200).send(result[0])
  })
  .catch((err) => { console.log(err);})
})


////////////////////////////////////////////////////////////

////From bechir
app.get('/api/searchProducts', (req,res) =>{
  db.searchProducts( function(err,result){
    if(err){
      res.send(err)
    } else {
      res.json(result)
    }
  })
})
///////////////////auth////////////////////


app.post('/signup', (req,res) => {

  db.selectUserByEmail(req.body , (err,result) => {
    if(err) res.send({err:err})
    if(result.length > 0){
      throw "user already exists"
    }})

  bcrypt.hash(req.body.password, 10 , (err,hash) => {
    if(err){
      console.log(err)
    }
    db.createUser(req.body,hash, (err,result) => {
      if(err) console.log(err)
      res.send(result)
    })
  });
})


app.post('/signin', (req,res) => {
  db.selectUserByEmail(req.body , (err,result) => {
    if(err) res.send({err:err})
    if(result.length > 0){
      bcrypt.compare(req.body.password ,result[0].password ,(err,response) => {
        if(err) res.send(err)
        if(response){
          const id = result[0].id
          const token =jwt.sign({id} , "jwtSecret" ,{
            expiresIn: 6000
          })
          res.json({ token , result })
        }else {
          res.send({message : "Login failed"})
        }
      })
    } else {
      res.send({message : "User doesn't exist"})
    }
  })
})


app.get('/api/homeProducts', (req,res) =>{
 db.homeProducts( function(err,result){
    if(err){
      res.send(err)
    } else {
      res.json(result)
    }
  })
})

app.post("/postBlog", (req, res) => {
  db.postItem([req.body.place, req.body.image, req.body.experience], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


///////Admin

app.get("/admin/data", (req, res) => {

  db.getDataAdmin(function (err, result) {
    if (err) {
      res.send(err)
    } else {
      res.json(result)
    }
  })
})

app.patch("/admin/patch/:id", (req, res) => {
  console.log(req.params.id)
  db.acceptPost(req.params.id, function (err, result) {
    if (err) {
      res.send(err)
    } else {
      res.status(201).send(result)
    }
  })
}
)

app.delete("/admin/delete/:id", (req, res) => {
  console.log(req.params.id)
  db.deletePost(req.params.id, function (err, result) {
    if (err) {
      res.send(err)
    } else {
      res.status(201).send(result)
    }
  })
}
)

  
  
