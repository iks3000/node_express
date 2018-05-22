var express = require('express'),
    fortune = require('./lib/fortune.js'),
    formidable = require('formidable'),
    jqupload = require('jquery-file-upload-middleware');

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
  },
  //partialsDir: __dirname + '/views/partials/'  // добавить footer.handlebars в partials
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// ПО static
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true}));

// Промежуточное ПО для распознования ?test=1 в строке запроса
app.use(function(req, res, next){
  res.locals.showTest = app.get('env') !== 'production' && req.query.test === '1';
  next();
});

// jQuery File Upload промежуточное ПО
app.use('/upload', function(req, res, next){
  var now = Date.now();
  jqupload.fileHandler({
    uploadDir: function(){
      return __dirname + '/public/uploads/' + now;
    },
    uploadUrl: function(){
      return '/uploads/' + now;
    },
    // Превьюхи изображений
    // imageVersions: {
    //   thumbnail: {
    //     width: 80,
    //     height: 80
    //   }
    // }
  })(req, res, next);
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
app.get('/newsletter', function(req, res){
  res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.get('/thank-you', function(req, res){
  res.render('thank-you');
});

//Subscribe AJAX
app.post('/process', function(req, res){
  if(req.xhr || req.accepts('json.html') === 'json'){
    //если здесь есть ошибка, то мы должны отправить { error: 'описание ошибки' }
    res.send({success: true});
  } else {
    //если бы была ошибка, нам нужно было бы перенаправлять на страницу ошибки
    res.redirect(303, '/thank-you');
  }
});

//Загрузка файлов на сервер
app.get('/contest/vacation-photo', function(req, res){
  var now = new Date();
  res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() });
});
app.post('/contest/vacation-photo/:year/:month', function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    if(err) return res.redirect(303, '/error');
    console.log('received fields:');
    console.log(fields);
    console.log('received files:');
    console.log(files);
    res.redirect(303, '/thank-you');
  });
});


// Генерация детского стишка из ajax
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
