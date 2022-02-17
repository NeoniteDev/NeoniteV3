import * as express from 'express';
import verifyAuthorization from '../../middlewares/authorization';
import shearchService from './search-service';
import ipData from './ip-data';
import prm from './prm';
import assets from './assets';
import et2 from './ET2';


const app = express.Router();

app.use(express.json())
app.use(shearchService);
app.use(ipData);
app.use(assets);
app.use(prm);
app.use(et2);


module.exports = app;

