import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Router } from 'express';
const inspect = require('eyes').inspector();

import api from './api';

var app = express();
app.server = http.createServer(app);

// 3rd party middleware
//app.use(cors());
app.use(bodyParser.json());
app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.use(Router());

app.use('/api', api());

app.server.listen(process.env.PORT || 3000);

inspect(app.server.address().port, 'api running on port');

export default app;
