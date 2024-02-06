(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //他匹配的分组是一个开始标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //他匹配的分组是结束标签的名字
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
  var startTagClose = /^\s*(\/?)>/;
  /**
   *
   * @param {string} html
   */
  function parseHtml(html) {
    function advance(num) {
      //进行截取
      html = html.substring(num);
    }
    /////在这里需要把返回的标签整理成一个树形结构  可以利用栈的结构来实现
    var START_TYPE = 1; //开始标签类型
    var TEXT_TYPE = 3; //文本类型
    var stack = []; //栈
    var startStack; //永远指向栈中的最后一个元素
    //生成树形结构
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        attrs: attrs,
        type: START_TYPE,
        children: [],
        parent: null
      };
    }
    //开始标签处理函数
    function startHandler(tag, attrs) {
      var node = createASTElement(tag, attrs); //创造一个AST节点
      stack.push(node); //把节点推到栈里
      //如果存在了元素  就让当前的元素父节点指向栈顶元素 并把当前元素加入到栈顶元素的子节点集合中
      if (startStack) {
        node.parent = startStack;
        startStack.children.push(node);
      }
      startStack = node; //更新指向的位置
    }
    //文本处理函数
    function textHandler(text) {
      text = text.replace(/\s/g, ""); //如果是空就替换
      //直接加到子节点上
      text && startStack.children.push({
        text: text,
        type: TEXT_TYPE,
        parent: startStack
      });
    }
    //结束标签处理
    function endHandler() {
      stack.pop(); //遇到结束标签就进行弹出操作
      startStack = stack[stack.length - 1];
    }
    // 进行模板解析
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var matchObj = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        //解析标签完成以后 就把这个包含的表单字符串从原来的整体模板字符串中删掉
        advance(start[0].length);
        //如果匹配的不是开始标签的那个结束标签的位置 就一直匹配下去
        var attrs, end;
        while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
          //匹配的是标签上的属性
          attrs && advance(attrs[0].length);
          matchObj.attrs.push({
            name: attrs[1],
            //属性可能是第 3 4 5项
            value: attrs[3] || attrs[4] || attrs[5] || true
          });
        }
        end && advance(end[0].length);
        return matchObj;
      }
    }
    while (html) {
      //如果textEnd=0 则说明是一个开始标签或者结束标签 如果>0则说明是文本的结束位置
      var textEnd = html.indexOf("<");
      if (textEnd === 0) {
        var startTagText = parseStartTag(); //开始标签的解析结果
        if (startTagText) {
          startHandler(startTagText.tagName, startTagText.attrs);
          continue; //如果存在开始的标签了  那就跳出当前继续往下走
        }
        var endTagText = html.match(endTag); //遇到结束标签就处理
        if (endTagText) {
          endHandler(endTagText[1]);
          //直接把结束标签删除
          advance(endTagText[0].length);
          continue;
        }
      } else if (textEnd > 0) {
        var textHtml = html.substring(0, textEnd); //html解析的文本部分
        if (textHtml) {
          textHandler(textHtml);
          advance(textHtml.length); //匹配到然后删除
        }
      }
    }
    console.log(startStack);
    // return startStack;
  }
  function compileToFunction(template) {
    /* 
      1.将template 转换成AST语法树
      2.生成render方法 (render方法返回的结果是 虚拟DOM)
      */
    var ast = parseHtml(template);
    console.log(ast);
    //   return template;
  }

  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : String(i);
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  //     多数组方法进行重写


  //拷贝一份新的数组原型出来 以免去破坏数组原型的原本方法
  var arrProto = Array.prototype;
  var newArrayProto = Object.create(arrProto);
  //列举能修改原数组的方法
  var arrMethods = ["push", "pop", "reverse", "splice", "shift", "unshift", "sort"];
  var _loop = function _loop(i) {
    newArrayProto[arrMethods[i]] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //这里重写了数组的方法
      var resultFun = arrProto[arrMethods[i]].apply(this, args); //内部依然调用数组的原来的方法
      //如果args参数是引用类型的话 那么依然要进行劫持
      var insertItem;
      var ob = this.__ob__;
      switch (arrMethods[i]) {
        case "push":
        case "unshift":
          insertItem = args;
          break;
        case "splice":
          //如果是添加元素并且添加的是对象时
          if (args[1] === 0) insertItem = args.slice(2);
          break;
      }
      if (insertItem.length > 0) {
        for (var n = 0; n < insertItem.length; n++) {
          if (isObject(insertItem[n])) ob.walk(insertItem[n]);
        }
      }
      return resultFun;
    };
  };
  for (var i = 0; i < arrMethods.length; i++) {
    _loop(i);
  }

  /**
   *
   * @param {object} data
   */
  function observe(data) {
    //只对对象进行劫持
    if (_typeof(data) !== "object" || data === null) return;
    //说明已经被代理过 所以就不用继续进行代理了
    if (data.__ob__ instanceof Observer) return data.__ob__;
    /* 
    如果一个对象被劫持过 就不需要再次被劫持了 所以需要一个实例来进行判断一下
    
    */
    return new Observer(data);
  }
  //给对象每个属性进行响应式处理
  function defineReactive(target, key, value) {
    if (isObject(value)) observe(value); //如果是嵌套的对象 直接进行递归
    //闭包
    Object.defineProperty(target, key, {
      get: function get() {
        console.log("\u83B7\u53D6\u4E86".concat(key));
        return value;
      },
      set: function set(newVal) {
        console.log("\u8BBE\u7F6E\u4E86".concat(key));
        if (value !== newVal) value = newVal;
      }
    });
  }
  function isObject(obj) {
    return obj !== null && _typeof(obj) === "object";
  }
  var Observer = /*#__PURE__*/function () {
    /* 
      利用object.defineproperty来进行劫持，但是只能劫持对象已有属性 删除或者新增属性是无法监听到的 
      所以写了一些api 如 $set $delete
      */
    function Observer(data) {
      _classCallCheck(this, Observer);
      //给数加了一个标识 如果数据上有__ob__ 则说明这个属性被观测过
      Object.defineProperty(data, "__ob__", {
        value: this
      });
      if (Array.isArray(data)) {
        //如果是数组 就对原型对象上进行重写数组方法 以便进行劫持
        data.__proto__ = newArrayProto;
        // 也要对数组中的引用类型进行劫持
        this.observeArray(data);
      } else {
        //对对象开始劫持 重新定义属性
        this.walk(data);
      }
    }
    //处理对象数据
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        var keyList = Object.keys(data);
        for (var k = 0; k < keyList.length; k++) {
          //开始注入方法
          defineReactive(data, keyList[k], data[keyList[k]]);
        }
      }
      //处理数组中的引用类型
    }, {
      key: "observeArray",
      value: function observeArray(arr) {
        for (var i; i < arr.length; i++) {
          if (isObject(arr[i])) this.walk(arr[i]);
        }
      }
    }]);
    return Observer;
  }();

  //初始化状态
  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }

  //初始化data
  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm) : data;
    //在实例上挂在一下data
    vm._data = data;
    //对对象进行劫持
    observe(data);
    //进行循环遍历
    //将vm._data用vm来进行代理 这样的话就可以通过vm直接获取属性了
    for (var k in data) {
      //对_data对象的所有属性进行重新代理
      proxyHandler(vm, "_data", k);
    }
  }

  //代理操作
  function proxyHandler(vm, target, k) {
    Object.defineProperty(vm, k, {
      get: function get() {
        return vm[target][k];
      },
      set: function set(newValue) {
        if (vm[target][k] !== newValue) {
          vm[target][k] = newValue;
        }
      }
    });
  }

  //用于在vue的原型对象上挂在init方法
  function initMixinVue(Vue) {
    //进行初始化操作
    function init(options) {
      //vue规定 所有$开头的 都是自己定义的属性和方法
      this.$options = options;
      //初始化状态
      initState(this);
      //进行模板挂载操作
      if (options.el) {
        this.$mount(options.el); //实现数据的挂载
      }
    }
    function mount(dom) {
      var el = document.querySelector(dom); //拿到模板节点
      var $options = this.$options;
      if (!$options.render) {
        //如果模板中没写render
        var template = "";
        if (!$options.template) {
          //如果模板中没写template
          if (el) {
            //如果获取到了el 这个dom元素
            template = el.outerHTML; //得到的是html字符串,当前节点包括其子节点
          }
        } else {
          //模板中写了template
          template = $options.template;
        }
        if (template) {
          //在这里需要进行编译
          var render = compileToFunction(template);
          $options.render = render;
        }
      }
      $options.render; //最终就统一成render方法
    }
    Vue.prototype.$mount = mount;
    Vue.prototype._init = init; //挂载init方法
    //script 标签引入的vue.global.js 这个编译过程在浏览器运行的
    // runtime(运行时) 是不包含模板编译的,整个比那一是打包的时候通过loader来转义  .vue  文件的
  }

  function Vue(options) {
    this._init(options);
  }
  initMixinVue(Vue); //挂载了init

  return Vue;

}));
//# sourceMappingURL=vue.js.map
