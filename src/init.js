import { compileToFunction } from "./compiler";
import { initState } from "./initState";
import { mountedComponent } from "./liftCycle";

//用于在vue的原型对象上挂在init方法
export function initMixinVue(Vue) {
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
    let el = document.querySelector(dom); //拿到模板节点
    const { $options } = this;
    if (!$options.render) {
      //如果模板中没写render
      let template;
      if (el) {
        //如果获取到了el 这个dom元素
        if (!$options.template) {
          //如果模板中没写template
          template = el.outerHTML; //得到的是html字符串,当前节点包括其子节点
        } else {
          //模板中写了template
          template = $options.template;
        }
        if (template) {
          //在这里需要进行编译
          const render = compileToFunction(template);
          $options.render = render;
        }
      }
    } else {
      //如果写了render
    }
    //挂载到组件实例上
    mountedComponent(this, el);
  }
  Vue.prototype.$mount = mount;
  Vue.prototype._init = init; //挂载init方法
  //script 标签引入的vue.global.js 这个编译过程在浏览器运行的
  // runtime(运行时) 是不包含模板编译的,整个比那一是打包的时候通过loader来转义  .vue  文件的
}
