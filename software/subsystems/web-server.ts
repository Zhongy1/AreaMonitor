import fastify, { FastifyInstance } from 'fastify';
import formBody from 'fastify-formbody';
import { SIOService } from '../services/sio-service';
import { WebApp } from '../services/web-app';
import { networkInterfaces } from 'os';

export interface WebServerConfig {
    port: number;
    mode: Mode;
    camIP: string[];
    ssid?: string;
    passwd?: string;
    targetIP?: string;
}

export enum Mode {
    Master, Client, Unspecified
}

export class WebServer {
    private app: FastifyInstance;
    private sioService: SIOService;

    private webapp: WebApp;

    private mode: Mode;

    constructor(private config: WebServerConfig) {
        this.mode = Mode.Unspecified;
        this.configureMode(config.mode);

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
        this.sioService.registerIO();

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

        this.app.ready().then(() => {
            this.sioService.initIO();
        });
    }

    private async setupMiddleware(): Promise<void> {
        this.app.register(formBody);
    }

    private initializePassport(): void {

    }

    public handleConfigChange(config: Partial<WebServerConfig>): void {
        if (config.hasOwnProperty('ssid') && config.hasOwnProperty('passwd')) {
            this.configureWAP(config.ssid, config.passwd);
        }
        if (config.hasOwnProperty('master') && config.mode as unknown == 'T') {
            this.configureMode(Mode.Master);
        }
        if (config.hasOwnProperty('camIP') && config.targetIP) {
            this.config.targetIP = config.targetIP;
            this.configureMode(Mode.Client);
        }
        else {
            this.configureMode(Mode.Unspecified);
        }
    }

    public handleCameraConnections(opts?: unknown): void {
        // ?
    }

    private configureMode(mode: Mode): void {
        // console.log('Mode: ' + Mode[mode]);
        if (this.mode == Mode.Unspecified) {

        }
        else if (this.mode == Mode.Master) {

        }
        else if (this.mode == Mode.Client) {

        }
    }

    private configureWAP(ssid: string, passwd: string): void {
        this.config.ssid = ssid;
        this.config.passwd = passwd;
        // console.log('SSID: ' + ssid);
    }
}

function getPublicIPs(): string[] {
    const nets = networkInterfaces();
    const results: string[] = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }

    return results;
}

function main(): void {
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

    let config: WebServerConfig = {
        port: port,
        mode: Mode.Unspecified,
        camIP: getPublicIPs()
    }
    let webserver = new WebServer(config);

    WebServer.log('Web Server Spawned');

}

main();

