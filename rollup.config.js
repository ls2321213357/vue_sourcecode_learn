//rollup 可以默认导出一个对象 作为打包的配置文件
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
export default {
  input: "./src/index.js", //入口
  output: {
    file: "./dist/vue.js", //出口
    name: "Vue", //全局的global.vue
    format: "umd", //esm es6模块 commonjs模块 iife自执行函数 umd(兼容commonjs和amd)
    sourcemap: true, //希望可以调试源代码
  },
  //所有插件都是函数  直接执行就行
  plugins: [
    babel({
      exclude: "node_modules/**", //排除node_modules
    }),
    resolve(),
  ],
};
