require('babel/polyfill');
require('./vendor/bootstrap-3.3.5/css/bootstrap.min.css');
require('./assets/less/index.less');
require('script!./vendor/jquery.min.js');
require('script!./vendor/bootstrap-3.3.5/js/bootstrap.min.js');

var mathjax_all_symbols = require('../../data/mathjax-all-symbols.csv');
var katex_all_functions = require('../../data/katex-wiki-support-functions.csv');
var katex_doc_support_table = require('../../data/katex-doc-support-table.csv');

var mathjax_all_symbols_to_remove = {};
var katex_all_functions_to_remove = {};

_.remove(katex_all_functions, function (katex_row) {
  return _.findIndex(mathjax_all_symbols, function (mathjax_row) {
    var diff = {
      mathjax_row: mathjax_row,
      katex_row: katex_row
    };
    if(katex_row.symbol == mathjax_row.symbol) {
      if(_.isEmpty(katex_row.example)) {
        if (!_.isEmpty(mathjax_row.example)) {
          katex_all_functions_to_remove[katex_row.symbol] = diff;
        }
        return true;
      } else {
        mathjax_all_symbols_to_remove[mathjax_row.symbol] = diff;
        return false;
      }
    } else {
      return false;
    }
  }) != -1;
});

_.remove(mathjax_all_symbols, function (mathjax_row) {
  return mathjax_all_symbols_to_remove[mathjax_row.symbol] != null;
});

console.log(mathjax_all_symbols);
console.log(katex_all_functions);
console.log(mathjax_all_symbols_to_remove);
console.log(katex_all_functions_to_remove);

var CLASSES = ['info', 'success', 'warning', 'danger'];

function toggle_only(klass) {
  _.forEach(CLASSES, function (k) {
    var tr = $('#symbol-table .' + k).parent('tr');

    if (k == klass) {
      tr.show();
    } else {
      tr.toggle();
    }
  });
}

function on_render() {
  if (katex == null) {
    return false;
  }

  var $table = $('<table class="table table-bordered" id="symbol-table"></table>');
  var $thead = $('<thead></thead>');
  var TR = '<tr></tr>';
  var TD = '<td></td>';
  var TH = '<th></th>';

  $thead.append(
    $(TR).
      append($(TH).html('Symbol/Function<br /><small class="text-muted">&nbsp;&nbsp;&nbsp;&nbsp;</small>')).
      append($(TH).html('Rendered<br /><small class="text-muted">or the exception if failed</small>')).
      append($(TH).html('Example<br /><small class="text-muted">&nbsp;&nbsp;&nbsp;&nbsp;</small>'))
  );

  var $tbody = $('<tbody></tbody>');

  var total = {
    ok: 0,
    warning: 0,
    error: 0,
    example: 0
  };

  var all_functions = mathjax_all_symbols.concat(katex_all_functions);

  var notes_map = {};

  all_functions = _.unionBy(all_functions, katex_doc_support_table, 'symbol');
  
  katex_doc_support_table.forEach(function (row) {
    if (!_.isEmpty(row.note)) {
      notes_map[row.symbol] = row.note;
    }
  });

  all_functions.forEach(function (row) {
    var note = notes_map[row.symbol];
    if (note) {
      row.note = note;
      console.log(row);
    }
  });

  // all_functions = katex_doc_support_table;

  _.forEach(all_functions, function (row) {
    var symbol = row.symbol;
    var $tr = $(TR);

    $tr.
      append($(TD).
        addClass('symbol').
        text(symbol)).
      append($(TD).
        addClass('rendered').
        text(symbol)).
      append($(TD).
        addClass('example').
        append(
            _.isEmpty(row.example) ? 
            '' : $('<pre></pre>').
                  append($('<code></code>').text(row.example))));

    $tbody.append($tr);

    var katex_symbol_dom = $('td.symbol', $tr).get(0);
    var katex_render_dom = $('td.rendered', $tr).get(0);
    var katex_example_dom = $('td.example', $tr).get(0);
    var $katex_render_dom = $(katex_render_dom);

    try {
      if (!_.isEmpty(row.example)) {
        katex.render(row.example, katex_render_dom, { displayMode: true });
        $katex_render_dom.addClass('info');
        total.example += 1;
      } else {
        katex.render(symbol, katex_render_dom, { displayMode: true });
        $katex_render_dom.addClass('success');
        total.ok += 1;
      }
    } catch(e) {
      

      if (row.note) {
        total.warning += 1;
        $katex_render_dom.addClass('warning').css({
          'color': 'grey'
        });
        $katex_render_dom.html(row.note);
      } else {
        total.error += 1;
        $katex_render_dom.addClass('danger').css({
          'font-size': 'smaller',
          'color': 'grey'
        });
        $katex_render_dom.text(e.toString());
      }
    }
  });

  $table.append($thead).append($tbody);

  $('.container').empty();
  $('.container').append(
    $('<div class="alert alert-success symbol-stat" role="alert"></div>').text('' + total.ok + ' symbols successfully rendered by itself.').click(function () {
      toggle_only('success');
    })
  ).append(
    $('<div class="alert alert-info symbol-stat" role="alert"></div>').html('' + total.example + ' functions successfully rendered by providing an example(mostly from Dr. Carol JVF Burns\'s <a href="http://www.onemathematicalcat.org/MathJaxDocumentation/TeXSyntax.htm">TEX Commands available in MathJax</a>).').click(function () {
      toggle_only('info');
    })
  ).append(
    $('<div class="alert alert-warning symbol-stat" role="alert"></div>').html('' + total.warning + ' symbols/functions failed to render but has some related work or an explanation. <a href="https://github.com/Khan/KaTeX/blob/master/CONTRIBUTING.md">Help KaTeX to improve them.</a>').click(function () {
      toggle_only('warning');
    })
  ).append(
    $('<div class="alert alert-danger symbol-stat" role="alert"></div>').html('' + total.error + ' symbols/functions failed to render. <a href="https://github.com/Khan/KaTeX/blob/master/CONTRIBUTING.md">Help KaTeX to add them.</a>').click(function () {
      toggle_only('danger');
    })
  ).append($table);

  return true;
};

window.on_render = on_render;

$(document).ready(on_render);
