const express = require('express');
const cors = require('cors');
const path = require('path')
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const fileUpload = require('express-fileupload');
const logger = require('pino')();
const morgan = require('morgan');
const {
  SanitizeMongoData,
  RemoveHTMLTags
} = require('./middlewares/dataSantizationMiddleware');
const AppError = require('./util/appError');
const errorController = require('./controller/errorController');
const Main = require('./routes/main');
const Test = require('./routes/test');
const User = require('./routes/user');
const Auth = require('./routes/auth');
const Download = require('./routes/download');
const Upload = require('./routes/upload');
const Dash = require('./routes/dash');
const limiter = require('./middlewares/rateLimiter');

/*
    Initializing express server
*/
// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require('dotenv').config();
  
    // require("dotenv").config({ path: "server/config/.env" });
  }
const app = express();
// app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://DashFile.pages.dev/'],
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(limiter);
app.use('/uploads', express.static('uploads'));
// app.use(express.static(path.join(__dirname, "./uploads/")));

// Data sanitisation against NOSQL query injection and XSS

app.use(SanitizeMongoData); // ->check out the req.body, req.param , req.query and remove the $ and .
app.use(RemoveHTMLTags); // -> remove the html tags from the input data

/*
    Connection to the MongoDB instance. Currently access is available to everyone for development.
*/

const dburl = process.env.MONGODB_URI;
mongoose
  .connect(dburl)
  .then(() => {
    logger.info('Connected to DashFileDB');
  })
  .catch((err) => {
    logger.error(err);
  });

const PORT = process.env.PORT || 8080;

// app.use('/', Main);
app.use('/test', Test);
app.use('/api/upload', Upload);
app.use('/api/download', Download);
app.use('/api/dash', Dash);
app.use(User);
app.use(Auth);
// Config

// app.use('*', (req, res, next) => {
//   next(new AppError('could not find that route', 404));
// });

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build/index.html"));
});


// Global error handler
app.use(errorController);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
