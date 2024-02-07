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
    let textSelf = childNode.text;
    if (defaultTagRE.test(textSelf)) {
      //包括{{}}
      let lastIndex = 0; //文本的最后一个下标
      let matchStr;
      let tokens = [];
      defaultTagRE.lastIndex = 0; //正则表达式的检测下标
      while ((matchStr = defaultTagRE.exec(textSelf))) {
        let currentIndex = matchStr.index; //记录当前匹配元素的index
        //如果 当前的索引大于上一次记录的索引 说明中间有非{{}}的文本
        if (currentIndex > lastIndex)
          tokens.push(JSON.stringify(textSelf.slice(lastIndex, currentIndex)));
        tokens.push(`_s(${matchStr[1].trim()})`); //是花括号的内容就进行_s包装下
        lastIndex = currentIndex + matchStr[0].length;
      }
      //这部分是匹配花括号之后部分的普通文本
      if (lastIndex < textSelf.length)
        tokens.push(JSON.stringify(textSelf.slice(lastIndex)));
      return `_v(${tokens.join("+")})`;
    } else {
      //单纯的文本 没有{{}}
      return `_v(${JSON.stringify(textSelf)})`;
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
  let codeResult = codeGen(ast);
  codeResult = `with(this){return ${codeResult}}`;
  const render = new Function(codeResult);
  return render;
}
