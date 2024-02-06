//     多数组方法进行重写

import { isObject } from "./index";

//拷贝一份新的数组原型出来 以免去破坏数组原型的原本方法
const arrProto = Array.prototype;
export const newArrayProto = Object.create(arrProto);
//列举能修改原数组的方法
const arrMethods = [
  "push",
  "pop",
  "reverse",
  "splice",
  "shift",
  "unshift",
  "sort",
];
for (let i = 0; i < arrMethods.length; i++) {
  newArrayProto[arrMethods[i]] = function (...args) {
    //这里重写了数组的方法
    const resultFun = arrProto[arrMethods[i]].apply(this, args); //内部依然调用数组的原来的方法
    //如果args参数是引用类型的话 那么依然要进行劫持
    let insertItem;
    let ob = this.__ob__;
    switch (arrMethods[i]) {
      case "push":
      case "unshift":
        insertItem = args;
        break;
      case "splice":
        //如果是添加元素并且添加的是对象时
        if (args[1] === 0) insertItem = args.slice(2);
        break;
      default:
        break;
    }
    if (insertItem.length > 0) {
      for (let n = 0; n < insertItem.length; n++) {
        if (isObject(insertItem[n])) ob.walk(insertItem[n]);
      }
    }
    return resultFun;
  };
}
