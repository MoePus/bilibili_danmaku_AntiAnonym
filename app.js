import React from 'react';
import crcRevEng from './crcRevEng';
import { render,unmountComponentAtNode,renderComponent } from 'react-dom';

var revCrc = new crcRevEng.engine();
var midCache = {};
var midDOMList = {};
window.cardJsonpResolver = function(data){
	var card = data.cards[Object.keys(data.cards)[0]];
	midCache[card.mid] = card.uname;
	midDOMList[card.mid].find(function(item){
		if(item.state.scriptele!=null){
			item.state.scriptele.remove();
		}
		item.setState({
			scriptele:null,
			sbname:card.uname
		});
	});
	delete midDOMList[card.mid];
};
var Danmaku = React.createClass({
        getInitialState:function () {
            return {
                hovered:false,
				midheight:"0%",
				sbmid:"",
				sbname:"",
				fetchingMemberInfo:false,
				scriptele:null
            }
        },
		onMouseOver:function () {
			if(this.state.hovered)
				return;
			this.setState({
				hovered:true
			});
			Promise.resolve().then(()=>
			{
				let val = revCrc(this.props.hash);
				this.setState({
					sbmid:val
				});
				if(val==-1)
				{
					this.setState({
						sbname:"匿名者"
					});
				}
				else if(midCache[val]!=undefined){
					this.setState({
						sbname:midCache[val]
					})
				} else if(midDOMList[val]!=undefined){
					midDOMList[val].push(this)
				} else {
					midDOMList[val] = [this];
					const script = document.createElement("script");
					script.src = `http://account.bilibili.com/api/member/getInfoByMid?mid=${val}&callback=cardJsonpResolver&type=jsonp`;
					script.async = true;

					var scriptele = document.body.appendChild(script);
					this.setState({
						scriptele:scriptele
					});
				}
			});
			const fadeInTime = 80;
			var fadeStart = Date.now();
			var fadeInAnime = ()=>
			{
				var elapsedTime = Date.now() - fadeStart;
				var fadePercent = Math.round(Math.min(100,1.0*elapsedTime/fadeInTime*100)) + '%';
				this.setState({
					midheight:fadePercent
				});
				if(elapsedTime<fadeInTime)
					setTimeout(fadeInAnime,16);
			};
			setTimeout(fadeInAnime,16);
			return;
        },
        render:function () 
		{
			var hoverAnime,
			midClass = this.state.sbname.length>0?'info_item out':'info_item in';
			if(this.state.hovered)
				hoverAnime = <script></script>;
            return <div onMouseOver={this.onMouseOver} style={{height:"40px"}} is mid={this.state.sbmid}>
			<a href={"http://space.bilibili.com/"+this.state.sbmid} target="view_window" style={{width:"100%",height:"100%",textOverflow: "ellipsis",whiteSpace: "nowrap"}} className="collection-item waves-effect black-text">
			<span style={{float: "right",height:this.state.midheight}} className="badge grey-text">{this.state.sbname.length > 0 ? <span className="info_item in">{this.state.sbname}</span> : ''}{this.state.sbmid != "" ? <span className={midClass}>{this.state.sbmid}</span> : ''}</span>
			{this.props.content}</a>
			{hoverAnime}
			</div>;
        }
   });

render(
<div>
  <div style={{marginLeft:"20%",width:"60%"}}> 
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
span.badge{position:relative}
span.badge .info_item{position:absolute;right:6px;animation-fill-mode:forwards;animation-iteration-count:1;animation-duration:.3s;opacity:0;top:calc(-20px - 100%)}
span.badge .info_item.in{animation-name:slide_in}
span.badge .info_item.out{animation-name:slide_out}
@keyframes slide_in{
	0%{
		transform:translateY(0);
		opacity:0
	}
	100%{
		transform:translateY(calc(100% + 16px));
		opacity:1
	}
}
@keyframes slide_out{
	0%{
		transform:translateY(calc(100% + 16px));
		opacity:1
	}
	100%{
		transform:translateY(calc(200% + 40px));
		opacity:0
	}
}`


var xmlFecth = function ()
{
	$.ajax(
	{
		url:"http://comment.bilibili.com/"+parseInt($("#fetch_cid").val())+".xml",
		dataType: 'xml',
		success: function(data)
		{
			unmountComponentAtNode(document.getElementById('danmakucore'));
			xmlParse(data);
			$("#progressBar").slideUp();
		},
		error: function()
		{
			$("#progressBar").slideUp();
		}
	});
	$("#progressBar").slideDown();
}
var xmlParse = function (xmlContent)
{
	var warehouse = new Array();
	$(xmlContent).find("d").each(function(i)
	 {
			var p = $(this).attr("p");
			var dAttrs= p.split(",");;
			var text = $(this).text();
			var id = "id" + Math.random().toString(16).slice(2);
			warehouse.push({content:text,hash:dAttrs[6],time:dAttrs[4],id:id});
	 });
	 render(
	<div>
	{warehouse.map(ware=>
	{
		return <Danmaku content={ware.content} hash={ware.hash} time={ware.time} key={ware.id} id={ware.id}/>;
	})}
	</div>
	  ,
	  document.getElementById('danmakucore')
	);
}

window.xmlFecth = xmlFecth;