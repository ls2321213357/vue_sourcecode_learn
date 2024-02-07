import { parseHtml } from "./parseHtml";
//解析标签上的属性
function genProps(attrs) {
  let str = "";
  for (let attr of attrs) {
    if (attr.name === "style") {
      const attrObj = {};
      //当为style属性的时候 需要进行分别包装
      attr.value.split(";").forEach((item) => {
        const [key, value] = item.split(":");
        attrObj[key] = value;
      });
      attr.value = attrObj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}
//匹配文本{{}} 因为有g 所以需要将lastIndex = 0 回到原位一下
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
//解析子节点
function gen(childNode) {
  if (childNode.type === 1) {
    //如果是html标签 就递归执行codeGen
    return codeGen(childNode);
  } else {
    //是文本内容  如果匹配成功  是包括{{}} 的
    // defaultTagRE.lastIndex = 0;
    if (defaultTagRE.test(childNode.text)) {
      console.log(childNode.text);
      let resultStr;
      console.log(defaultTagRE.exec(childNode.text));
      // while (defaultTagRE.exec(childNode.text)) {
      //   console.log(12);
      //   console.log(resultStr);
      // }

      // let resText = childNode.text[0].replace("{{", "_s(").replace("}}", ")");
      // return `_v(${resText})`;
    } else {
      return `_v(${JSON.stringify(childNode.text)})`;
    }
  }
}
//将ast拼接成一个字符串
function codeGen(ast) {
  const children = ast.children.map((child) => gen(child)).join(",");
  return `_c('${ast.tag}',
  ${ast.attrs.length ? genProps(ast.attrs) : "null"}
  ${ast.children.length ? `,${children}` : ""}
  )`;
}

export function compileToFunction(template) {
  /* 
    1.将template 转换成AST语法树
    2.生成render方法 (render方法返回的结果是 虚拟DOM)
    */
  let ast = parseHtml(template);
  console.log(ast, "ast");
  let codeResult = codeGen(ast);
  console.log(codeResult);
}
