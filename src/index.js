import { initMixinVue } from "./init";
import { initLifeCycle } from "./liftCycle";
function Vue(options) {
  this._init(options);
}
initMixinVue(Vue); //挂载了init
initLifeCycle(Vue); //挂载生命周期部分
export default Vue;
