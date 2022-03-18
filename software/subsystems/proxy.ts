import fastify, { FastifyInstance } from 'fastify';
import fproxy from 'fastify-http-proxy';

export interface ProxyTarget {
    id: string;
    ip: string;
}

export interface ProxyServerConfig {
    port: number;
    targets: ProxyTarget[];
}

export class Proxy {
    private app: FastifyInstance

    constructor(config: ProxyServerConfig) {
        this.app = fastify({
            ignoreTrailingSlash: true,
        });

        for (let i = 0; i < config.targets.length; i++) {
            this.registerTarget(config.targets[i]);
        }

        this.app.listen(config.port, '0.0.0.0', err => {
            if (err) {
                throw err;
            }

            console.log('Reverse Proxy Ready');
        });
    }

    private registerTarget(target: ProxyTarget): void {
        this.app.register(fproxy, {
            upstream: `http://${target.ip}`,
            prefix: `/proxy/${target.id}`,
            rewritePrefix: `/`,
            websocket: true
        });
    }

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

    let targets: ProxyTarget[] = [];
    if (process.argv.includes('-t')) {
        for (let i = process.argv.indexOf('-t') + 1; i < process.argv.length; i++) {
            let t = process.argv[i].split(':');
            targets.push({
                id: t[0],
                ip: t[1]
            });
        }
    }

    console.log('Reverse Proxy Spawned');

    let config: ProxyServerConfig = {
        port: port,
        targets: targets
    }
    let proxy = new Proxy(config);

}

main();