const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); //他匹配的分组是一个开始标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //他匹配的分组是结束标签的名字
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
const startTagClose = /^\s*(\/?)>/;

/**
 *
 * @param {string} html
 */
export function parseHtml(html) {
  function advance(num) {
    //进行截取
    html = html.substring(num);
  }
  /////在这里需要把返回的标签整理成一个树形结构  可以利用栈的结构来实现
  const START_TYPE = 1; //开始标签类型
  const TEXT_TYPE = 3; //文本类型
  let root = null; //根节点
  const stack = []; //栈
  let startStack; //永远指向栈中的最后一个元素
  //生成树形结构
  function createASTElement(tag, attrs) {
    return {
      tag,
      attrs,
      type: START_TYPE,
      children: [],
      parent: null,
    };
  }
  //开始标签处理函数
  function startHandler(tag, attrs) {
    const node = createASTElement(tag, attrs); //创造一个AST节点
    if (!root) root = node;
    stack.push(node); //把节点推到栈里
    //如果存在了元素  就让当前的元素父节点指向栈顶元素 并把当前元素加入到栈顶元素的子节点集合中
    if (startStack) {
      node.parent = startStack;
      startStack.children.push(node);
    }
    startStack = node; //更新指向的位置
  }
  //文本处理函数
  function textHandler(text) {
    text = text.replace(/\s/g, ""); //如果是空就替换
    //直接加到子节点上
    text &&
      startStack.children.push({
        text,
        type: TEXT_TYPE,
        parent: startStack,
      });
  }
  //结束标签处理
  function endHandler() {
    stack.pop(); //遇到结束标签就进行弹出操作
    startStack = stack[stack.length - 1];
  }
  // 进行模板解析
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const matchObj = {
        tagName: start[1], //标签名
        attrs: [],
      };
      //解析标签完成以后 就把这个包含的表单字符串从原来的整体模板字符串中删掉
      advance(start[0].length);
      //如果匹配的不是开始标签的那个结束标签的位置 就一直匹配下去
      let attrs, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attrs = html.match(attribute))
      ) {
        //匹配的是标签上的属性
        attrs && advance(attrs[0].length);
        matchObj.attrs.push({
          name: attrs[1],
          //属性可能是第 3 4 5项
          value: attrs[3] || attrs[4] || attrs[5] || true,
        });
      }
      end && advance(end[0].length);
      return matchObj;
    }
  }
  while (html) {
    //如果textEnd=0 则说明是一个开始标签或者结束标签 如果>0则说明是文本的结束位置
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      const startTagText = parseStartTag(); //开始标签的解析结果
      if (startTagText) {
        startHandler(startTagText.tagName, startTagText.attrs);
        continue; //如果存在开始的标签了  那就跳出当前继续往下走
      }
      let endTagText = html.match(endTag); //遇到结束标签就处理
      if (endTagText) {
        endHandler(endTagText[1]);
        //直接把结束标签删除
        advance(endTagText[0].length);
        continue;
      }
    } else if (textEnd > 0) {
      let textHtml = html.substring(0, textEnd); //html解析的文本部分
      if (textHtml) {
        textHandler(textHtml);
        advance(textHtml.length); //匹配到然后删除
      }
    }
  }
  return root;
}
