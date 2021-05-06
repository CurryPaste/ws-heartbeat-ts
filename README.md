# ws-heartbeat-ts

According to [websocket-heartbeat-js](https://www.npmjs.com/package/websocket-heartbeat-js) changed TS version.

### Why write TS version
1. Want to try, pack the TS file, and automatically generate `.d.ts` 😀
2. Typescript can use `singleton` mode to avoid the situation that the client creates two identical WS links( version >= 0.5.x)


### Option
    
| Attribute | required | type | default | description |
| ------ | ------ | ------ | ------ | ------ |
| url | true | string | none | websocket service address |
| pingTimeout | false | number | 5000 | A heartbeat is sent every 5 seconds. If any backend message is received, the timer will reset |
| pongTimeout | false | number | 10000 | After the Ping message is sent, the connection will be disconnected without receiving the backend message within 10 seconds |
| reconnectTimeout | false | number | 2000 | The interval of reconnection |
| pingMsg | false | string | "{}" | Ping message value |
| repeatLimit | false | number | 5 | The trial times of reconnection |
| dataType | false | json/byte | 'json' | How to process the returned data |
| byteFormat | false| utf-8/iso-8859-2/koi8/cp1261/gbk/etc | 'utf-8'| If datatype is byte, which encoding is used for parsing |

### Appointment
1. If `repeatLimit` default is `null`, considering that the new connection will knock down the old connection, if it is not handled, there will be two clients pushing each other and infinitely reconnecting. The back end is required to send the logged in message.
2. dataType
   ```js
   interface FWsData {
      code: string; // 识别码
      data: unknown; // 应该用泛型
      type?: string; // 在code码相同的情况下的备用选项
      message?: string; // 需要提示的其他信息
   }
   ```

### Difference
1. defaultValue
   1. `pingTimeout` : `15000` => `5000`
   <!-- 2. `pongTimeout` : `10000` => `10000` -->
   2. `pingMsg` : `heartbeat` => `{}`
2. params —— Not yet
   1. Add parameters `boolean`. It may be used in the future
3. window.setTimeout —— Not yet
   
   ***Considering that `window.settimeout` and `window.setinterval` will have problems when the browser is minimized, we are ready to switch to [worker-timers](https://www.npmjs.com/package/worker-timers)***
4. `interface FWsData,class WsData` Front and back end data transfer specification - JSON type
5. `sendData()` Add a method to process `JSON`. `sendData` can instantiate objects in a fixed format and parse them in the way of `WsData`. At the same time, the original message event object is reserved as the second return value
6. Reserved `byte` transmission mode except `JSON` format (it may be used if the back end is `golong`)
7. others Please see the specific code

### Remark
   > Please refer to [websocket-heartbeat-js](https://www.npmjs.com/package/websocket-heartbeat-js) for other detailed documents 

### Change declaration file
Just run `npm run build` in the root of the project.

After packaging, the related declaration file will be generated automatically. `.d.ts`
