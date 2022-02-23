/** byte - Coding format  */
declare type byteFormat = 'utf-8';
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
export interface WsOption {
    url: string;
    pingTimeout?: number | null;
    pongTimeout?: number | null;
    reconnectTimeout?: number;
    repeatLimit?: null | number;
    pingMsg?: string;
    dataType?: 'json' | 'byte';
    byteFormat?: byteFormat;
}
/** WsHeartBeat */
declare class WsHeartBeat {
    opts: WsOption;
    ws: null | WebSocket;
    repeat: number;
    lockReconnect: boolean;
    forbidReconnect: boolean;
    private static instance;
    private pingTimeoutId;
    private pongTimeoutId;
    onclose: (_err: CloseEvent) => void;
    onerror: () => void;
    onopen: () => void;
    onmessage: (data: any, event: MessageEvent) => void;
    onreconnect: () => void; /** Methods of additional exposure */
    /** hooks */
    send: (data: string) => void;
    sendData: <T>(data: T) => void;
    close: () => void;
    heartCheck: () => void;
    heartStart: () => void;
    heartReset: () => void;
    reconnect: () => void;
    /** init */
    initEventHandle: () => void;
    /** create */
    createWebSocket: () => void;
    /** 获得实例 */
    static getInstance(params: WsOption): WsHeartBeat;
    private constructor();
}
export default WsHeartBeat;
