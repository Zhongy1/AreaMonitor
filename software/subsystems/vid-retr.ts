import * as fs from 'fs';
import * as path from 'path';
import * as del from 'del';
import fastify, { FastifyInstance } from 'fastify';
import fastify_static from 'fastify-static';
import { CONFIG } from '../../config';

export interface VideoServerConfig {
    port: number,
    vidDirectory?: string
}

export class VideoServer {
    private app: FastifyInstance;
    private vidDirectory: string;

    constructor(private config: VideoServerConfig) {
        this.app = fastify({
            // logger: true,
            logger: {
                prettyPrint: true
            },
            ignoreTrailingSlash: true,
        });

        this.vidDirectory = this.config.hasOwnProperty('vidDirectory') ? this.config.vidDirectory : path.resolve(process.cwd(), CONFIG.DEFAULT_VID_DIRECTORY);

        this.initialize();
    }

    public static log(str: string) {
        console.log(`[Vid Retrieval] ${str}`);
    }

    private async initialize(): Promise<void> {
        await this.setupMiddleware();

        this.initEndpoints();

        this.app.listen(this.config.port, '0.0.0.0', err => {
            if (err) {
                throw err;
            }
            console.log(
                '\x1b[1m\x1b[34m-----------------------------------\x1b[0m\n' +
                `  Vid server is running on \x1b[1m\x1b[35m*:${this.config.port}\x1b[0m\n` +
                `    Recordings Directory: \x1b[1m\x1b[33m${this.vidDirectory}\x1b[0m\n` +
                '\x1b[1m\x1b[34m-----------------------------------\x1b[0m'
            );
        });
    }

    private async setupMiddleware(): Promise<void> {
        // create the video storage directory if it doesn't exist
        if (!this.config.hasOwnProperty('vidDirectory') && !fs.existsSync(path.resolve(process.cwd(), CONFIG.DEFAULT_VID_DIRECTORY))) {
            fs.mkdirSync(path.resolve(process.cwd(), CONFIG.DEFAULT_VID_DIRECTORY));
        }
        // only /recordings should be made public through nginx
        this.app.register(fastify_static, {
            root: this.vidDirectory,
            prefix: '/recordings'
        });
    }

    private initEndpoints(): void {
        // Folders by day. Format: year-month-day. Example: 20-01-01 or 20-02-14
        // Files by start time using military time. Format: hour-minute-second. Example: 13-59-59

        // Get array of folder names
        this.app.get('/folders', async (req, reply): Promise<string[]> => {
            return this.getFolders();
        });

        // Get array of file names within a folder
        this.app.get<{ Params: { fname: string } }>('/folders/:fname', async (req, reply): Promise<string[]> => {
            return this.getRecordings(req.params.fname);
        });

        // Delete a recording. Note: folder should automaticaally be removed when empty
        this.app.delete<{ Params: { fname: string, rname: string } }>('/folders/:fname/:rname', async (req, reply): Promise<boolean> => {
            return await this.deleteRecording(req.params.fname, req.params.rname);
        });
    }

    public getFolders(): string[] {
        let folders: string[] = fs.readdirSync(this.vidDirectory).sort().reverse();
        return folders;
    }

    public getRecordings(fname: string): string[] {
        if (!fs.existsSync(path.resolve(this.vidDirectory, fname))) return [];
        let recordings: string[] = fs.readdirSync(path.resolve(this.vidDirectory, fname)).sort().reverse();
        return recordings;
    }

    public async deleteRecording(fname: string, rname: string): Promise<boolean> {
        if (!fs.existsSync(path.resolve(this.vidDirectory, fname, rname))) return false;
        await del(path.resolve(this.vidDirectory, fname, rname));
        if (this.getRecordings(fname).length == 0) {
            await del(path.resolve(this.vidDirectory, fname));
        }
        return true;
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

    // you can optionally set the video storage directory; requires full path
    let vidDir = null;
    if (process.argv.includes('-d')) {
        let tempDir = process.argv[process.argv.indexOf('-d') + 1];
        if (typeof tempDir != 'string') {
            vidDir = tempDir;
        }
        else {
            throw 'No video directory specfified';
        }

        if (!fs.existsSync(vidDir)) {
            throw 'Video directory does not exist';
        }
    }

    let conf: VideoServerConfig = {
        port: port
    }
    if (vidDir) {
        conf.vidDirectory = vidDir;
    }
    let videoServer = new VideoServer(conf);

    VideoServer.log('Video Retrieval Spawned');

}

main();