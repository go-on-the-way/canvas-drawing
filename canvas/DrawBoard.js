//依赖fabric.min-3.5.0.js
(function (global, factory) {
    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {

        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get DrawBoard.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var drawBoard = require("DrawBoard")(window);
        // See ticket #14549 for more info.
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("DrawBoard requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

    // Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {

    let class2type = {};

    //Object.getPrototypeOf() 方法返回指定对象的原型（内部[[Prototype]]属性的值）。
    let getProto = Object.getPrototypeOf;

    //相当于  Object.prototype.toString
    let toString = class2type.toString;

    //hasOwnProperty() 方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性
    //相当于 Object.prototype.hasOwnProperty
    let hasOwn = class2type.hasOwnProperty;

    //因为 hasOwn 是一个函数，所以这里调用的是内置对象 Function 的toString() 方法
    //相当于  Function.prototype.toString
    let fnToString = hasOwn.toString;

    //相当于  Function.prototype.toString.call(Object)
    //就是Object 构造函数 转字符串的结果
    // ObjectFunctionString 其实就是 "function Object() { [native code] }" 这样的一个字符串
    let ObjectFunctionString = fnToString.call(Object);

    let isPlainObject = function (obj) {
        let proto, Ctor;

        //先去掉类型不是 Object 的
        //也就是用 Object.prototype.toString.call(obj) 这种方式，返回值不是 "[object Object]" 的，比如 数组 window history 
        if (!obj || toString.call(obj) !== "[object Object]") {
            return false;
        }

        //获取对象原型，赋值给 proto 
        proto = getProto(obj);

        //如果对象没有原型，那也算纯粹的对象，比如用 Object.create(null) 这种方式创建的对象 
        if (!proto) {
            return true;
        }

        //最后判断是不是通过 "{}" 或 "new Object" 方式创建的对象
        //如果 proto 有 constructor属性，Ctor 的值就为 proto.constructor，
        //原型的 constructor 属性指向关联的构造函数
        Ctor = hasOwn.call(proto, "constructor") && proto.constructor;

        //如果 Ctor 类型是  "function" ，并且调用Function.prototype.toString 方法后得到的字符串 与 "function Object() { [native code] }" 这样的字符串相等就返回true
        //用来区分 自定义构造函数和 Object 构造函数
        return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
    }

    let isFunction = function (obj) {
        // Support: Chrome <=57, Firefox <=52
        // In some browsers, typeof returns "function" for HTML <object> elements
        // (i.e., `typeof document.createElement( "object" ) === "function"`).
        // We don't want to classify *any* DOM node as a function.
        return typeof obj === "function" && typeof obj.nodeType !== "number";
    };

    let generateRandom = function () {
        return Math.random() + new Date().getTime()
    };

    DrawBoard = function (options) {
        // The DrawBoard object is actually just the init constructor 'enhanced'
        // Need init if DrawBoard is called (just allow error to be thrown if not included)
        return new DrawBoard.fn.init(options);
    }

    DrawBoard.fn = DrawBoard.prototype = {
        // The current version of DrawBoard being used
        drawBoard: '1.0.0',
        constructor: DrawBoard,
        createImage: function () {
            let left = this.sx - this.dx > 0 ? this.dx : this.sx;
            let top = this.sy - this.dy > 0 ? this.dy : this.sy;
            fabric.Image.fromURL('assets/icon/icon-cloud.png', (img) => {
                let oImg = img.set({ left: left, top: top });
                this.canvas.add(oImg).setActiveObject(oImg);
                this.activeShape = oImg;
            });
        },
        createText: function () {
            let left = this.sx - this.dx > 0 ? this.dx : this.sx;
            let top = this.sy - this.dy > 0 ? this.dy : this.sy;
            let width = Math.abs(this.sx - this.dx);
            let textbox = new fabric.Textbox('text is here', {
                left: left,
                top: top,
                width: width,
                fontSize: this.fontSize,
                stroke: this.shapeColor,
                cursorColor: this.shapeColor,
                borderColor: this.shapeColor,
                fill: this.shapeColor
            });
            this.canvas.add(textbox).setActiveObject(textbox);
            return textbox;
        },
        createArrow: function () {//创建箭头,箭头为一等腰三角形形状,整体箭头由6个点确定,包括起点、三个顶点、底边距中点相同距离的两点
            //根据两点确定一条直线方程:
            //1、(y2-y1)*x+(x1-x2)*y+y1*x2-y2*x1=0;
            //2、x1=x2时,x-x1=0;
            //3、y1=y2时,y-y1=0;
            //已知一坐标,求其关于一直线的对称点的坐标的计算方式：
            //A、B、C分别表示x、y的系数以及常数
            //x`= 2*(B*B*x-A*B*y-A*C)/(A*A+B*B))-x
            //y`= 2*(A*A*y-A*B*x-B*C)/(A*A+B*B))-y
            let _this = this;
            let pi = Math.PI;
            let sin = Math.sin;
            let cos = Math.cos;
            let sx = this.sx;
            let sy = this.sy;
            let dx = this.dx;
            let dy = this.dy;
            let waistLength = this.penWidth * 10;//腰长
            let bottomCorner = 70 * pi / 180;//底角70度
            let topCorner = 40 * pi / 180;//顶角40度
            let triangleH = waistLength * sin(bottomCorner);//三角形的高
            let bottomEdgeHalf = waistLength * cos(bottomCorner) / 2;//底边的一半
            let offset = this.penWidth + 1;//距离底边中点的距离
            let s = Math.sqrt(Math.pow(sx - dx, 2) + Math.pow(sy - dy, 2));//起始两点间的距离
            let _arrowHandleLength = Math.sqrt(Math.pow(offset, 2) + Math.pow(s - triangleH, 2));//箭头炳的长度

            let pointers = new Array(6);//顺时针存储6个点的坐标
            pointers[0] = [sx, sy];
            pointers[3] = [dx, dy];
            if (sx === dx) {
                let _offset = offset,
                    _triangleH = triangleH,
                    _bottomEdgeHalf = bottomEdgeHalf;
                if (!this.isPositive()) {
                    _offset = -offset;
                    _triangleH = -triangleH;
                    _bottomEdgeHalf = -bottomEdgeHalf;
                }
                pointers[1] = [sx - _offset, dy + _triangleH];
                pointers[2] = [sx - _bottomEdgeHalf, dy + _triangleH];
                //A=0,B=1,C=sy,所以其对称点如下
                pointers[5] = [sx + _offset, dy + _triangleH];
                pointers[4] = [sx + _bottomEdgeHalf, dy + _triangleH];
            }

            if (sy === dy) {
                let _offset = offset,
                    _triangleH = triangleH,
                    _bottomEdgeHalf = bottomEdgeHalf;
                if (!this.isPositive(true)) {
                    _offset = -offset;
                    _triangleH = -triangleH;
                    _bottomEdgeHalf = -bottomEdgeHalf;
                }
                pointers[1] = [dx - _triangleH, sy - _offset];
                pointers[2] = [dx - _triangleH, sy - _bottomEdgeHalf];
                //A=1,B=0,C=sx,所以其对称点如下
                pointers[5] = [dx - _triangleH, sy + _offset];
                pointers[4] = [dx - _triangleH, sy + _bottomEdgeHalf];
            }

            if (sy !== dy && sx !== dx) {
                let angle = Math.atan2(sy - dy, sx - dx),
                    _angle = Math.atan2(offset, s - triangleH),//箭头柄与起终点连线之间的夹角
                    angle1 = angle + topCorner / 2,
                    angle2 = angle - topCorner / 2,
                    angle3 = angle + _angle,
                    angle4 = angle - _angle,
                    p2_X = waistLength * cos(angle1),
                    p2_Y = waistLength * sin(angle1),
                    p4_X = waistLength * cos(angle2),
                    p4_Y = waistLength * sin(angle2),
                    p5_X = _arrowHandleLength * cos(angle3),
                    p5_Y = _arrowHandleLength * sin(angle3),
                    p1_X = _arrowHandleLength * cos(angle4),
                    p1_Y = _arrowHandleLength * sin(angle4);
                pointers[1] = [sx - p1_X, sy - p1_Y];
                pointers[2] = [dx + p2_X, dy + p2_Y];
                pointers[4] = [dx + p4_X, dy + p4_Y];
                pointers[5] = [sx - p5_X, sy - p5_Y];
            }
            pointers.push([sx, sy]);//闭合路径
            console.log(pointers);
            let path = '';
            let arrowObj = null;
            pointers.forEach((ele, index) => {
                if (index === 0) {
                    path += `M ${ele[0]} ${ele[1]} `;
                } else {
                    path += `L ${ele[0]} ${ele[1]} `;
                }
            });

            arrowObj = new fabric.Path(path, {
                stroke: _this.shapeColor,
                fill: _this.shapeColor,
                strokeWidth: _this.penWidth,
                lockScalingX: true,//禁止横向缩放
                lockScalingY: true//禁止纵向缩放
            })
            arrowObj.setControlsVisibility({
                bl: false,
                br: false,
                mb: false,
                ml: false,
                mr: false,
                mt: false,
                tl: false,
                tr: false
            });

            this.canvas.add(arrowObj);
            //添加箭头数据到缓存
            this.data.push({
                id: generateRandom(),
                type: this.shape,
                data: [].concat(pointers),
                canvasObj: arrowObj
            });
            console.log(arrowObj);
            return arrowObj;
        },
        createRect: function () {//创建矩形
            let left = this.sx - this.dx > 0 ? this.dx : this.sx;
            let top = this.sy - this.dy > 0 ? this.dy : this.sy;
            let rect = new fabric.Rect({
                left: left,
                top: top,
                originX: 'left',
                originY: 'top',
                width: Math.abs(this.dx - this.sx),
                height: Math.abs(this.dy - this.sy),
                angle: 0,
                stroke: this.shapeColor,
                strokeWidth: this.penWidth,
                fill: this.color,
                transparentCorners: false
            });

            this.canvas.add(rect).setActiveObject(rect);
            return rect;
        },
        invalidPainting() {
            return Math.abs(this.dx - this.sx) < 10 || Math.abs(this.dy - this.sy) < 10;
        },
        isPositive: function (compareX) {
            if (compareX) {
                return this.dx - this.sx;
            }
            return this.dy - this.sy;
        },
        addColorPicker: function () {
            let _this = this;
            let div = document.createElement('div');
            let input = document.createElement('input');
            div.className = 'draw-color-picker';
            input.type = 'color';
            input.value = "#ff0000";
            input.addEventListener('change', function (evt) {
                _this.colorChoose(evt.target.value);
            });
            div.appendChild(input);
            document.querySelector('#' + _this.drawBoard).parentNode.appendChild(div);
        },
        addPens: function () {
            let _this = this;
            if (this.pens && this.pens.length > 0) {
                let ul = document.createElement('ul');
                ul.className = 'draw-pens';
                this.pens.forEach((ele, index) => {
                    let li = document.createElement('li');
                    li.className = 'pen' + (index === 0 ? ' active' : '');
                    li.style.width = li.style.height = ele.width * 2 + 'px';
                    li.addEventListener('click', function (evt) {
                        _this.pensChoose(ele.width, li);
                    });
                    ul.appendChild(li);
                });
                document.querySelector('#' + _this.drawBoard).parentNode.appendChild(ul);
            }
        },
        addTools: function () {
            let _this = this;
            if (this.tools && this.tools.length > 0) {
                let ul = document.createElement('ul');
                ul.className = 'draw-tools';
                this.tools.forEach((ele, index) => {
                    let li = document.createElement('li');
                    li.className = 'tool' + (index === 0 ? ' active' : '');
                    li.textContent = ele.text;
                    li.addEventListener('click', function (evt) {
                        _this.shapeChoose(ele.value, li);
                    });
                    ul.appendChild(li);
                });
                document.querySelector('#' + _this.drawBoard).parentNode.appendChild(ul);
            }
        },
        colorChoose: function (value) {
            this.shapeColor = value;
            console.log(value);
        },
        shapeCreator: function (options) {//添加形状
            if (this.status !== 'drawing' || this.invalidPainting()) {
                return;
            }

            if (this.mode === 'realTime' && this.activeShape) {
                this.canvas.remove(this.activeShape);
            }

            switch (this.shape) {
                case 'rect':
                    this.activeShape = this.createRect();
                    break;
                case 'arrow':
                    this.activeShape = this.createArrow();
                    if (typeof this.arrowEnd === 'function') {
                        this.arrowEnd();
                    }
                    break;
                case 'text':
                    this.activeShape = this.createText();
                    break;
                case 'image':
                    this.createImage();
                    break;
                case 'brush':
                    break;
            }
        },
        pensChoose: function (value, dom) {
            this.penWidth = this.canvas.freeDrawingBrush.width = value;
            dom.className = 'pen active';
            dom.parentNode.querySelectorAll('.pen').forEach(ele => {
                if (ele !== dom) {
                    ele.className = 'pen';
                }
            });
        },
        shapeChoose: function (type, dom) {//选择形状类型
            this.shape = type;
            switch (this.shape) {
                case 'rect':
                case 'arrow':
                case 'text':
                    this.canvas.isDrawingMode = false;
                    break;
                case 'brush':
                    this.canvas.isDrawingMode = true;
                    this.canvas.freeDrawingBrush.color = this.shapeColor; //设置自由绘颜色
                    this.canvas.freeDrawingBrush.width = this.penWidth;
                    break;
            }
            dom.className = 'tool active';
            dom.parentNode.querySelectorAll('.tool').forEach(ele => {
                if (ele !== dom) {
                    ele.className = 'tool';
                }
            });
        }
    };

    let init = DrawBoard.fn.init = function (options) {
        let baseConfig = {
            drawBoard: '',//暂时仅支持ID选择器,绑定的canvas标签
            canvas: null,//fabric.canvas
            color: 'rgba(255,255,255,1)',
            height: 500,
            width: 800,
            data: [],//存储画布数据
            tools: [//工具栏
                { value: 'rect', text: '矩形' },
                { value: 'arrow', text: '箭头' },
                { value: 'brush', text: '画笔' }
            ],
            pens: [//画笔宽度
                { width: 1 },
                { width: 3 },
                { width: 5 }
            ],
            mode: 'realTime',//'interval',//模式:实时(realTime)和间隔(interval)
            shape: 'rect',//绘制形状类型
            shapeColor: '#ff0000',
            fontSize: 16,
            activeShape: null,//被画的形状
            selectedObjects: null,//被选中的形状
            penWidth: 1,
            status: null,//画布状态drawing、null
            sx: null,//起始点x坐标
            sy: null,//起始点y坐标
            dx: null,//结束点x坐标
            dy: null//结束点y坐标
        };
        let _this = this;

        options = Object.assign({}, baseConfig, options);
        console.log('配置:', options);

        for (let prop in options) {
            this[prop] = options[prop];
        }
        this.canvas = new fabric.Canvas(this.drawBoard, {

        });
        this.canvas.setHeight(this.height);
        this.canvas.setWidth(this.width);

        this.addTools();
        this.addPens();
        this.addColorPicker();
        this.addContextMenu();
        this.shape = this.tools[0] ? this.tools[0].value : '';
        this.penWidth = this.pens[0] ? this.pens[0].width : 1;

        //绑定画板事件
        this.canvas.on("mouse:down", function (options) {
            _this.sx = options.pointer.x;
            _this.sy = options.pointer.y;
            if (!_this.selectedObjects) {
                _this.status = 'drawing';
            }
        });

        this.canvas.on("mouse:move", function (options) {
            _this.dx = options.pointer.x;
            _this.dy = options.pointer.y;
            if (_this.mode === 'realTime') {
                _this.shapeCreator(options);
            }
        });

        this.canvas.on("mouse:up", function (options) {
            if (_this.mode === 'interval') {
                _this.shapeCreator(options);
            }
            _this.activeShape = null;
            _this.status = null;
        });

        this.canvas.on("selection:created", function (options) {
            _this.selectedObjects = options.selected;
        });

        this.canvas.on("selection:updated", function (options) { });

        this.canvas.on("selection:cleared", function (options) {
            _this.selectedObjects = null;
        });

        this.canvas.on("object:moved", function (options) {
            console.log('平移', options);
            if (options.target.isType('path')) {//箭头
                //坐标平移变换
                //target.translateX、target.translateY 表示被变换对象中心点的坐标
                //target.pathOffset.x、target.pathOffset.y 表示被变换对象刚创建时的中心点坐标
                let target = options.target;
                let offsetX = target.translateX - target.pathOffset.x;
                let offsetY = target.translateY - target.pathOffset.y;
                let path = target.path;
                let arrowObj = _this.data[_this.data.length - 1];
                path.forEach((ele, index) => {
                    arrowObj.data[index][0] = ele[1] + offsetX;
                    arrowObj.data[index][1] = ele[2] + offsetY;
                });
                if (typeof _this.arrowUpdate === 'function') {
                    _this.arrowUpdate();
                }
            }

        });

        this.canvas.on("object:moving", function (options) {

        });

        this.canvas.on("object:rotating", function (options) {

        });

        this.canvas.on("object:rotated", function (options) {
            console.log('旋转', options);
            //坐标旋转变换
        });

        this.canvas.on("object:scaling", function (options) {

        });

        this.canvas.on("object:scaled", function (options) {
            console.log('缩放', options);
        });
    };

    // Give the init function the DrawBoard prototype for later instantiation
    init.prototype = DrawBoard.fn;//共享原型设计

    DrawBoard.extend = DrawBoard.fn.extend = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {

                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (isPlainObject(copy) ||
                        (copyIsArray = Array.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = DrawBoard.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    DrawBoard.fn.extend({
        remove: function () {//移除
            if (this.selectedObjects) {
                this.selectedObjects.forEach(ele => {
                    this.canvas.remove(ele);
                    console.log(ele.toString());
                });
                console.log(this.data)
            }
        },
        addContextMenu: function () {//添加右键菜单
            let timer;
            let menu;
            document.oncontextmenu = (evt) => {
                clearTimeout(timer);
                let _this = this;
                let event = evt || window.event;
                let sX = event.clientX;
                let sY = event.clientY;
                if (menu) {
                    menu.style.display = 'block';
                } else {
                    let menuItem = document.createElement('li');
                    menu = document.createElement('ul');
                    menuItem.className = 'context-menu-item';
                    menuItem.textContent = '删除';
                    menu.className = 'draw-context-menu';
                    menuItem.addEventListener('click', function (ev) {
                        menu.style.display = 'none';
                        clearTimeout(timer);
                        _this.remove();
                    });
                    menu.appendChild(menuItem);
                    document.querySelector('#' + _this.drawBoard).parentNode.appendChild(menu);
                }

                menu.style.left = sX + 'px';
                menu.style.top = sY + 'px';
                timer = setTimeout(function () {
                    menu.style.display = 'none';
                }, 2000);
                return false;
            }
        }
    });

    // Map over DrawBoard in case of overwrite
    let _DrawBoard = window.DrawBoard;

    DrawBoard.noConflict = function (deep) {
        if (deep && window.DrawBoard === DrawBoard) {
            window.DrawBoard = _DrawBoard;
        }
        return DrawBoard;
    };

    // Expose DrawBoard, even in AMD
    // (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
    // and CommonJS for browser emulators (#13566)
    if (!noGlobal) {
        window.DrawBoard = DrawBoard;
    }

    return DrawBoard;

});