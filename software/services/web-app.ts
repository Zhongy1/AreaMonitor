import * as path from 'path';
import { FastifyInstance } from "fastify";
import point_of_view from 'point-of-view';
import * as ejs from 'ejs';
import fastify_static from 'fastify-static';
import { WebServerConfig } from '../subsystems/web-server';
import { SIOService } from './sio-service';

declare module "fastify" {
    interface FastifyReply {
        desktop(page: string, data: { title: string, [key: string]: any }): FastifyReply;
        mobile(page: string, data: { title: string, [key: string]: any }): FastifyReply;
    }
}

export class WebApp {

    constructor(private app: FastifyInstance, private sioService: SIOService, private config: WebServerConfig) {

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
                nodeVersion: process.version
            });
        });

        this.app.get('/testing', async (req, reply) => {
            return reply.mobile('testing', {
                title: 'Testing'
            });
        });

        this.app.post<{ Querystring: { x: string, y: string } }>('/integration/test1', async (req, reply) => {
            let r = (parseInt(req.query.x) || 0) * 90 / 100;
            let t = (parseInt(req.query.y) || 0) * 90 / 100;
            this.sioService.ptSetPos({ r: r, t: t });
            return;
        });
    }
}