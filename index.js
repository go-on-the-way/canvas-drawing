DrawBoard.fn.extend({
    arrowDataSend: function () {

    },
    arrowEnd: function () {//箭头绘制完后的调用
        this.arrowDataSend();
    },
    arrowUpdate: function () {//箭头更新(移动和旋转)
        this.arrowDataSend();
    }
});

let canvas = DrawBoard({
    drawBoard: 'drawing',//暂时仅支持ID选择器,绑定的canvas标签
    color: 'rgba(0,0,0,0)',
    height: window.innerHeight,
    width: window.innerWidth,
    penWidth: 1,
    tools: [//工具栏
        { value: 'rect', text: '矩形' },
        { value: 'arrow', text: '箭头' },
        { value: 'brush', text: '画笔' },
        { value: 'text', text: '文本' },
        { value: 'image', text: '图标' }
    ]
});

// const url = 'ws://192.168.111.129:5555000';
// let myWebSocket = new MyWebSocket({
//     url: url,
//     pingTimeout: 8000,
//     pongTimeout: 8000
// });

// myWebSocket.onopen = function () {
// }

// myWebSocket.onmessage = function (e) {
//     console.log(e);
// }
// myWebSocket.onreconnect = function () {

// }

