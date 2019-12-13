//websoket心跳重连
function MyWebSocket() {
    return new MyWebSocket.prototype.init();
}

MyWebSocket.prototype = {
    constructor: MyWebSocket,
    onclose: () => { console.log(this) },
    onerror: () => { },
    onopen: () => { },
    onmessage: () => { },
    onreconnect: () => { },
    send: function (msg) {
        this.ws.send(msg);
    }
}

MyWebSocket.prototype.reconnect = function () {
    if (this.opts.repeatLimit > 0 && this.repeat >= this.opts.repeatLimit) return;//limit repeat the number
    if (this.lockReconnect || this.forbidReconnect) return;//lockReconnect用于保证一次执行一个重连
    this.lockReconnect = true;
    this.repeat++;//重连计数
    this.onreconnect();
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout(() => {
        this.createWs();
        this.lockReconnect = false;
    }, this.opts.reconnectTimeout);
}

MyWebSocket.prototype.heartStart = function () {
    if (this.forbidReconnect) return;//不再重连就不再执行心跳
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
}

MyWebSocket.prototype.heartReset = function () {
    clearTimeout(this.pingTimeoutId);
    clearTimeout(this.pongTimeoutId);
}

MyWebSocket.prototype.heartCheck = function () {
    this.heartReset();
    this.heartStart();
}

MyWebSocket.prototype.close = function () {
    //如果手动关闭连接，不再重连
    this.forbidReconnect = true;
    this.heartReset();
    this.ws.close();
}

MyWebSocket.prototype.initEvent = function () {
    console.log(this)
    this.ws.onclose = () => {
        this.onclose();
        this.reconnect();
    };
    this.ws.onerror = () => {
        this.onerror();
        this.reconnect();
    };
    this.ws.onopen = () => {
        this.repeat = 0;
        this.onopen();
        //心跳检测重置
        // this.heartCheck();
    };
    this.ws.onmessage = (event) => {
        this.onmessage(event);
        //如果获取到消息，心跳检测重置
        //拿到任何消息都说明当前连接是正常的
        // this.heartCheck();
    };
}

MyWebSocket.prototype.createWs = function () {
    try {
        this.ws = new WebSocket(url);
        this.initEvent()
    } catch (error) {
        this.reconnect();
        throw new Error('建立连接,出现异常');
    }
}

//断网浏览器会自动触发onclose
MyWebSocket.prototype.init = function (opts = {
    url,
    pingTimeout: 15000,
    pongTimeout: 10000,
    reconnectTimeout: 2000,
    pingMsg: 'heartbeat',
    repeatLimit: null
}) {
    this.opts = opts;
    this.repeat = 0;//实际重连次数
    this.createWs();
}

MyWebSocket.prototype.init.prototype = MyWebSocket.prototype;

if (window) window.MyWebSocket = MyWebSocket;