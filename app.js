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
var revCrc = new Worker('crcRevEng.min.js');
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
		revCrc.postMessage(hash);
		crcResolveQueue[hash] = crcResolveQueue[hash] || [];
		crcResolveQueue[hash].push(this);
		return;
	},
	render: function () {
		var hoverAnime,
			midClass = this.state.sbname.length > 0 ? 'info_item out' : 'info_item in';
		if (this.state.hovered)
			hoverAnime = <style></style>;
		return <div class={this.state.sbname!=''?'show-name':this.state.sbmid!=''?'show-mid':this.state.hovered?'show-hash':''} onMouseOver={this.onMouseOver} style={{ height: "40px", overflow: "hidden" }} is mid={this.state.sbmid}>
			<a href={"//space.bilibili.com/" + this.state.sbmid} target="view_window" style={{ width: "100%", height: "100%", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="collection-item waves-effect black-text">
				<span style={{ float: "right" }} className="badge grey-text"><span className="info_item">{this.state.sbname}</span><span className="info_item">{this.state.sbmid}</span><span className="info_item">{this.props.hash}</span><span className="info_item"></span></span>
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
					<span>Made by <a className="orange-text text-lighten-3" href="http://www.moepus.com">MoePus</a>　　·　　<a className="grey-text  text-lighten-1" href="http://materializecss.com/">materializecss</a> · <a className="grey-text  text-lighten-1" href="https://www.biliplus.com">biliplus</a></span>
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


var xmlFecth = function () {
	$.ajax(
		{
			url: "//comment.bilibili.com/" + parseInt($("#fetch_cid").val()) + ".xml",
			dataType: 'xml',
			success: function (data) {
				unmountComponentAtNode(document.getElementById('danmakucore'));
				xmlParse(data);
				$("#progressBar").slideUp();
			},
			error: function () {
				$("#progressBar").slideUp();
			}
		});
	$("#progressBar").slideDown();
}
var xmlParse = function (xmlContent) {
	var warehouse = new Array();
	$(xmlContent).find("d").each(function (i) {
		var p = $(this).attr("p");
		var dAttrs = p.split(",");;
		var text = $(this).text();
		var id = "id" + Math.random().toString(16).slice(2);
		warehouse.push({ content: text, hash: dAttrs[6], time: dAttrs[4], id: id });
	});
	render(
		<div>
			{warehouse.map(ware => {
				return <Danmaku content={ware.content} hash={ware.hash} time={ware.time} key={ware.id} id={ware.id} />;
			})}
		</div>
		,
		document.getElementById('danmakucore')
	);
}

window.xmlFecth = xmlFecth;