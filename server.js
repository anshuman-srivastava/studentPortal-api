const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex ({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    //Enter the password which you entered during postgres installation
    password : '',
    //Whatever the database name be, replace it with 'spdb'
    database : 'spdb'
  }
});

const app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/',(req,res)=>{
	res.send(database.users);
})
 
 //SIGN IN
app.post('/Login', (req,res) => {
	db.select('email', 'hash', 'rollno').from('login')
	  .where('email', '=', req.body.email)
	  .then(data => {
	  	 const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
	  	  	 if(isValid) {
	  	 	return db.select('*').from('users')
	  	 	.where('email','=',req.body.email)
	  	 	.then(user => {
	  	 		res.json(user[0])
	  	 	})
	  	 	.catch(err => res.status(400).json('unable to get user'))
	  	 } else {
	  	 	res.status(400).json('wrong credentials')
	  	 }
	  })
	  .catch(err => res.status(400).json('wrong credentials'))
})

//REGISTER
 app.post('/Register', (req,res)=>{
 	const {fname, lname, rollno, section, password, email, role } = req.body;
 	const hash = bcrypt.hashSync(password);
 	db.transaction(trx => {
 		trx.insert({
 			hash: hash,
 			email: email,
 			rollno: rollno
 		})
 		.into('login')
 		.returning('email')
 		.then(loginEmail => { 
          return trx('users')
            .returning('*')
 	        .insert({
 	        	fname: fname,
 	        	lname: lname,
 	        	rollno: rollno,
 	         	section: section,
 	           	email: loginEmail[0],
 	        	joined: new Date(),
 	        	role: role
 	  })
 	  .then(user => {   
 	     res.json(user[0]);
           })
 		})
 		.then(trx.commit)
 		.then(trx.rollback)
 	})
 	 .catch(err => res.status(400).json('unable to register'))
      
  })
	//User profile
app.get('/profile/:rollno',(req,res)=>{
	const{ rollno } = req.params;
	db.select('*').from('users').where({rollno})
	.then(user => {
	  if(user.length) {
	  	res.json(user[0])
	  } else {
	  	res.status(400).json('Not found')
	  }
	})	
	.catch(err => res.status(400).json('error getting user'))
})

app.listen(4000,()=>{
	console.log('app is running on port 4000');
}) 