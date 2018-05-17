import React from 'react';
import { render, unmountComponentAtNode, renderComponent } from 'react-dom';

var midCache = {};
var midDOMList = {};
window.cardJsonpResolver = function (data) {
	var card = data.cards[Object.keys(data.cards)[0]];
	midCache[card.mid] = card.uname;
	midDOMList[card.mid].forEach(function (item) {
		if (item.state.scriptele != null) {
			item.state.scriptele.remove();
		}
		item.setState({
			scriptele: null,
			sbname: card.uname
		});
	});
	delete midDOMList[card.mid];
};
var revCrc = new Worker('crcRevEng.min.js?ver=171110');
revCrc.onmessage = function (e) {
	let [hash, val] = e.data;
	if (!crcResolveQueue[hash]) return;
	for (let i = 0; crcResolveQueue[hash].length;) {
		let danmaku = crcResolveQueue[hash].shift();
		danmaku.setState({
			sbmid: val
		});
		if (val == -1) {
			danmaku.setState({
				sbmid: '',
				sbname: "*匿名者*"
			});
		}
		else if (midCache[val] != undefined) {
			danmaku.setState({
				sbname: midCache[val]
			})
		} else if (midDOMList[val] != undefined) {
			midDOMList[val].push(danmaku)
		} else {
			midDOMList[val] = [danmaku];
			const script = document.createElement("script");
			script.src = `//account.bilibili.com/api/member/getInfoByMid?mid=${val}&callback=cardJsonpResolver&type=jsonp`;
			script.async = true;

			var scriptele = document.body.appendChild(script);
			danmaku.setState({
				scriptele: scriptele
			});
		}
	}
}
var crcResolveQueue = {};
var Danmaku = React.createClass({
	getInitialState: function () {
		return {
			hovered: false,
			sbmid: "",
			sbname: "",
			fetchingMemberInfo: false,
			scriptele: null
		}
	},
	onMouseOver: function () {
		if (this.state.hovered)
			return;
		this.setState({
			hovered: true
		});
		let hash = this.props.hash;
		if (hash.substr(0, 1) == 'D') {
			this.setState({
				sbname: '*游客*'
			});
			return;
		}
		revCrc.postMessage(hash);
		crcResolveQueue[hash] = crcResolveQueue[hash] || [];
		crcResolveQueue[hash].push(this);
		return;
	},
	render: function () {
		var hoverAnime,
			midClass = this.state.sbname.length > 0 ? 'info_item out' : 'info_item in';
		if (this.state.hovered)
			hoverAnime = <meta />;
		return <div class={this.state.sbname != '' ? 'show-name' : this.state.sbmid != '' ? 'show-mid' : this.state.hovered ? 'show-hash' : ''} onMouseOver={this.onMouseOver} style={{ height: "40px", overflow: "hidden" }} is mid={this.state.sbmid}>
			<a href={this.state.sbmid ? "//space.bilibili.com/" + this.state.sbmid : 'javascript:'} target="view_window" style={{ width: "100%", height: "100%", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="collection-item waves-effect black-text">
				<span style={{ float: "right" }} className="badge grey-text"><span className="info_item">Name: {this.state.sbname}</span><span className="info_item">UID: {this.state.sbmid}</span><span className="info_item">Hash: {this.props.hash}</span><span className="info_item"></span></span>
				{this.props.content}</a>
			{hoverAnime}
		</div>;
	}
});

render(
	<div>
		<div style={{ marginLeft: "20%", width: "60%" }}>
			<div className="col s12">
				<p className="center-on-small-only">{"Content>"}</p>
			</div>
			<div className="collection" id="danmakucore"></div>
		</div>
	</div>,
	document.getElementById('app')
);

render(
	<div>
		<footer className="page-footer grey">
			<div className="footer-copyright">
				<div className="container grey-text text-lighten-2">
					<span>Made by <a className="orange-text text-lighten-3" href="http://moepus.oicp.net/">MoePus</a>　　·　　<a className="grey-text  text-lighten-1" href="http://materializecss.com/">materializecss</a> · <a className="grey-text  text-lighten-1" href="https://www.biliplus.com">biliplus</a></span>
				</div>
			</div>
		</footer>
	</div>,
	document.getElementById('footer')
);

document.head.appendChild(document.createElement('style')).innerHTML = `.collection a.collection-item{overflow:hidden}
span.badge{position:relative;height:160px;display:flex;margin-top:-10px !important;top:-120px;transition:top .3s;flex-direction:column;text-align:right}
.show-hash span.badge{top:-40px}
.show-mid span.badge{top:-40px}
.show-name span.badge{top:0}
span.badge .info_item{flex:1;padding:10px 0}`

function dateString(date, useLocal) {
	return (useLocal ? [date.getFullYear(), date.getMonth() + 1, date.getDate()] : [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]).join('.');
}
var _ = function (type, props, children) {
	var elem = null;
	if (type === "text") {
		return document.createTextNode(props);
	} else {
		elem = document.createElement(type);
	}
	for (var n in props) {
		if (n === "style") {
			for (var x in props.style) {
				elem.style[x] = props.style[x];
			}
		} else if (n === "className") {
			elem.className = props[n];
		} else if (n === "event") {
			for (var x in props.event) {
				elem.addEventListener(x, props.event[x]);
			}
		} else {
			elem.setAttribute(n, props[n]);
		}
	}
	if (children) {
		for (var i = 0; i < children.length; i++) {
			if (children[i] != null)
				elem.appendChild(children[i]);
		}
	}
	return elem;
};

var loaded = 0;
var cid;
var history_pickr;
var history_count;
var xmlFetch = function () {
	cid = $("#fetch_cid").val();
	if (/^[1-9]\d+$/.test(cid) === false) return Materialize.toast('无效cid号', 4000);
	$('#loaded-hint').text('');
	$('#view-history').hide();
	cid = cid | 0;
	loaded = 0;
	$.ajax({
		url: "//comment.bilibili.com/" + cid + ".xml",
		dataType: 'xml',
		success: function (data) {
			$.ajax({
				url: 'https://www.biliplus.com/danmaku/rolldate,'+cid,
				//url: 'http://localhost/danmaku/rolldate,' + cid,
				dataType: 'json',
				success: function (data) {
					$('#view-history').show();
					var dateList = data.map(i => dateString(new Date(i.timestamp * 1e3 + 8 * 3600 * 1e3)));
					history_count = {};
					for (let i = 0; i < data.length; i++) {
						history_count[dateList[i]] = data[i].new;
					}
					history_pickr = flatpickr('#history_pickr', {
						enable: dateList,
						maxDate: dateList[dateList.length - 1],
						minDate: dateList[0],
						dateFormat: 'Y年m月d日',
						disableMobile: true,
						locale: 'zh',
						onDayCreate: function (a, b, c, elem) {
							var dStr = dateString(elem.dateObj, true);
							if (history_count[dStr]) {
								elem.appendChild(_('span', {
									className: 'date_new'
								}, [_('text', history_count[dStr])]));
							}
						},
						onChange: function (dates, dateStr) {
							xmlFetchHistory(new Date(dateString(dates[0], true).replace(/\./g, '/') + ' 00:00:00 +0800').getTime() / 1e3);
						}
					});
					history_pickr.yearElements[0].classList.add('browser-default');
				}
			})
			xmlParse(data);
			$("#progressBar").slideUp();
		},
		error: function () {
			$("#progressBar").slideUp();
		}
	});
	$("#progressBar").slideDown();
}
var xmlFetchHistory = function (ts) {
	$.ajax({
		url: 'https://www.biliplus.com/danmaku/dmroll,'+ ts + ',' + cid,
		//url: 'http://localhost/danmaku/dmroll,'+ ts + ',' + cid,
		dataType: 'xml',
		success: function (data) {
			loaded = ts;
			xmlParse(data);
			$("#progressBar").slideUp();
		},
		error: function () {
			$("#progressBar").slideUp();
		}
	});
	$("#progressBar").slideDown();
}
var warehouse;
var xmlParse = function (xmlContent) {
	$('#loaded-hint').text('已加载'+(loaded?(' '+dateString(new Date(loaded * 1e3), true)+' 的'):'最新')+'弹幕（'+$(xmlContent).find("d").length+'条）');
	warehouse = new Array();
	$(xmlContent).find("d").each(function (i) {
		var p = $(this).attr("p");
		var dAttrs = p.split(",");;
		var text = $(this).text();
		var id = "id" + Math.random().toString(16).slice(2);
		warehouse.push({ content: text, hash: dAttrs[6], time: dAttrs[4], id: id });
	});
	renderPage(1);
}
function renderPage(page) {
	let pages = Math.ceil(warehouse.length / 500);
	let child = [];
	for (let i = 0, offset; i < 500; i++) {
		offset = (page - 1) * 500 + i;
		if (offset >= warehouse.length) break;
		child.push(warehouse[offset]);
	}
	warehouse.length == 0 && (page = 0);
	let pageele = [];
	pageele.push(page > 1 ?
		<li className="waves-effect" onClick={renderPage.bind(null, 1)} key="page_first"><a href="javascript:"><i className="material-icons">chevron_left</i></a></li> :
		<li className="disabled" key="page_first"><a><i className="material-icons">chevron_left</i></a></li>)
	for (let i = page - 4; i < page + 5; i++) {
		if (i == page)
			pageele.push(<li className="active" key={"page_" + i}><a>{i}/{pages}</a></li>);
		else if (i > 0 && i <= pages)
			pageele.push(<li className="waves-effect" key={"page_" + i} onClick={renderPage.bind(null, i)}><a href="javascript:">{i}</a></li>);
	}
	pageele.push(page < pages ?
		<li className="waves-effect" onClick={renderPage.bind(null, pages)} key="page_last"><a href="javascript:"><i className="material-icons">chevron_right</i></a></li> :
		<li className="disabled" key="page_last"><a href="javascript:"><i className="material-icons">chevron_right</i></a></li>)
	unmountComponentAtNode(document.getElementById('danmakucore'));
	render(
		<div>
			{child.map(ware => {
				return <Danmaku content={ware.content} hash={ware.hash} time={ware.time} key={ware.id} id={ware.id} />;
			})}
			<ul className="pagination" style={{ textAlign: "center" }}>
				{pageele}
			</ul>
		</div>
		,
		document.getElementById('danmakucore')
	);
	$('html, body').animate({ scrollTop: 0 }, 300, 'linear')
}

window.xmlFetch = xmlFetch;

flatpickr.l10ns.default.firstDayOfWeek = 1;