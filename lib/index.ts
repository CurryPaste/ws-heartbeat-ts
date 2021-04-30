/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/** byte - Coding format  */
type byteFormat = 'utf-8' | 'iso-8859-2' | 'koi8' | 'cp1261' | 'gbk' | 'etc' ;

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
  url: string; // ws url
  pingTimeout?: number | null; // send frequency
  pongTimeout?: number | null; // time out
  reconnectTimeout?: number; // reconnect time
  repeatLimit?: null | number; // max reconnect second
  pingMsg?: string; // send data
  dataType?: 'json' | 'byte'; // serve data type —— (byte - TextEncoder&TextDecoder - golang)
  byteFormat?: byteFormat; // Coding format ( if dataType is byte)
}
/**
 * @param code code码-操作类型 eg: add/commit/edit.......
 * @param type 除code码后还需要额外判断的类型
 * @param message 提示信息 eg: this is a message
 * @param data 传输的数据 array | object | string
 */
export interface FWsData {
  code: string;     // 识别码
  data: unknown;    // 应该用泛型 
  type?: string;    // 在code码相同的情况下的备用选项 
  message?: string; // 需要提示的其他信息 
}
export class WsData implements FWsData {
  code: FWsData["code"];
  type: FWsData["type"];
  message: FWsData["message"];
  data: FWsData["data"];
  constructor(param: FWsData){
    this.code = param.code;
    this.data = param.data;
    this.type = param.type || null;
    this.message = param.message || null;
  }
}
// export const sendWsData = (data: FWsData) => JSON.stringify(new WsData(data));

/**
 * 根据 类型 转换
 * @param type 转换类型
 * @param data 需要转换的数据
 * @returns 转换后的数据
 */
const decodeData = (opts: {
  type: WsOption["dataType"];
  format: byteFormat;
}, event: MessageEvent) => {
  /** 理论上来说，如果是byte类型数据传输，ws的type应该就不是message了。但是暂时还没有遇到这类返回，以防万一先空过type处理。 */
  let res = ''
  switch(opts.type){
    case 'json':
      res = JSON.parse(event.data);
      break;
    case 'byte':
      const dec = new TextDecoder(opts.format);
      res = JSON.parse(dec.decode(event.data));
      break;
    default:
      res = event.data;
      break;
  }
  return res;
}

/** WsHeartBeat */
class WsHeartBeat {
  opts: WsOption = null;
  ws: null | WebSocket = null; //websocket实例
  repeat = 0; // 重连次数
  lockReconnect = false; // 重连-lock
  forbidReconnect = false; // 控制重连

  private pingTimeoutId: null | number = null; // ping的定时器
  private pongTimeoutId: null | number = null; // pong的定时器

  //override hook function
  onclose = () => {};
  onerror = () => {};
  onopen = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onmessage = (data: FWsData, event: MessageEvent) => {};
  onreconnect = () => {}; /** Methods of additional exposure */
  
  /** hooks */
  send = function (data: string) {
    this.ws.send(data);
  };
  sendData = function (data: FWsData) {
    this.ws.send(JSON.stringify(new WsData(data)));
  }
  close = function () {
    //如果手动关闭连接，不再重连
    this.forbidReconnect = true;
    this.heartReset();
    this.ws.close();
  };
  heartCheck = function () {
    this.heartReset();
    this.heartStart();
  };
  heartStart = function () {
    if(this.forbidReconnect) return;//不再重连就不再执行心跳
    this.pingTimeoutId = setTimeout(() => {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      //onmessage拿到返回的心跳就说明连接正常
      this.ws.send(this.opts.pingMsg);
      //如果超过一定时间还没重置，说明后端主动断开了
      this.pongTimeoutId = setTimeout(() => {
          //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
          this.ws.close();
      }, this.opts.pongTimeout);
    }, this.opts.pingTimeout);
  };
  heartReset = function () {
    clearTimeout(this.pingTimeoutId);
    clearTimeout(this.pongTimeoutId);
  };
  reconnect = function () {
    if(this.opts.repeatLimit > 0 && this.opts.repeatLimit <= this.repeat) return;//limit repeat the number
    if(this.lockReconnect || this.forbidReconnect) return;
    this.lockReconnect = true;
    this.repeat++;//必须在lockReconnect之后，避免进行无效计数
    this.onreconnect();
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout(() => {
        this.createWebSocket();
        this.lockReconnect = false;
    }, this.opts.reconnectTimeout);
  };
  /** init */
  initEventHandle = function () {
    /** ws 自己关闭，尝试重连 */
    this.ws.onclose = () => {
      this.onclose();
      this.reconnect();
    }
    /** ws 异常，重连 */
    this.ws.onerror = () => {
      this.onerror();
      this.reconnect();
    };
    this.ws.onopen = () => {
      this.repeat = 0;
      this.onopen();
    };
    this.ws.onmessage = (event: MessageEvent) => {
      //如果获取到消息，心跳检测重置
      //拿到任何消息都说明当前连接是正常的
      this.heartCheck();
      /** 如果是ping信息，则只重置心跳。不返回 */
      if( event.data !== this.opts.pingMsg ) {
        let data = null;
        try {
          data = decodeData( {type: this.opts.dataType, format: this.opts.byteFormat},  event);
        } catch (error) {
          data = event.data;
          console.warn(`There is a problem with data analysis. A string of type ${this.opts.dataType} is required, but the provided parameter is parsed incorrectly`);
        }

        this.onmessage(data, event);
      }
    };
    /** 手动调用一次检测 */
    this.heartCheck();
  };
  /** create */
  createWebSocket = function () {
    try {
      this.ws = new WebSocket(this.opts.url);
      this.initEventHandle();
    } catch (e) {
      this.reconnect();
      throw e;
    }
  }

  constructor(params: WsOption){
    this.opts = {
      url: params.url,
      pingTimeout: params.pingTimeout || 5000,
      pongTimeout: params.pongTimeout || 10000,
      reconnectTimeout: params.reconnectTimeout || 2000,
      pingMsg: params.pingMsg || "{}",
      repeatLimit: params.repeatLimit || 5,
      dataType: params.dataType || 'json',
      byteFormat: params.byteFormat || 'utf-8'
    };

    this.createWebSocket();
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if(typeof window != 'undefined') (window as any).WsHeartBeat = WsHeartBeat;

export default WsHeartBeat
