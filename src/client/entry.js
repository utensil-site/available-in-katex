require('babel/polyfill');
require('./vendor/bootstrap-3.3.5/css/bootstrap.min.css');
require('./assets/less/index.less');
require('script!./vendor/jquery.min.js');
require('script!./vendor/bootstrap-3.3.5/js/bootstrap.min.js');

var mathjax_all_symbols = require('../../data/mathjax-all-symbols.csv');

console.log(mathjax_all_symbols);

$(document).ready(function () {
  var $table = $('<table class="table table-bordered" id="symbol-table"></table>');
  var $tbody = $('<tbody></tbody>');

  _.forEach(mathjax_all_symbols, function (row) {
    var symbol = row.symbol;
    var $tr = $('<tr></tr>');
    var TD = '<td></td>';

    $tr.append($(TD).text(symbol)).append($(TD).text(symbol));
    $tbody.append($tr);

    var target_dom = $('td', $tr).get(1);
    var $target_dom = $(target_dom);

    try {
      katex.render(symbol, target_dom, { displayMode: true });
      $target_dom.addClass('success');
    } catch(e) {
      $target_dom.addClass('danger');
      if(!e instanceof katex.ParseError) {
        $target_dom.text(e.toString());
      }
    }
  });

  $table.append($tbody);

  $('.container').append($table);
});
