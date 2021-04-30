/** byte - Coding format  */
declare type byteFormat = 'utf-8' | 'iso-8859-2' | 'koi8' | 'cp1261' | 'gbk' | 'etc';
/**
 * @param url WebSocket地址
 * @param pingTimeout 心跳发送间隔
 * @param pongTimeout 相应超时时间
 * @param reconnectTimeout 重连(延时)间隔
 * @param repeatLimit 最大尝试重连次数
 * @param pingMsg 发送的信息
 * @param dataType 数据解析类型
 * @param byteFormat 需要单独转换的格式
 * @remark
 */
interface WsOption {
    url: string;
    pingTimeout?: number | null;
    pongTimeout?: number | null;
    reconnectTimeout?: number;
    repeatLimit?: null | number;
    pingMsg?: string;
    dataType?: 'json' | 'byte';
    byteFormat?: byteFormat;
}
/**
 * @param code code码-操作类型 eg: add/commit/edit.......
 * @param type 除code码后还需要额外判断的类型
 * @param message 提示信息 eg: this is a message
 * @param data 传输的数据 array | object | string
 */
export interface FWsData {
    code: string;
    data: unknown;
    type?: string;
    message?: string;
}
export declare class WsData implements FWsData {
    code: FWsData["code"];
    type: FWsData["type"];
    message: FWsData["message"];
    data: FWsData["data"];
    constructor(param: FWsData);
}
/** WsHeartBeat */
declare class WsHeartBeat {
    opts: WsOption;
    ws: null | WebSocket;
    repeat: number;
    lockReconnect: boolean;
    forbidReconnect: boolean;
    private pingTimeoutId;
    private pongTimeoutId;
    onclose: () => void;
    onerror: () => void;
    onopen: () => void;
    onmessage: (data: FWsData, event: MessageEvent) => void;
    onreconnect: () => void; /** Methods of additional exposure */
    /** hooks */
    send: (data: string) => void;
    sendData: (data: FWsData) => void;
    close: () => void;
    heartCheck: () => void;
    heartStart: () => void;
    heartReset: () => void;
    reconnect: () => void;
    /** init */
    initEventHandle: () => void;
    /** create */
    createWebSocket: () => void;
    constructor(params: WsOption);
}
export default WsHeartBeat;
