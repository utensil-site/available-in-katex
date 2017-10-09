require('babel/polyfill');
require('./vendor/bootstrap-3.3.5/css/bootstrap.min.css');
require('./assets/less/index.less');
require('script!./vendor/jquery.min.js');
require('script!./vendor/bootstrap-3.3.5/js/bootstrap.min.js');

// http://www.javascriptkit.com/javatutors/loadjavascriptcss2.shtml
function createjscssfile(filename, filetype){
	if (filetype=="js"){ //if filename is a external JavaScript file
		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", filename)
	}
	else if (filetype=="css"){ //if filename is an external CSS file
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	return fileref
}

function replacejscssfile(oldfilename, newfilename, filetype){
	var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist using
	var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
	var allsuspects=document.getElementsByTagName(targetelement)
	for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
		if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename)!=-1){
			var newelement=createjscssfile(newfilename, filetype)
			allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i])
		}
	}
}

const PKG = 'Khan';
const REPO = 'KaTeX';
var old_css = '//khan.github.io/KaTeX/bower_components/katex/dist/katex.min.css';
var old_js = '//khan.github.io/KaTeX/bower_components/katex/dist/katex.min.js';

import GitHub from 'github-api';
const gh = new GitHub();

const repo = gh.getRepo(PKG, REPO);

repo.listReleases().then((o) => {
  console.log(o);

  var tag_name = o.data[0].tag_name;
  var base_url = `//unpkg.com/katex@${tag_name}`;
  var latest_css_url = `${base_url}/dist/katex.min.css`;
  var latest_js_url = `${base_url}/dist/katex.min.js`;

  replacejscssfile(old_css, latest_css_url, 'css');
  replacejscssfile(old_js, latest_js_url, 'js');

  function checked_render() {
    console.log('checked_render');
    katex = (katex || {}).default;
    if (!on_render()) {
      setTimeout(checked_render, 200);
    }
  } 

  setTimeout(checked_render, 200);
});

var mathjax_all_symbols = require('../../data/mathjax-all-symbols.csv');
var katex_all_functions = require('../../data/katex-wiki-support-functions.csv');

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

var CLASSES = ['info', 'success', 'danger'];

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
    error: 0,
    example: 0
  };

  _.forEach(mathjax_all_symbols.concat(katex_all_functions), function (row) {
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
    $('<div class="alert alert-danger symbol-stat" role="alert"></div>').html('' + total.error + ' symbols/functions failed to render. <a href="https://github.com/Khan/KaTeX/blob/master/CONTRIBUTING.md">Help KaTeX to add them.</a>').click(function () {
      toggle_only('danger');
    })
  ).append($table);

  return true;
};

window.on_render = on_render;

$(document).ready(on_render);
