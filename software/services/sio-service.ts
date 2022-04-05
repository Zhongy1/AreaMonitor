import { FastifyInstance } from 'fastify';
import fastifyIO from 'fastify-socket.io'
import { Mode, WebServerConfig } from '../subsystems/web-server';
import { Namespace } from 'socket.io';
import { io, Socket } from "socket.io-client";
import { ClientNode } from '../models/client-node';
import { CONFIG } from '../config';

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
            socket.on('signalNode', (opts: 'l' | 'r') => {
                // to a target node; use extReceiveSignal]
                this.extSignalNode(opts);

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

        this.initExternalListeners();
    }

    private initExternalListeners(): void {
        if (this.config.mode == Mode.Master) {
            this.clientNodes[this.config.id] = {
                ip: this.config.camIP[0],
                id: this.config.id,
                sid: this.config.id,
                leftTarget: null,
                rightTarget: null
            };
            (this.namespaces.external as Namespace).on('connection', (socket) => {
                this.clientNodes[socket.id] = {
                    ip: (Array.isArray(socket.handshake.query.ip)) ? socket.handshake.query.ip[0] : socket.handshake.query.ip,
                    id: (Array.isArray(socket.handshake.query.id)) ? socket.handshake.query.id[0] : socket.handshake.query.id,
                    sid: socket.id,
                    leftTarget: null,
                    rightTarget: null
                }
                if (this.proxyNewClient) {
                    this.proxyNewClient();
                }
                socket.on('disconnect', (reason) => {
                    if (this.clientNodes.hasOwnProperty(socket.id)) {
                        delete this.clientNodes[socket.id];
                        if (this.proxyNewClient) {
                            this.proxyNewClient();
                        }
                    }
                });

                socket.on('signalNode', (opts: any) => {
                    if (this.clientNodes.hasOwnProperty(socket.id)) {
                        if (opts == 'l' && this.clientNodes.hasOwnProperty(this.clientNodes[socket.id].leftTarget)) {
                            if (this.clientNodes[socket.id].leftTarget == this.config.id) {
                                this.nlReceiveSignal(opts);
                            }
                            else {
                                this.extProxySignalNode(this.clientNodes[socket.id].leftTarget, opts);
                            }
                        }
                        else if (opts == 'r' && this.clientNodes.hasOwnProperty(this.clientNodes[socket.id].rightTarget)) {
                            if (this.clientNodes[socket.id].rightTarget == this.config.id) {
                                this.nlReceiveSignal(opts);
                            }
                            else {
                                this.extProxySignalNode(this.clientNodes[socket.id].rightTarget, opts);
                            }
                        }
                    }
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
            this.namespaces.external.on('signalNode', (opts: 'l' | 'r') => {
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

    public nlReceiveSignal(opts: 'l' | 'r'): void {
        if (CONFIG.DEBUG_CAM_SIGNALS) {
            if (this.config.mode == Mode.Master) {
                if (opts == 'l') {
                    console.log(`[Cam ${this.config.id}] receiving signal from the left (Sender: Cam ${this.clientNodes[this.config.id].leftTarget})`);
                }
                else {
                    console.log(`[Cam ${this.config.id}] receiving signal from the right (Sender: Cam ${this.clientNodes[this.config.id].rightTarget})`);
                }
            }
            else if (this.config.mode == Mode.Client) {
                if (opts == 'l') {
                    console.log(`[Cam ${this.config.id}] receiving signal from the left`);
                }
                else {
                    console.log(`[Cam ${this.config.id}] receiving signal from the right`);
                }
            }
        }
        let from: 'l' | 'r' = (opts == 'l') ? 'r' : 'l';
        this.namespaces.nodeLogic.emit('receiveSignal', from);
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

    public extSignalNode(opts: 'l' | 'r'): void {
        if (CONFIG.DEBUG_CAM_SIGNALS) {
            if (this.config.mode == Mode.Master) {
                if (opts == 'l') {
                    console.log(`[Cam ${this.config.id}] signaling to the left (Target: Cam ${this.clientNodes[this.config.id].leftTarget})`);
                }
                else {
                    console.log(`[Cam ${this.config.id}] signaling to the right (Target: Cam ${this.clientNodes[this.config.id].rightTarget})`);
                }
            }
            else if (this.config.mode == Mode.Client) {
                if (opts == 'l') {
                    console.log(`[Cam ${this.config.id}] signaling to the left`);
                }
                else {
                    console.log(`[Cam ${this.config.id}] signaling to the right`);
                }
            }
        }

        if (this.config.mode == Mode.Master) {
            if (opts == 'l') {
                (this.namespaces.external as Namespace).to(this.clientNodes[this.config.id].leftTarget).emit('signalNode', opts);
            }
            else {
                (this.namespaces.external as Namespace).to(this.clientNodes[this.config.id].rightTarget).emit('signalNode', opts);
            }
        }
        else if (this.config.mode == Mode.Client) {
            this.namespaces.external.emit('signalNode', opts);
        }
    }

    public extProxySignalNode(targetId: string, opts: 'l' | 'r'): void {
        if (this.config.mode == Mode.Master && this.clientNodes.hasOwnProperty(targetId)) {
            (this.namespaces.external as Namespace).to(targetId).emit('signalNode', opts);
        }
    }

    public extPing(opts: any): void {

    }

    public extPong(opts: any): void {

    }

    public linkNode(camSid: string, side: string, linkTo: string): void {
        if (this.clientNodes.hasOwnProperty(camSid) && this.clientNodes.hasOwnProperty(linkTo)) {
            if (side == 'l') {
                this.clientNodes[camSid].leftTarget = linkTo;
            }
            else if (side == 'r') {
                this.clientNodes[camSid].rightTarget = linkTo;
            }
        }
    }
}