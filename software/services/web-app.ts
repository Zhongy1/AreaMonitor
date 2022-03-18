import * as path from 'path';
import { FastifyInstance } from "fastify";
import point_of_view from 'point-of-view';
import * as ejs from 'ejs';
import fastify_static from 'fastify-static';
import { Mode, WebServerConfig } from '../subsystems/web-server';
import { SIOService } from './sio-service';
import { VideoServerApi } from './video-server-api';
import { CONFIG } from '../config';

declare module "fastify" {
    interface FastifyReply {
        desktop(page: string, data: { title: string, [key: string]: any }): FastifyReply;
        mobile(page: string, data: { title: string, [key: string]: any }): FastifyReply;
    }
}

export class WebApp {
    private tempVidApi: VideoServerApi;

    constructor(private app: FastifyInstance, private sioService: SIOService, private config: WebServerConfig) {
        this.tempVidApi = new VideoServerApi(config.camIP[0], CONFIG.VID_RETR_PORT);
    }

    public async initApp(): Promise<void> {
        this.app.register(point_of_view, {
            engine: {
                ejs: ejs
            },
            includeViewExtension: true,
            templates: path.resolve(__dirname, '../frontend/views'),
            layout: './layouts/desktop.ejs',
            propertyName: 'desktop'
        });
        this.app.register(point_of_view, {
            engine: {
                ejs: ejs
            },
            includeViewExtension: true,
            templates: path.resolve(__dirname, '../frontend/views'),
            layout: './layouts/mobile.ejs',
            propertyName: 'mobile'
        });

        this.app.register(fastify_static, {
            root: path.resolve(__dirname, '../frontend/public'),
            prefix: '/',
        });

        this.app.get('/', async (req, reply) => {
            return reply.desktop('home', {
                title: 'Home',
                port: this.config.port,
                nodeVersion: process.version,
                mode: Mode[this.config.mode],
                camIP: this.config.camIP,
                targetIP: this.config.targetIP
            });
        });

        this.app.get('/config', async (req, reply) => {
            return reply.desktop('config', {
                title: 'Configure'
            });
        });

        this.app.post<{ Body: { ssid: string; passwd: string; master: string; camIP: string } }>('/config', async (req, reply) => {
            console.log(`SSID: ${req.body.ssid}\nPassword: ${req.body.passwd}\nMaster: ${req.body.master}\nMaster IP: ${req.body.camIP}`);
            return reply.redirect('/config');
        });

        this.app.get('/cameras', async (req, reply) => {
            return reply.desktop('cameras', {
                title: 'Cameras',
                camIds: ['123', '456', '789']
            });
        });

        this.app.post<{ Body: any }>('/cameras', async (req, reply) => {
            console.log(req.body);
            return reply.redirect('/cameras');
        });

        this.app.get('/explore', async (req, reply) => {
            return reply.desktop('explore', {
                title: 'Explore',
                camIds: ['123', '456', '789']
            });
        });

        this.app.get<{ Params: { camera_id: string } }>('/explore/:camera_id', async (req, reply) => {
            let folders: string[] = await this.tempVidApi.getFolders();
            return reply.desktop('explore-cam', {
                title: 'Explore',
                camId: req.params.camera_id,
                streamPath: `/stream`, //do a check to see if cam ID matches with the master's ID, then decide if proxy should be used
                fnames: folders
            });
        });

        this.app.get<{ Params: { camera_id: string, fname: string } }>('/explore/:camera_id/:fname', async (req, reply) => {
            let recordings: string[] = await this.tempVidApi.getRecordings(req.params.fname);
            return reply.desktop('explore-folder', {
                title: 'Explore',
                camId: req.params.camera_id,
                fname: req.params.fname,
                recPaths: recordings.map((name) => `http://localhost:3004/recordings/${req.params.fname}/${name}`), //once again do a check on ID; then change recording paths to route through proxy appropriately
                rnames: recordings
            });
        });

        await this.initTests();
    }

    private async initTests(): Promise<void> {
        this.app.get('/testing', async (req, reply) => {
            return reply.mobile('testing', {
                title: 'Testing'
            });
        });

        this.app.post<{ Querystring: { x: string, y: string } }>('/integration/test1', async (req, reply) => {
            let r = (parseInt(req.query.x) || 0) * 90 / 100;
            let t = (parseInt(req.query.y) || 0) * 90 / 100;
            this.sioService.ptSetPos({ r: r, t: t });
            reply.status(204);
            return;
        });
    }
}