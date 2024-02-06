import { observe, isObject } from "./observe/index";

//初始化状态
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}

//初始化data
function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data;
  //在实例上挂在一下data
  vm._data = data;
  //对对象进行劫持
  observe(data);
  //进行循环遍历
  //将vm._data用vm来进行代理 这样的话就可以通过vm直接获取属性了
  for (let k in data) {
    //对_data对象的所有属性进行重新代理
    proxyHandler(vm, "_data", k);
  }
}

//代理操作
function proxyHandler(vm, target, k) {
  Object.defineProperty(vm, k, {
    get() {
      return vm[target][k];
    },
    set(newValue) {
      if (vm[target][k] !== newValue) {
        vm[target][k] = newValue;
      }
    },
  });
}
