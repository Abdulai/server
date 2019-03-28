const express = require('express')
const _ = require('lodash')
const bodyParser = require('body-parser')
let app = express()
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const uuidv1 = require('uuid/v1')

let db = new sqlite3.Database('./db/server.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the server database.');
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))
app.use('/images', express.static('image'))

app.post('/register', (req, res) => {
	var body = _.pick(req.body, ['user', 'password'])

	db.serialize(() => {
		var stmt = db.prepare("INSERT INTO Admin_Table VALUES (?, ?, ?)")
		stmt.run(null,body.user, body.password)
		stmt.finalize()

		res.send('OK')
	})
})

app.post('/login', (req, res) => {
	var body = _.pick(req.body, ['user', 'password'])

	db.serialize(() => {
		db.get("SELECT * FROM Admin_Table WHERE email = ? AND password = ?", [body.user, body.password], (err, row) => {
		    if (row) {
				res.send(row)
		    }else{
		    	res.json({error: 'Invalid user!'})
		    }
		});
	})
})

app.post('/register-customer', (req, res) => {
	var body = _.pick(req.body, ['fName', 'lName', 'dob', 'bName', 'hName', 'bAddress', 'phone', 'email', 'image'])

	var base64Data = body.image;
	body.image = uuidv1()+'.png';

	require("fs").writeFile(`image/${body.image}`, base64Data, 'base64', function(err, img) {
	  console.log(err);
	});

	var stmt = db.prepare("INSERT INTO Customer VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	stmt.run(null,body.fName,body.image, body.lName, body.dob, body.bName, body.hName, body.bAddress, body.phone, body.email)
	stmt.finalize()

	res.send('OK')
})


app.get('/all-customer', (req, res) => {
	db.all("SELECT * FROM Customer", (err, rows) => {
	    res.send(rows)
	});
})


app.listen(3000, () => {
	console.log('Server running on port 3000')
})
