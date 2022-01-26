console.log('Web Server Spawned');
import fastify, { FastifyInstance } from 'fastify';
import { WebApp } from '../services/web-app';


export interface WebServerConfig {
    port: number;
}

export class WebServer {
    private app: FastifyInstance;

    private webapp: WebApp;

    constructor(private config: WebServerConfig) {
        this.app = fastify({
            // logger: true,
            logger: {
                prettyPrint: true
            },
            ignoreTrailingSlash: true,
        });

        this.webapp = new WebApp(this.app, config);

        this.initialize();
    }

    public static log(str: string) {
        console.log(`[Web Server] ${str}`);
    }

    private async initialize(): Promise<void> {
        await this.setupMiddleware();

        this.webapp.initApp();

        this.app.listen(this.config.port, '0.0.0.0', err => {
            if (err) {
                throw err;
            }
            console.log('\x1b[1m\x1b[34m-----------------------------------\x1b[0m');
            console.group();
            console.log(`Web server is running on \x1b[1m\x1b[35m*:${this.config.port}\x1b[0m`);
            console.group();
            console.log(`Node Version: \x1b[1m\x1b[33m${process.version}\x1b[0m`);
            // console.log(`Environment:   \x1b[1m\x1b[36m${config.dev ? 'Development' : 'Production'}\x1b[0m`);
            // console.log(`App component: \x1b[1m${config.useApp ? '\x1b[32mEnabled' : '\x1b[31mDisabled'}\x1b[0m`);
            // console.log(`Api component: \x1b[1m${config.useApi ? '\x1b[32mEnabled' : '\x1b[31mDisabled'}\x1b[0m`);
            console.groupEnd();
            console.groupEnd();
            console.log('\x1b[1m\x1b[34m-----------------------------------\x1b[0m');
        });
    }

    private async setupMiddleware(): Promise<void> {

    }

    private initializePassport(): void {

    }
}

function main() {
    let port = null;
    if (process.argv.includes('-p')) {
        let tempPort: number = Number(process.argv[process.argv.indexOf('-p') + 1]);
        if (!isNaN(tempPort)) {
            port = tempPort;
        }
    }
    if (port == null) {
        throw 'Bad port';
    }

    let webserver = new WebServer({
        port: port
    });

}

main();

