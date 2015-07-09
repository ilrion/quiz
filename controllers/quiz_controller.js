var models = require('../models/models.js');

// Autoload - PARAM Se carga lo primero si llega el parametro quizId

exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId).then(
    function(quiz) {
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
    var search_like = '%' + req.query.search.replace(' ','%') + '%';

    console.log('Dentro de index con search_like: ' +  search_like);

    models.Quiz.findAll({where: ["pregunta like ?", search_like],
       order: [['pregunta','ASC']] })
    .then(function(quizes) {
        res.render('quizes/index', {quizes: quizes});
    }) 
  } 
  else {
    models.Quiz.findAll().then(function(quizes) {
        res.render('quizes/index', {quizes: quizes});
    }) 
  } 
};

// GET /quizes/:id

exports.show = function(req, res) {
  res.render('quizes/show', {quiz: req.quiz});
};

// GET /quizes/:id/answer

exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta){
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado});
};

