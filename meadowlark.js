const express = require('express');
const fortune = require('./lib/fortune.js');

const app = express();

// Установка механизма представления handlebars
const handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// ПО statik
app.use(express.static(__dirname + '/public'));

// два маршрута
app.get('/', function(req, res){
  res.render('home');
});
app.get('/about', function(req, res){
  res.render('about', { fortune: fortune.getFortune() });
});

// Обобщенный обработчик 404 (промежуточное ПО)
app.use(function(req, res, next){
  res.status(404);
  res.render('404');
});

// Обработчик ошибки 500 (промежуточное ПО)
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});
app.listen(app.get('port'), function(){

  console.log('Express is run on http://localhost:' + app.get('port') + '; press control + C to finish.');
});
