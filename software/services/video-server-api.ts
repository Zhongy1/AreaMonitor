import axios from 'axios';


export class VideoServerApi {
    private url: string;

    constructor(private ip: string, private port: number = 80) {
        this.url = `http://${ip}:${port}`;
    }

    public async getFolders(): Promise<string[]> {
        return (await axios.get(this.url + '/folders')).data;
    }

    public async getRecordings(fname: string): Promise<string[]> {
        return (await axios.get(this.url + `/folders/${fname}`)).data;
    }

    public async deleteRecording(fname: string, rname: string): Promise<boolean> {
        return (await axios.delete(this.url + `/folders/${fname}/${rname}`)).data;
    }
}