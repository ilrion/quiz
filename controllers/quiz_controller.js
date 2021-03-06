var models = require('../models/models.js');

// Autoload - PARAM Se carga lo primero si llega el parametro quizId

exports.load = function(req, res, next, quizId) {
  //models.Quiz.findById({
  models.Quiz.find({
    where: {
      id: Number(quizId)
    },
    include: [{
      model: models.Comment
    }]
  }).then(function(quiz) {
      if (quiz) {
        req.quiz=quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes/

exports.index = function(req, res) {
  if (req.query.search) {
    var search_like = '%' + req.query.search.replace('/[ ]+/g','%') + '%';

    console.log('Dentro de index con search_like: ' +  search_like);

    models.Quiz.findAll({where: ["pregunta like ?", search_like],
       order: [['pregunta','ASC']] })
    .then(function(quizes) {
        res.render('quizes/index', {quizes: quizes, errors: []});
    }) 
  } 
  else if (req.query.search_tema) {
    models.Quiz.findAll({where: {tema: req.query.search_tema},
       order: [['pregunta','ASC']] })
    .then(function(quizes) {
        res.render('quizes/index', {quizes: quizes, errors: []});
    }) 
  } 
  else {
    models.Quiz.findAll().then(function(quizes) {
        res.render('quizes/index', {quizes: quizes, errors: []});
    }) 
  } 
};

// GET /quizes/:id

exports.show = function(req, res) {
  res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer

exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta){
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer',
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', { quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz.validate().then(function(err){
    if (err) {
      res.render('quizes/new', {quiz: quiz, errors: err.errors});
    } else {
      // guarda en DB los campos pregunta y respuesta de quiz
      quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function(){
        res.redirect('/quizes');  
      });   // res.redirect: Redirección HTTP a lista de preguntas
    }
  }).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

// GET /quizes/statistics

exports.statistics = function(req, res) {

  var statistics = {totalQuizes:0,
                    totalComments:0,
                    avgCommentsQuiz:0,
                    numQuizesSinComments:0,
                    numQuizesConComments:0};

  models.sequelize.query(
     'SELECT (SELECT COUNT(1) FROM "Quizzes") AS totalquizes, '
    +'      (SELECT COUNT(1) FROM "Comments") AS totalcomments,'
    +'      (SELECT COUNT(1) FROM "Quizzes" '
    +'        WHERE Id IN (SELECT "QuizId" FROM "Comments")) '
    +'              AS numquizesconcomments,'
    +'      (SELECT COUNT(1) FROM "Quizzes" '
    +'        WHERE Id NOT IN (SELECT "QuizId" FROM "Comments")) '
    +'              AS numquizessincomments',
    {type: models.sequelize.QueryTypes.SELECT}).then(function(estadisticas) {
      console.log(estadisticas);
      statistics.totalQuizes = estadisticas[0].totalquizes;
      statistics.totalComments = estadisticas[0].totalcomments;
      statistics.avgCommentsQuiz = 
                 (statistics.totalComments/statistics.totalQuizes).toFixed(2);
      statistics.numQuizesSinComments = estadisticas[0].numquizessincomments;
      statistics.numQuizesConComments = estadisticas[0].numquizesconcomments;
      console.log(statistics);
      res.render('quizes/statistics', {statistics: statistics, errors: []});
    })
};

//  console.log("req.quiz.id: " + req.quiz.id);
