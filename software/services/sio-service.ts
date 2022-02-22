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
        this.namespaces.nodeLogic.on('informBusyState', (opts) => {

        });
        this.namespaces.nodeLogic.on('doOffset', (opts) => {

        });
        this.namespaces.nodeLogic.on('setPos', (opts) => {

        });
        this.namespaces.nodeLogic.on('signalNode', (opts) => {
            // to a target node; use extReceiveSignal
        });
        this.namespaces.nodeLogic.on('ping', (opts) => {
            // to a target node, use extPing
        });
        this.namespaces.nodeLogic.on('pong', (opts) => {
            // to a target node, use extPong
        });


        this.namespaces.videoProc.on('requestOffset', (opts) => {

        });


        this.namespaces.panTilt.on('updatePos', (opts) => {

        });


        this.namespaces.external.on('signalNode', (opts) => {
            this.nlReceiveSignal(opts);
        });
        this.namespaces.external.on('ping', (opts) => {
            this.nlPing(opts);
        });
        this.namespaces.external.on('pong', (opts) => {
            this.nlPong(opts);
        });
    }

    public vpInformBusyState(opts: any): void {

    }

    public nlRequestOffset(opts: any): void {

    }

    public nlUpdatePos(opts: any): void {

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

    public ptDoOffset(opts: any): void {

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
}