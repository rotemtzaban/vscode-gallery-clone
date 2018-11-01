// declare namespace BunyanLogstashTcp {

//     function createStream(options: Options): Stream;
// }
declare module 'bunyan-logstash-tcp' {
    import { Stream, LogLevel, LogLevelString } from 'bunyan';
    interface Options {
        level?: LogLevelString;
        server: string;
        host: string;
        port: number;
        application?: string;
        pid?: string;
        tags?: string[];
    }

    interface BunyanLogstashTcp{
        createStream(options: Options): Stream;
    }
    const bunyanLogstashTcp:BunyanLogstashTcp;
    export default bunyanLogstashTcp;
}
// export default BunyanLogstashTcp;
