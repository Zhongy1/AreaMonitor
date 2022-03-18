import { io, Socket } from "socket.io-client";
import { CONFIG } from "../config";

export interface NodeLogicConfig {
    // port: number; // may not be need
    // leftNodeId: string;
    // rightNodeId: string;
    // panRange: number; // in radians
    // panCenter: number; // in radians,
    home: {
        r: number;
        t: number;
    }
}

export class NodeLogic {
    // public leftNodeId: string;
    // public rightNodeId: string;
    private lastActivity: number;
    private active: boolean;
    private home: { r: number; t: number; };
    private currR: number;
    private currT: number;

    public sIO: Socket;

    constructor(private config: NodeLogicConfig) {
        // this.leftNodeId = config.leftNodeId;
        // this.rightNodeId = config.rightNodeId;
        this.lastActivity = 0;
        this.active = false;
        this.home = {
            r: config.home.r,
            t: config.home.t
        }
        this.currR = this.home.r;
        this.currT = this.home.t;

        this.sIO = io(`ws://localhost:${CONFIG.WEB_SERVER_PORT}/nl`, {
            reconnectionDelay: 5000,
            reconnectionDelayMax: 5000,
        });
        this.initIO();
    }

    public initIO(): void {
        this.sIO.on('requestOffset', (opts) => {
            this.requestOffset(Number(opts.x) || 0, Number(opts.y) || 0);
        });
        this.sIO.on('updatePos', (opts) => {
            opts.r = (opts.r - 1500) * 180 / 2000;
            opts.t = (opts.t - 1500) * 180 / 2000;
            this.updatePos(opts.r, opts.t)
        });

        this.sIO.on('receiveSignal', (opts) => {

        });
        this.sIO.on('ping', (opts) => {

        });
        this.sIO.on('pong', (opts) => {

        });

        this.sIO.on('connect', () => {

        });

        this.sIO.on('error', (e) => {

        });
    }

    public connectIO(): void {
        this.sIO.connect();
    }

    public startActivityLoop(): void {
        setInterval(() => {
            // 20 seconds of inactivity -> disable recording
            if (this.active && Date.now() > this.lastActivity + 20000) {
                this.informBusyState(false);
            }
        }, 1000);
    }

    public static log(str: string) {
        console.log(`[Node Logic] ${str}`);
    }

    // comms with pt ctrl
    //   OUT doOffset
    //   OUT setPos
    //   In  updatePos
    // comms with video proc
    //   IN requestOffset
    //   OUT informBusyState
    // comms with external node
    //   OUT signalNode
    //   IN receiveSignal

    public doOffset(r: number, t: number) {
        this.sIO.emit('doOffset', {
            r: r,
            t: t
        });
        this.lastActivity = Date.now();
        this.informBusyState(true);
    }

    public setPos(r: number, t: number, setHome: boolean = false) {
        if (setHome) {
            this.home.r = Number(r) || 0;
            this.home.t = Number(t) || 0;
        }
        this.sIO.emit('setPos', {
            r: r,
            t: t
        });
        this.lastActivity = Date.now();
        this.informBusyState(true);
    }

    public updatePos(r: number, t: number) {
        this.currR = r;
        this.currT = t;
    }

    public requestOffset(x: number, y: number) {
        // No preprocessing
        this.doOffset(x, y);
        // How should it be processed?
    }

    public informBusyState(busy: boolean) {
        this.active = busy;
        this.sIO.emit('informBusyState', busy);
    }

    public signalNode(nodeId: string, nodePos: 'l' | 'r') {

    }

    public receiveSignal(nodePos: 'l' | 'r') {

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

    let nodeLogic = new NodeLogic({
        // port: port,
        // leftNodeId: null,
        // rightNodeId: null,
        // panRange: 180 * Math.PI / 180,
        // panCenter: 90 * Math.PI / 180,
        home: {
            r: 0,
            t: 45
        }
    });

    NodeLogic.log('Node Logic Spawned');

}

main();