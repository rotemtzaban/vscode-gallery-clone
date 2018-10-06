import Koa from 'koa';
import Router from 'koa-router';
import Contoller from './controllers/apiController';
import bodyParser from 'koa-bodyparser';
import multer from 'koa-multer';
import DalService from './services/DalService';
import StorageService from './services/StorageService';
import { ZipService } from './services/IZipService';
import mount from 'koa-mount';
import koaStatic from 'koa-static';

const apiController = new Contoller(
    new DalService(),
    new StorageService(),
    new ZipService()
);
const app = new Koa();
const router = new Router({ prefix: '/api' });

router.use(bodyParser());
app.use(router.routes());

router.get(
    '/publishers/:publisher/vsextensions/:name/:version/vspackage',
    apiController.downloadPackage
);

router.get(
    '/publishers/:publisher/extensions/:name/:version/stats',
    apiController.reportStatistic
);

router.post('/extensionQuery', apiController.query);

router.post(
    '/extensionUpload',
    multer({ storage: multer.memoryStorage() }).single('extension'),
    apiController.upload
);

// router.get('/client', koaStatic('public'));
// router.get(/^\/client.*/, koaStatic('public'));
app.use(mount('/client', koaStatic('public')));
// mount('client')
app.listen(3000);
