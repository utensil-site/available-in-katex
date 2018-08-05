var fs = require('fs');
var MarkdownIt = require('markdown-it');
var markdownItAST = require('markdown-it-ast');
var { markdownItTable } = require('markdown-it-table');

var md = new MarkdownIt();
// md.use(markdownItTable);
var renderer = md.renderer;

var supportTableMd = fs.readFileSync('../../data/katex-doc-support-table.md', 'utf-8');

// supportTableMd = supportTableMd.replace(/<span style="color:firebrick;">Not supported<\/span>/g, 'Not supported');

// console.log(supportTableMd);

var env = {};
var tokens = md.parse(supportTableMd, env);

// console.log(tokens);

var ast = markdownItAST.makeAST(tokens);

// console.log(ast);

var result = 'symbol,example,note\n';

ast.forEach(function (node) {
  if (node.nodeType == 'table') {
    var rows = node.children[1]/* tbody */.children;
    rows.forEach(function (row) {
      var tds = row.children;
      var isNotSupported = false;
      tds.forEach(function (td, index) {
        // console.log(td.content);
        switch (index) {
          case 0:
            var symbol = (td.children[0].content || '').replace(/\\([^a-zA-Z0-9])/g, '$1');
            if(/,/.test(symbol)) {
              result += '"' + symbol + '",';
            } else {
              result += symbol + ',';
            }
            break;
          // case 1:
          //   var formula = (td.children[0].content || '');
          //   if (/Not supported/.test(formula)) {
          //     isNotSupported = true;
          //   }
          //   break;
          case 2:
            var formula = (td.children[0].content || '').replace(/<br>/g, '\n')
            .replace(/&nbsp;/g, ' ').replace(/<[/]?code>/g, '').replace(/`/g, '');
            if(/Issue|PR|Deprecated|In master|see |See |Non standard/.test(formula)) {
              // console.error(formula);
              formula = formula.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank'>$1</a>");
              result += ',"' + formula + '"\n';
            } else if(/,|\n/.test(formula)) {
              result += '"' + formula + '"\n';
            } else {
              result += formula + '\n';
            }
            
          default:
            break;
        }
        // console.log(renderer.render(td.children));
      });

    });
  }
});

fs.writeFileSync('../../data/katex-doc-support-table.csv', result);

// md.renderer.rules