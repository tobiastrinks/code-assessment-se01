const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const accessMiddleware = require('./src/middleware/access');

app.use(accessMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// application routes
app.use('/', require('./src/routes'));

module.exports = app.listen(3000);
