export interface NodeLogicConfig {
    // port: number; // may not be need
    leftNodeId: string;
    rightNodeId: string;
    panRange: number; // in radians
    panCenter: number; // in radians,
    home: {
        r: number;
        t: number;
    }
}

export class NodeLogic {
    public leftNodeId: string;
    public rightNodeId: string;
    private lastSignal: number;
    private home: { r: number; t: number; };
    private currR: number;
    private currT: number;

    public sIO: any; // socketio connection to be implemented later

    constructor(private config: NodeLogicConfig) {
        this.leftNodeId = config.leftNodeId;
        this.rightNodeId = config.rightNodeId;
        this.lastSignal = 0;
        this.home.r = config.home.r;
        this.home.t = config.home.t;
        this.currR = this.home.r;
        this.currT = this.home.t;
    }

    public static log(str: string) {
        console.log(`[Node Logic] ${str}`);
    }

    public reconfigure(config: NodeLogicConfig) {
        this.config = config;
        this.leftNodeId = config.leftNodeId;
        this.rightNodeId = config.rightNodeId;
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

    }

    public setPos(r: number, t: number) {

    }

    public updatePos(r: number, t: number) {

    }

    public requestOffset(x: number, y: number) {

    }

    public informBusyState(busy: boolean) {

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

    console.log('Node Logic Spawned');

    let nodeLogic = new NodeLogic({
        // port: port,
        leftNodeId: null,
        rightNodeId: null,
        panRange: 180 * Math.PI / 180,
        panCenter: 90 * Math.PI / 180,
        home: {
            r: 90 * Math.PI / 180,
            t: 90 * Math.PI / 180
        }
    });

}

main();