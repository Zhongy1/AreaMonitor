import { FastifyInstance } from 'fastify';
import fastifyIO from 'fastify-socket.io'
import { WebServerConfig } from '../subsystems/web-server';
import { Namespace } from 'socket.io';
import { io, Socket } from "socket.io-client";

export interface SIONamespaces {
    external: Namespace | Socket;
    nodeLogic: Namespace;
    videoProc: Namespace;
    panTilt: Namespace;
}

export class SIOService {
    public initialized: boolean;
    private namespaces: SIONamespaces;

    constructor(public app: FastifyInstance, private config: WebServerConfig) {
        this.initialized = false;
    }

    public registerIO(): void {
        this.app.register(fastifyIO, {});
    }

    public initIO(): void {
        this.initialized = true;
        this.initNamespaces();
        this.initListeners();
    }

    private initNamespaces(): void {
        this.namespaces = {
            external: null,
            nodeLogic: this.app.io.of('/nl'),
            videoProc: this.app.io.of('/vp'),
            panTilt: this.app.io.of('/pt')
        }

        if (this.config.master) {
            this.namespaces.external = this.app.io.of('/ext')
        }
        else {
            // specify the ip of the master camera
            this.namespaces.external = io("ws://*/ext");
        }
    }

    private initListeners(): void {
        this.namespaces.nodeLogic.on('connection', (socket) => {
            socket.on('informBusyState', (opts) => {
                this.vpInformBusyState(opts);
            });
            socket.on('doOffset', (opts) => {
                this.ptDoOffset(opts);
            });
            socket.on('setPos', (opts) => {
                this.ptSetPos(opts);
            });
            socket.on('signalNode', (opts) => {
                // to a target node; use extReceiveSignal
            });
            socket.on('ping', (opts) => {
                // to a target node, use extPing
            });
            socket.on('pong', (opts) => {
                // to a target node, use extPong
            });
        });

        this.namespaces.videoProc.on('connection', (socket) => {
            socket.on('requestOffset', (opts) => {
                this.nlRequestOffset(opts);
            });
        });

        this.namespaces.panTilt.on('connection', (socket) => {
            socket.on('updatePos', (opts) => {
                this.nlUpdatePos(opts);
            });
        });


        this.namespaces.videoProc.on('connection', (socket) => {
            socket.on('signalNode', (opts) => {
                this.nlReceiveSignal(opts);
            });
            socket.on('ping', (opts) => {
                this.nlPing(opts);
            });
            socket.on('pong', (opts) => {
                this.nlPong(opts);
            });
        });
    }

    public vpInformBusyState(opts: boolean): void {
        this.namespaces.videoProc.emit('informBusyState', opts);
    }

    public nlRequestOffset(opts: { x: number, y: number }): void {
        this.namespaces.nodeLogic.emit('requestOffset', opts);
    }

    public nlUpdatePos(opts: { r: number, t: number }): void {
        this.namespaces.nodeLogic.emit('updatePos', opts);
    }

    public nlReceiveSignal(opts: any): void {
        this.namespaces.nodeLogic.emit('receiveSignal', opts);
    }

    public nlPing(opts: any): void {
        this.namespaces.nodeLogic.emit('ping', opts);
    }

    public nlPong(opts: any): void {
        this.namespaces.nodeLogic.emit('pong', opts);
    }

    public ptDoOffset(opts: { r: number, t: number }): void {
        this.namespaces.panTilt.emit('doOffset', opts);
    }

    public ptSetPos(opts: { r: number, t: number }): void {
        this.namespaces.panTilt.emit('setPos', opts);
    }

    public extReceiveSignal(opts: any): void {

    }

    public extPing(opts: any): void {

    }

    public extPong(opts: any): void {

    }

    public linkNode(): void {

    }
}