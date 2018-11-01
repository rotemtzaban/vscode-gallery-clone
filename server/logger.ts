import bunyan from 'bunyan';

const logger = bunyan.createLogger({
    name: 'logger',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            type: 'rotating-file',
            path: './log/galleryClone.log',
            period: '1d',
            count: 4
        }
    ]
});

export default logger;
