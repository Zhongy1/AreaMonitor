import { spawn, fork, ChildProcess } from 'child_process';

interface Subprocesses {
    webServer: ChildProcess;
    nodeLogic: ChildProcess;
    ptCtrl: ChildProcess;
    vidCapt: ChildProcess;
    vidProc: ChildProcess;
    vidRetr: ChildProcess;
}

function spawnWebServer(port: number): ChildProcess {
    let proc = fork('subsystems/web-server.ts', ['-p', `${port}`]);
    return proc;
}

function spawnNodeLogic(port: number): ChildProcess {
    let proc = fork('subsystems/node-logic.ts', ['-p', `${port}`]);
    return proc;
}

function spawnPTCtrl(port: number): ChildProcess {
    let proc = spawn('python3', ['subsystems/pt-ctrl.py', '-p', `${port}`]);
    proc.stdout.on('data', (data) => {
        process.stdout.write(`${data}`);
    });

    proc.stderr.on('data', (data) => {
        process.stderr.write(`${data}`);
    });
    return proc;
}

function spawnVidCapt(port: number): ChildProcess {
    let proc = spawn('python3', ['subsystems/vid-capt.py', '-p', `${port}`]);
    proc.stdout.on('data', (data) => {
        process.stdout.write(`${data}`);
    });

    proc.stderr.on('data', (data) => {
        process.stderr.write(`${data}`);
    });
    return proc;
}

function spawnVidProc(port: number): ChildProcess {
    let proc = spawn('python3', ['subsystems/vid-proc.py', '-p', `${port}`]);
    proc.stdout.on('data', (data) => {
        process.stdout.write(`${data}`);
    });

    proc.stderr.on('data', (data) => {
        process.stderr.write(`${data}`);
    });
    return proc;
}

function spawnVidRetr(port: number): ChildProcess {
    let proc = fork('subsystems/vid-retr.ts', ['-p', `${port}`]);
    return proc;
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

    if (process.argv.includes('--notPi')) {
        var notPi = true;
    }

    console.log('Initializing Area Monitor...')

    let subproc: Subprocesses = {
        webServer: spawnWebServer(port),
        nodeLogic: spawnNodeLogic(port + 1),
        ptCtrl: (notPi) ? null : spawnPTCtrl(port + 2),
        vidCapt: (notPi) ? null : spawnVidCapt(port + 3),
        vidProc: (notPi) ? null : spawnVidProc(port + 4),
        vidRetr: spawnVidRetr(port + 5)
    }

    setInterval(() => {

    }, 600000);
}

main();