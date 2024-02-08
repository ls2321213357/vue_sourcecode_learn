import { createElementVNode, createTextVNode } from "./vdom";

export function initLifeCycle(Vue) {
  //处理标签中的节点
  function _c(...args) {
    createElementVNode(this, ...args);
  }
  //处理render中的文本节点
  function _v(text) {
    createTextVNode(this, text);
  }
  //解析{{}}中的变量
  function _s(value) {
    return JSON.stringify(value);
  }
  //生成虚拟dom
  function _render() {
    const { render } = this.$options;
    console.log(render);
    return render.call(this);
  }
  //将虚拟dom转换成真实dom
  function _update() {}
  Vue.prototype._c = _c;
  Vue.prototype._s = _s;
  Vue.prototype._v = _v;
  Vue.prototype._render = _render;
  Vue.prototype._update = _update;
}

export function mountedComponent(vm, dom) {
  /* 
    1、执行render方法 生成虚拟节点 虚拟dom
    2、根据虚拟dom生成真实dom
    3、插入到el元素中
    */
  vm._update(vm._render());
}
/* 
Vue执行流程:
    1.构建响应式数据  2.进行模板解析转换成ast语法树 3.将ast语法树转换成render函数 
    4.后续每次更新只需要执行render函数即可 5.render函数会生成虚拟dom 6.根据虚拟dom生成真实dom

*/
