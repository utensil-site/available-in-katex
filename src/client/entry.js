require('babel/polyfill');
require('./vendor/bootstrap-3.3.5/css/bootstrap.min.css');
require('./assets/less/index.less');
require('script!./vendor/jquery.min.js');
require('script!./vendor/bootstrap-3.3.5/js/bootstrap.min.js');

var mathjax_all_symbols = require('../../data/mathjax-all-symbols.csv');
var katex_all_functions = require('../../data/katex-wiki-support-functions.csv');

_.remove(katex_all_functions, function (katex_row) {
  return _.findIndex(mathjax_all_symbols, function (mathjax_row) {
    return katex_row.symbol == mathjax_row.symbol;
  }) != -1;
});

console.log(mathjax_all_symbols);
console.log(katex_all_functions);

var CLASSES = ['info', 'success', 'danger'];

function show_only(klass) {
  _.forEach(CLASSES, function (k) {
    $('#symbol-table .' + k).parent('tr').hide();
  });

  $('#symbol-table .' + klass).parent('tr').show();
}

$(document).ready(function () {
  var $table = $('<table class="table table-bordered" id="symbol-table"></table>');
  var $tbody = $('<tbody></tbody>');

  var total = {
    ok: 0,
    error: 0,
    example: 0
  };

  _.forEach(mathjax_all_symbols.concat(katex_all_functions), function (row) {
    var symbol = row.symbol;
    var $tr = $('<tr></tr>');
    var TD = '<td></td>';

    $tr.append($(TD).text(symbol)).append($(TD).text(symbol));
    $tbody.append($tr);

    var katex_symbol_dom = $('td', $tr).get(0);
    var katex_render_dom = $('td', $tr).get(1);
    var $katex_render_dom = $(katex_render_dom);

    try {
      if (!_.isEmpty(row.example)) {
        //data-toggle="tooltip" data-placement="left"
        $katex_render_dom.tooltip({
          placement: 'right',
          title: row.example
        });
        katex.render(row.example, katex_render_dom, { displayMode: true });
        $katex_render_dom.addClass('info');
        total.example += 1;
      } else {
        katex.render(symbol, katex_render_dom, { displayMode: true });
        $katex_render_dom.addClass('success');
        total.ok += 1;
      }
    } catch(e) {
      total.error += 1;
      $katex_render_dom.addClass('danger').css({
        'font-size': 'smaller',
        'color': 'grey'
      });
      //if(!e instanceof katex.ParseError) {
        $katex_render_dom.text(e.toString());
      //}
    }
  });

  $table.append($tbody);

  $('.container').append(
    $('<div class="alert alert-success symbol-stat" role="alert"></div>').text('' + total.ok + ' symbols successfully rendered by itself.').click(function () {
      show_only('success');
    })
  ).append(
    $('<div class="alert alert-info symbol-stat" role="alert"></div>').html('' + total.example + ' functions successfully rendered by providing an example(mostly from Dr. Carol JVF Burns\'s <a href="http://www.onemathematicalcat.org/MathJaxDocumentation/TeXSyntax.htm">TEX Commands available in MathJax</a>).').click(function () {
      show_only('info');
    })
  ).append(
    $('<div class="alert alert-danger symbol-stat" role="alert"></div>').html('' + total.error + ' symbols/functions failed to render. <a href="https://github.com/Khan/KaTeX/blob/master/CONTRIBUTING.md">Help KaTeX to add them.</a>').click(function () {
      show_only('danger');
    })
  ).append($table);
});
