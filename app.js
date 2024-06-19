// app.js
"use strict";

/**
 * =====================================================================
 * Define Express app and set it up
 * =====================================================================
 */

// modules
const express = require("express"), // express를 요청
  layouts = require("express-ejs-layouts"), // express-ejs-layout의 요청
  app = express(); // express 애플리케이션의 인스턴스화

// controllers 폴더의 파일을 요청
const pagesController = require("./controllers/pagesController"),
  usersController = require("./controllers/usersController"),
  discussionsController = require("./controllers/discussionsController"),
  commentsController = require("./controllers/commentsController"),
  errorController = require("./controllers/errorController");

const router = express.Router(); // Express 라우터를 인스턴스화
app.use("/", router); // 라우터를 애플리케이션에 추가

const methodOverride = require("method-override"); // method-override 미들웨어를 요청
router.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
); // method-override 미들웨어를 사용

/**
 * =====================================================================
 * Flash Messages and Session
 * =====================================================================
 */
const expressSession = require("express-session"),
  cookieParser = require("cookie-parser"),
  connectFlash = require("connect-flash"),
  expressValidator = require("express-validator"); // Lesson 23 - express-validator 미들웨어를 요청

router.use(cookieParser("secret_passcode")); // cookie-parser 미들웨어를 사용하고 비밀 키를 전달
router.use(
  expressSession({
    secret: "secret_passcode", // 비밀 키를 전달
    cookie: {
      maxAge: 4000000, // 쿠키의 유효 기간을 설정
    },
    resave: false, // 세션을 매번 재저장하지 않도록 설정
    saveUninitialized: false, // 초기화되지 않은 세션을 저장하지 않도록 설정
  })
);
router.use(connectFlash()); // connect-flash 미들웨어를 사용

/**
 * =====================================================================
 * Passport Configuration and Middleware
 * =====================================================================
 */
const passport = require("passport"); // passport를 요청
router.use(passport.initialize()); // passport를 초기화
router.use(passport.session()); // passport가 Express.js 내 세션을 사용하도록 설정

const User = require("./models/User"); // User 모델을 요청
passport.use(User.createStrategy()); // User 모델의 인증 전략을 passport에 전달
passport.serializeUser(User.serializeUser()); // User 모델의 직렬화 메서드를 passport에 전달
passport.deserializeUser(User.deserializeUser()); // User 모델의 역직렬화 메서드를 passport에 전달

router.use((req, res, next) => {
  res.locals.flashMessages = req.flash(); // flash 메시지를 뷰에서 사용할 수 있도록 설정
  res.locals.loggedIn = req.isAuthenticated(); // 로그인 여부를 확인하는 불리언 값을 로컬 변수에 추가
  res.locals.currentUser = req.user; // 현재 사용자를 로컬 변수에 추가
  next();
});

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://choys:JapurFJhWUDgdWXZ@bbyeodagung.erqm11u.mongodb.net/?retryWrites=true&w=majority&appName=BByeoDaGung"
);
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MONGODB!!!");
});

/**
 * =====================================================================
 * Define app settings and middleware
 * =====================================================================
 */

app.set("port", process.env.PORT || 3000);

// ejs 레이아웃 렌더링
app.set("view engine", "ejs"); // ejs를 사용하기 위한 애플리케이션 세팅
router.use(layouts); // layout 모듈 사용을 위한 애플리케이션 세팅
router.use(express.static("public"));

// body-parser의 추가
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// express-validator의 추가
router.use(expressValidator());

/**
 * =====================================================================
 * Define routes
 * =====================================================================
 */

/**
 * Pages
 */
router.get("/", pagesController.showHome); // 홈 페이지 위한 라우트 추가
router.get("/about", pagesController.showAbout); // 코스 페이지 위한 라우트 추가

/**
 * Login/Logout
 */
router.get("/users/login", usersController.login); // 로그인 폼을 보기 위한 요청 처리
router.post(
  "/users/login",
  usersController.validate,
  usersController.authenticate,
  usersController.redirectView
); // 로그인 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get(
  "/users/logout",
  usersController.logout,
  usersController.redirectView
); // 로그아웃을 위한 라우트 추가

/**
 * Users
 */
router.get("/users", usersController.index, usersController.indexView); // index 라우트 생성
router.get("/users/new", usersController.new); // 생성 폼을 보기 위한 요청 처리
router.post(
  "/users/create",
  usersController.validate,
  usersController.create,
  usersController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get("/users/:id", usersController.show, usersController.showView);
router.get("/users/:id/edit", usersController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/users/:id/update",
  usersController.update,
  usersController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/users/:id/delete",
  usersController.delete,
  usersController.redirectView
);

/**
 * Discussions 라우트 추가
 */
router.get("/discussions", discussionsController.index, discussionsController.indexView);
router.get("/discussions/new", discussionsController.new);
router.post(
  "/discussions/create",
  discussionsController.create,
  discussionsController.redirectView
);
router.get("/discussions/:id", discussionsController.show, discussionsController.showView);
router.get("/discussions/:id/edit", discussionsController.edit);
router.put(
  "/discussions/:id/update",
  discussionsController.update,
  discussionsController.redirectView
);
router.delete(
  "/discussions/:id/delete",
  discussionsController.delete,
  discussionsController.redirectView
);

/**
 * Comments
 */
router.post(
  "/comments/create",
  commentsController.create,
  commentsController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get(
  "/comments/:id",
  commentsController.show,
  commentsController.showView
);
router.delete(
  "/comments/:id/delete",
  commentsController.delete,
  commentsController.redirectView
);

/**
 * =====================================================================
 * Errors Handling & App Startup
 * =====================================================================
 */
app.use(errorController.resNotFound); // 미들웨어 함수로 에러 처리 추가
app.use(errorController.resInternalError);

app.listen(app.get("port"), () => {
  // 3000번 포트로 리스닝 설정
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
