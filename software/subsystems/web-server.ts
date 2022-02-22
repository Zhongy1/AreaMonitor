import fastify, { FastifyInstance } from 'fastify';
import { SIOService } from '../services/sio-service';
import { WebApp } from '../services/web-app';


export interface WebServerConfig {
    port: number;
    master: boolean;
}

export class WebServer {
    private app: FastifyInstance;

    private sioService: SIOService;

    private webapp: WebApp;

    constructor(private config: WebServerConfig) {
        this.app = fastify({
            // logger: true,
            logger: {
                prettyPrint: true
            },
            ignoreTrailingSlash: true,
        });

        this.sioService = new SIOService(this.app, config);
        this.webapp = new WebApp(this.app, this.sioService, config);

        this.initialize();
    }

    public static log(str: string) {
        console.log(`[Web Server] ${str}`);
    }

    private async initialize(): Promise<void> {
        await this.setupMiddleware();

        this.webapp.initApp();
        this.sioService.initIO()

        this.app.listen(this.config.port, '0.0.0.0', err => {
            if (err) {
                throw err;
            }
            console.log(
                '\x1b[1m\x1b[34m-----------------------------------\x1b[0m\n' +
                `  Web server is running on \x1b[1m\x1b[35m*:${this.config.port}\x1b[0m\n` +
                `    Node Version: \x1b[1m\x1b[33m${process.version}\x1b[0m\n` +
                '\x1b[1m\x1b[34m-----------------------------------\x1b[0m'
            );
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

    console.log('Web Server Spawned');

    let webserver = new WebServer({
        port: port,
        master: true
    });

}

main();

