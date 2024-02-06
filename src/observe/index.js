import { newArrayProto } from "./rewriteArray";

/**
 *
 * @param {object} data
 */
export function observe(data) {
  //只对对象进行劫持
  if (typeof data !== "object" || data === null) return;
  //说明已经被代理过 所以就不用继续进行代理了
  if (data.__ob__ instanceof Observer) return data.__ob__;
  /* 
  如果一个对象被劫持过 就不需要再次被劫持了 所以需要一个实例来进行判断一下
  
  */
  return new Observer(data);
}
//给对象每个属性进行响应式处理
export function defineReactive(target, key, value) {
  if (isObject(value)) observe(value); //如果是嵌套的对象 直接进行递归
  //闭包
  Object.defineProperty(target, key, {
    get() {
      console.log(`获取了${key}`);
      return value;
    },
    set(newVal) {
      console.log(`设置了${key}`);
      if (value !== newVal) value = newVal;
    },
  });
}
export function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
class Observer {
  /* 
    利用object.defineproperty来进行劫持，但是只能劫持对象已有属性 删除或者新增属性是无法监听到的 
    所以写了一些api 如 $set $delete
    */
  constructor(data) {
    //给数加了一个标识 如果数据上有__ob__ 则说明这个属性被观测过
    Object.defineProperty(data, "__ob__", { value: this });
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
  walk(data) {
    const keyList = Object.keys(data);
    for (let k = 0; k < keyList.length; k++) {
      //开始注入方法
      defineReactive(data, keyList[k], data[keyList[k]]);
    }
  }
  //处理数组中的引用类型
  observeArray(arr) {
    for (let i; i < arr.length; i++) {
      if (isObject(arr[i])) this.walk(arr[i]);
    }
  }
}
