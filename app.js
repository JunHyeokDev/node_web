const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config(); // 환경 변수 설정: .env 파일에 정의된 변수들을 process.env에 추가합니다.

const pageRouter = require('./routes/page');

const app = express();

// 환경변수 포트값 쓰되, 안되면 8001
app.set('port', process.env.PORT || 8001);
// view engine을 html로 설정.
app.set('view engine', 'html');

// views 폴더
nunjucks.configure('views', {
    express: app, // express랑 연동
    watch: true, // 자동 컴파일
  });

// HTTP 요청에 대해 로그를 남김. 매우 유용
app.use(morgan('dev'));
// public 폴더에서 정적파일을 제공하겠음.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Json parsing 미들웨어 추가
app.use(express.json());

// url 디코드 설정, false는 간단한 객체만 쓴다는 뜻
app.use(express.urlencoded({ extended: false }));
// 쿠키및 세션 설정
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use('/', pageRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});