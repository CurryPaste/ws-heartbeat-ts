# ws-heartbeat-ts

根据 [websocket-heartbeat-js](https://www.npmjs.com/package/websocket-heartbeat-js) 编写的ts版本

### How to use
1. 使用 `getInstance` 获得ws实例, 而不是 `new` 关键字.
2. 因为这可以确保对于相同的URL地址，当它不是初始调用时，它将获取现有实例，而不是创建相同URL的WS连接。
```js
/** ts */
import WsHeartBeat from '@findsoft/ws-heartbeat-ts';
// your interface
interface IObj extends FWsData {
  id: string,
  typess: string
}
const wsInstance: WsHeartBeat = WsHeartBeat.getInstance(opt);
const myData = {id: 1, data: 2};
// 发送-json格式——自动 JSON.stringify
wsInstance.sendData( myData );
// 发送-普通格式
wsInstance.send( JSON.stringify(myData) );
// 接收-json格式(如果 JSON.parse 抛错，则会返回ws原始数据)
wsInstance.onmessage = (data: IObj, wsEvent: MessageEvent) => {
 console.log(data, 'data\nwsEvent', wsEvent);
};
```

### Option
| 参数 | 是否必填 | 类型 | 默认 | 说明 |
| ------ | ------ | ------ | ------ | ------ |
| url | true | string |  | ws地址 |
| pingTimeout | false | number | 5000 | 心跳包发送频率 |
| pongTimeout | false | number | 10000 | 超时时间,超过判定为断开 |
| reconnectTimeout | false | number | 2000 | 重连延时,每time毫秒尝试重连 |
| pingMsg | false | string | "{}" | 心跳包内容 |
| repeatLimit | false | number | 5 | 尝试重连的次数 |
| dataType | false | json/byte | 'json' | ws-message返回的数据格式 |
| byteFormat | false| utf-8 | 'utf-8'| 如果为byte类型,编码方式为utf-8 |

### 约定
1. 需要和后端讨论 收发消息 的数据格式

<!-- ### 其他
- window.setTimeout —— 暂无
   
   ***Considering that `window.settimeout` and `window.setinterval` will have problems when the browser is minimized, we are ready to switch to [worker-timers](https://www.npmjs.com/package/worker-timers)***
- `interface FWsData` 前后端传输类型 - JSON 格式
- 除`JSON`格式外的保留`byte`传输方式(传输流)
<!-- 7. others Please see the specific code -->

### 为什么用ts
<!-- 1. Want to try, pack the TS file, and automatically generate `.d.ts` 😀 -->
- ts可以使用`singleton`单例模式开发,在ts项目中,可以保证同一个ws地址,只会有一个连接( version >= 0.5.x)
- ts可以自动生成 `.d.ts` 的声明文件 -->

### 备注
   > 其他文档可以参见 [websocket-heartbeat-js](https://www.npmjs.com/package/websocket-heartbeat-js)

<!-- ### 更改声明文件
根目录运行`npm run build`

打包后将自动生成 `.d.ts` -->
