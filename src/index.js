import { initMixinVue } from "./init";
function Vue(options) {
  this._init(options);
}
initMixinVue(Vue); //挂载了init
export default Vue;
