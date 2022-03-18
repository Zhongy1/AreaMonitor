import { FastifyInstance } from 'fastify';
import fastifyIO from 'fastify-socket.io'
import { Mode, WebServerConfig } from '../subsystems/web-server';
import { Namespace } from 'socket.io';
import { io, Socket } from "socket.io-client";
import { ClientNode } from '../models/client-node';

export interface SIONamespaces {
    external: Namespace | Socket;
    nodeLogic: Namespace;
    videoProc: Namespace;
    panTilt: Namespace;
}

export class SIOService {
    public initialized: boolean;
    private namespaces: SIONamespaces;

    public clientNodes: { [sid: string]: ClientNode };

    constructor(public app: FastifyInstance, private config: WebServerConfig, private proxyNewClient?: Function) {
        this.initialized = false;
        this.clientNodes = {};
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

        if (this.config.mode == Mode.Master) {
            this.namespaces.external = this.app.io.of('/ext')
        }
        else if (this.config.mode == Mode.Client) {
            // specify the ip of the master camera
            this.namespaces.external = io(`ws://${this.config.targetIP}/ext?id=${this.config.id}&ip=${this.config.camIP[0]}`);
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

        this.initExternalListeners();
    }

    private initExternalListeners(): void {
        if (this.config.mode == Mode.Master) {
            (this.namespaces.external as Namespace).on('connection', (socket) => {
                this.clientNodes[socket.id] = {
                    ip: (Array.isArray(socket.handshake.query.ip)) ? socket.handshake.query.ip[0] : socket.handshake.query.ip,
                    id: (Array.isArray(socket.handshake.query.id)) ? socket.handshake.query.id[0] : socket.handshake.query.id,
                    sid: socket.id
                }
                if (this.proxyNewClient) {
                    this.proxyNewClient();
                }

                socket.on('signalNode', (opts: any) => {
                    this.nlReceiveSignal(opts);
                });
                socket.on('ping', (opts: any) => {
                    this.nlPing(opts);
                });
                socket.on('pong', (opts: any) => {
                    this.nlPong(opts);
                });
            });
        }
        else if (this.config.mode == Mode.Client) {
            this.namespaces.external.on('signalNode', (opts: any) => {
                this.nlReceiveSignal(opts);
            });
            this.namespaces.external.on('ping', (opts: any) => {
                this.nlPing(opts);
            });
            this.namespaces.external.on('pong', (opts: any) => {
                this.nlPong(opts);
            });
        }
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

    public extSignalNode(opts: any): void {

    }

    public extPing(opts: any): void {

    }

    public extPong(opts: any): void {

    }

    public linkNode(): void {

    }
}