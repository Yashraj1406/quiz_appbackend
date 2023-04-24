//jshint esversion:6
const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const neo4j = require('neo4j-driver');

const app = express()
const port = 3000

//View Engine
app.set('views',path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

const uri = 'neo4j+s://a1276673.databases.neo4j.io';
const user = 'neo4j';
const password = 'Lz5EZgnAqMfUFKlxBNY8Ze0I_CfKmEaAFj0JC22TP6Q';
    
// To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session({ database: 'neo4j' });

var name = 1;

app.get('/', (req, res) => {
  let {questionText} = req.query;
  if (!questionText) {
    questionText = name;
  }
  session
    .run('MATCH (n:Question {Question_id: $titleParam}) RETURN n',{titleParam:questionText})
    .then(function(result){
      var question = {
        id:result.records[0]._fields[0].identity.low,
        title:result.records[0]._fields[0].properties.Question_title,
      }
      session
        .run('MATCH(:Question{Question_id: $titleParam})-[r]->() RETURN r',{titleParam:questionText})
        .then(function(results){
          var options = [];
          results.records.forEach(function(record){
            options.push(record._fields[0].properties.title)
          })
          if (req.headers.accept.includes('application/json')) {
            res.status(200).json({
              Question:question,
              opt:options
            });
          } else {
            res.render('index',{
              Question:question,
              opt:options
            });
          }  
          // session.close();
        })
        .catch(function(err){
          console.log(err)
        })
    })
    .catch(function(err){
      console.log(err)
    })
  })

// app.get('/ch', (req,res) => {

// })

app.post('/submit', (req, res) => {
  var title = req.body.text;
  // var year = req.body.year;
  // console.log(title);
  session
    .run('MATCH(n:Question)-[r {title: $titleParam}]->(m:Question) RETURN m',{titleParam:title})
    .then(function(result){
      const nextQuestion = result.records[0]._fields[0].properties.Question_id;
      if (req.headers.accept.includes('application/json')) {
        res.status(200).json({
          Question:nextQuestion,
        });
      } else {
        name =  nextQuestion;
        res.redirect('/')
      }
      // session.close();
    })
    .catch(function(err){
      console.log(err)
    })

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
