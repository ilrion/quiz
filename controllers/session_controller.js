// MW de autorización de accesos HTTP restringidos
exports.autoLogout = function(req, res, next){
  var accesoActual = new Date(); 
  console.log("accesoAnterior: " + req.session.accesoAnterior);
  console.log("accesoAnterior.getTime(): " + Date.parse(req.session.accesoAnterior));
  console.log("accesoActual: " + accesoActual);
  console.log("accesoActual.getTime(): " + accesoActual.getTime());

  console.log("Diferencia de milisegundos: " + (accesoActual.getTime() -
       Date.parse(req.session.accesoAnterior)));

  if ((req.session.accesoAnterior) &&
      (req.session.user) &&
      (accesoActual.getTime() - 
       Date.parse(req.session.accesoAnterior) > 60000))
  {
    console.log("LOGOUT");
    delete req.session.accesoAnterior; 
    res.redirect('/logout');
  }
  else {
    req.session.accesoAnterior = accesoActual;
    console.log("accesoAnteriorActualizado: " + req.session.accesoAnterior);
    next();
  }
};

// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next){
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Get /login   -- Formulario de login
exports.new = function(req, res) {
  var errors = req.session.errors || {};
  req.session.errors = {};

  res.render('sessions/new', {errors: errors});
};

// POST /login   -- Crear la sesion si usuario se autentica
exports.create = function(req, res) {

  var login     = req.body.login;
  var password  = req.body.password;

  var userController = require('./user_controller');
  userController.autenticar(login, password, function(error, user) {

    if (error) {  // si hay error retornamos mensajes de error de sesión
      req.session.errors = [{"message": 'Se ha producido un error: '+error}];
      res.redirect("/login");        
      return;
    }

    // Crear req.session.user y guardar campos   id  y  username
    // La sesión se define por la existencia de:    req.session.user
    req.session.user = {id:user.id, username:user.username};

    // redirección a path anterior a login
    res.redirect(req.session.redir.toString());
  });
};

// DELETE /logout   -- Destruir sesion 
exports.destroy = function(req, res) {
    delete req.session.user;
    // redirect a path anterior a login
    res.redirect(req.session.redir.toString());
}; 

