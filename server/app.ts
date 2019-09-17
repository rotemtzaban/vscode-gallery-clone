import Koa from 'koa';
import Router from 'koa-router';
import Contoller from './controllers/apiController';
import bodyParser from 'koa-bodyparser';
import multer from 'koa-multer';
import DalService from './services/DalService';
import StorageService from './services/StorageService';
import { ZipService } from './services/IZipService';
import koaStatic from 'koa-static';
import settings from './settings';
import logger from './logger';
import mount from 'koa-mount';
logger.info(settings);

DalService.create(settings).then(dalService => {
    const apiController = new Contoller(
        dalService,
        new StorageService(settings),
        new ZipService()
    );

    const app = new Koa();
    app.proxy = true;
    const router = new Router({ prefix: '/api' });

    router.use(bodyParser());
    app.use(router.routes());
    router.get('/isalive', (ctx) => {ctx.body = true});
    router.get(
        '/publishers/:publisher/vsextensions/:name/:version/vspackage',
        apiController.downloadPackage
    );

    router.get(
        '/publishers/:publisher/vsextensions/:name/:version/vspackage/:asset',
        apiController.downloadAsset
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

    const swaggerApp = new Koa();
    swaggerApp.use(koaStatic('swagger-ui-dist'))
    swaggerApp.use(koaStatic('api'));
    app.use(mount('/swagger', swaggerApp));
   
    app.listen(settings.port);
});
