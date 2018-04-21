var express = require('express');
var fortune = require('./lib/fortune.js');

var app = express();

// Установка механизма представления handlebars
var handlebars = require('express-handlebars').create({
  //extname: '.hbs', // если не нравится длинное расширение .handlebars можно создавать файлы с таким расширением .hbs, добавав extname
  defaultLayout:'main',
  helpers: {
    section: function(name, options){
      if(!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// ПО static
app.use(express.static(__dirname + '/public'));

// Промежуточное ПО для распознования ?test=1 в строке запроса
app.use(function(req, res, next){
  res.locals.showTest = app.get('env') !== 'production' && req.query.test === '1';
  next();
});

// Фиктивные данные о погоде
function getWeatherData(){
  return {
    locations: [
      {
        name: 'Портланд',
        forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
        iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
        weather: 'Сплошная облачность',
        temp: '54.1 F (12.3 C)',
      },
      {
        name: 'Бенд',
        forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
        iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
        weather: 'Малооблачно',
        temp: '55.0 F (12.8 C)',
      },
      {
        name: 'Манзанита',
        forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
        iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
        weather: 'Небольшой дождь',
        temp: '55.0 F (12.8 C)',
      },
    ],
  };
}
// Промежуточное ПО для внедрения этих данных в объект
app.use(function(req, res, next){
  if(!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weatherContext = getWeatherData();
  next();
});


// Здесь находятся Маршруты
app.get('/', function(req, res) {
  res.render('home');
});
app.get('/about', function(req,res){
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
  } );
});
app.get('/tours/hood-river', function(req, res){
  res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req, res){
  res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req, res){
  res.render('tours/request-group-rate');
});
app.get('/jquery-test', function(req, res){
  res.render('jquery-test');
});
app.get('/nursery-rhyme', function(req, res){
  res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res){
  res.json({
    animal: 'бельчонок',
    bodyPart: 'хвост',
    adjective: 'пушистый',
    noun: 'черт',
  });
});

// заголовок запроса, какую информацию отправляет браузер /headers  в строке запроса
app.get('/headers', function(req, res){
  res.set('Content-Type', 'text/plain');
  var s = '';
  for(var name in req.headers)
    s += name + ': ' + req.headers[name] + '\n';
  res.send(s);
});
// отключить заголовок Express по умолчанию X-Powered-By
//app.disable('x-powered-by');

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
