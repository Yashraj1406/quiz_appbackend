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

const uri = 'neo4j+s://7fe5fc5b.databases.neo4j.io';
const user = 'neo4j';
const password = 'bKGYRbvUvlxENnyeH6k4_6Y6bn1Qr1acIJlGBFKU0uk';
    
// To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session({ database: 'neo4j' });


app.get('/:category/:questionId/:optionId', (req, res) => {
  const category = req.params.category;
  const questionId = req.params.questionId;
  const optionId = req.params.optionId;
  var questions = 'questions_AC';
  var subQuestions = 'subquestions_AC';

  console.log(category + " " + optionId);

  if (category === "ns") {questions = 'questions_NS'; subQuestions = 'subquestions_NS';};
  if (category === "gc") {questions = 'questions_GC'; subQuestions = "NULL";};
  if (category === "lg") {questions = 'questions_LG'; subQuestions = "NULL";};

  const query = `MATCH (n:${questions} {questionId:${questionId}})-[r:\`${optionId}\`]->(m:${questions}) RETURN m`;
  const session = driver.session({ database: 'neo4j' }); // Create a new session
  session.run(query, { questions: questions,questionId: questionId, optionId: optionId })
  .then((result) => {
    if (result.records.length === 0) {
      // Handle case when no records are found
      res.status(404).json({
        error: "No records found",
      });
      return;
    }
    var question = {
      id: result.records[0]._fields[0].identity.low,
      questionNumber:result.records[0]._fields[0].properties.questionId.low,
      title: result.records[0]._fields[0].properties.questionTitle,
      optionA: result.records[0]._fields[0].properties.optionA,
      optionB: result.records[0]._fields[0].properties.optionB,
      optionC: result.records[0]._fields[0].properties.optionC,
      optionD: result.records[0]._fields[0].properties.optionD,
      optionE: result.records[0]._fields[0].properties.optionE,
      optionACsc: result.records[0]._fields[0].properties.optionACsc,
      optionBCsc: result.records[0]._fields[0].properties.optionBCsc,
      optionCCsc: result.records[0]._fields[0].properties.optionCCsc,
      optionDCsc: result.records[0]._fields[0].properties.optionDCsc,
      optionECsc: result.records[0]._fields[0].properties.optionECsc,
    };
    session.close()
    const session2 = driver.session({ database: 'neo4j' }); // Create a new session
    const subQuery = `MATCH (n:${subQuestions}) where n.questionNo=$questionId return n`
    session2.run(subQuery, { subQuestions: subQuestions,questionId:question.questionNumber })
    .then((result)=>{
      if(result.records.length === 0 ){
        if (req.headers.accept.includes('application/json')) {
          res.status(200).json({
            Question: question,
          }); 
        }else {
          res.render('index', {
            Question: question,
          });
        }
      } else {
        var subQuestionsArr =[];
        result.records.forEach((record) => {
          var subQuestion = {
            id: record._fields[0].identity.low,
            type: record._fields[0].properties.type,
            questionNumber:record._fields[0].properties.questionNo.low,
            title: record._fields[0].properties.questionTitle,
            optionA: record._fields[0].properties.optionA,
            optionB: record._fields[0].properties.optionB,
            optionC: record._fields[0].properties.optionC,
            optionD: record._fields[0].properties.optionD,
            optionE: record._fields[0].properties.optionE,
            optionACsc: record._fields[0].properties.optionACsc,
            optionBCsc: record._fields[0].properties.optionBCsc,
            optionCCsc: record._fields[0].properties.optionCCsc,
            optionDCsc: record._fields[0].properties.optionDCsc,
            optionECsc: record._fields[0].properties.optionECsc
          }
          subQuestionsArr.push(subQuestion);
        })
          // console.log(subQuestion);
          if (req.headers.accept.includes('application/json')) {
            res.status(200).json({
              Question: question,
              subQuestions:subQuestionsArr
            }); 
          }else {
            res.render('index', {
              Question: question,
              subQuestions:subQuestionsArr
            });
          }
      }    
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      session2.close(); // Close the session
    });
    // if (req.headers.accept.includes('application/json')) {
    //   res.status(200).json({
    //     Question: question,
    //   }); 
    // } else {
    //   res.render('index', {
    //     Question: question,
    //   });
    // }
  })
  .catch((err) => {
    console.log(err);
  })
  // .finally(() => {
  //   session.close(); // Close the session
  // });
    
});


app.get('/:category', (req,res) => {
  const category = req.params.category;
  var questions = 'questions_AC';
  var subQuestions = 'subquestions_AC';

  if (category === "ns") {questions = 'questions_NS'; subQuestions = 'subquestions_NS';};
  if (category === "gc") {questions = 'questions_GC'; subQuestions = "NULL";};
  if (category === "lg") {questions = 'questions_LG'; subQuestions = "NULL";};

  const questionId = 1;
  const query = `MATCH (n:${questions} {questionId: $questionId}) RETURN n`;

  const session = driver.session({ database: 'neo4j' }); // Create a new session

  session.run(query, { questions, questionId })
  .then((result) => {
    if (result.records.length === 0) {
      // Handle case when no records are found
      res.status(404).json({
        error: "No records found",
      });
      return;
    }
    var question = {
      id: result.records[0]._fields[0].identity.low,
      questionNumber:result.records[0]._fields[0].properties.questionId.low,
      title: result.records[0]._fields[0].properties.questionTitle,
      optionA: result.records[0]._fields[0].properties.optionA,
      optionB: result.records[0]._fields[0].properties.optionB,
      optionC: result.records[0]._fields[0].properties.optionC,
      optionD: result.records[0]._fields[0].properties.optionD,
      optionE: result.records[0]._fields[0].properties.optionE,
      optionACsc: result.records[0]._fields[0].properties.optionACsc,
      optionBCsc: result.records[0]._fields[0].properties.optionBCsc,
      optionCCsc: result.records[0]._fields[0].properties.optionCCsc,
      optionDCsc: result.records[0]._fields[0].properties.optionDCsc,
      optionECsc: result.records[0]._fields[0].properties.optionECsc,
    };
    session.close()
    const session2 = driver.session({ database: 'neo4j' }); // Create a new session
    const subQuery = `MATCH (n:${subQuestions}) where n.questionNo=$questionId return n`
    session2.run(subQuery, { subQuestions: subQuestions,questionId:questionId })
    .then((result)=>{
      if(result.records.length === 0 ){
        if (req.headers.accept.includes('application/json')) {
          res.status(200).json({
            Question: question,
          }); 
        }else {
          res.render('index', {
            Question: question,
          });
        }
      } else {
        var subQuestionsArr =[];
        result.records.forEach((record) => {
          var subQuestion = {
            id: record._fields[0].identity.low,
            type: record._fields[0].properties.type,
            questionNumber:record._fields[0].properties.questionNo.low,
            title: record._fields[0].properties.questionTitle,
            optionA: record._fields[0].properties.optionA,
            optionB: record._fields[0].properties.optionB,
            optionC: record._fields[0].properties.optionC,
            optionD: record._fields[0].properties.optionD,
            optionE: record._fields[0].properties.optionE,
            optionACsc: record._fields[0].properties.optionACsc,
            optionBCsc: record._fields[0].properties.optionBCsc,
            optionCCsc: record._fields[0].properties.optionCCsc,
            optionDCsc: record._fields[0].properties.optionDCsc,
            optionECsc: record._fields[0].properties.optionECsc
          }
          subQuestionsArr.push(subQuestion);
        })
          // console.log(subQuestion);
          if (req.headers.accept.includes('application/json')) {
            res.status(200).json({
              Question: question,
              subQuestions:subQuestionsArr
            }); 
          }else {
            res.render('index', {
              Question: question,
              subQuestions:subQuestionsArr
            });
          }
      }    
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      session2.close(); // Close the session
    });
  })
  .catch((err) => {
    console.log(err);
  });

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


// res.status(200).json({
//   response: "work in progress,will get back to you shortly",
// });


        // var subQuestionArr = {
        //   id: result.records[0]._fields[0].identity.low,
        //   questionNumber:result.records[0]._fields[0].properties.questionNo,

        //   title: result.records[0]._fields[0].properties.questionTitle,
        //   optionA: result.records[0]._fields[0].properties.optionA,
        //   optionB: result.records[0]._fields[0].properties.optionB,
        //   optionC: result.records[0]._fields[0].properties.optionC,
        //   optionD: result.records[0]._fields[0].properties.optionD,
        //   optionE: result.records[0]._fields[0].properties.optionE,
        //   optionACsc: result.records[0]._fields[0].properties.optionACsc,
        //   optionBCsc: result.records[0]._fields[0].properties.optionBCsc,
        //   optionCCsc: result.records[0]._fields[0].properties.optionCCsc,
        //   optionDCsc: result.records[0]._fields[0].properties.optionDCsc,
        //   optionECsc: result.records[0]._fields[0].properties.optionECsc
        // }


  // let {questionText} = req.query;
  // if (!questionText) {
  //   questionText = name;
  // }


// session
// .run('MATCH(:Question{Question_id: $titleParam})-[r]->() RETURN r',{titleParam:questionText})
// .then(function(results){
//   var options = [];
//   results.records.forEach(function(record){
//     options.push(record._fields[0].properties.title)
//   })
//   if (req.headers.accept.includes('application/json')) {
//     res.status(200).json({
//       Question:question,
//       opt:options
//     });
//   } else {
//     res.render('index',{
//       Question:question,
//       opt:options
//     });
//   }  
//   // session.close();
// })
// .catch(function(err){
//   console.log(err)
// })


// app.post('/submit', (req, res) => {
//   var title = req.body.text;
//   // var year = req.body.year;
//   // console.log(title);
//   session
//     .run('MATCH(n:question)-[r {title: $titleParam}]->(m:Question) RETURN m',{titleParam:title})
//     .then(function(result){
//       const nextQuestion = result.records[0]._fields[0].properties.Question_id;
//       if (req.headers.accept.includes('application/json')) {
//         res.status(200).json({
//           Question:nextQuestion,
//         });
//       } else {
//         res.redirect('/')
//       }
//       // session.close();
//     })
//     .catch(function(err){
//       console.log(err)
//     })

// });
