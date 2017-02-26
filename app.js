import React from 'react';
import crcRevEng from './crcRevEng';
import { render,unmountComponentAtNode,renderComponent } from 'react-dom';

var revCrc = new crcRevEng.engine();
var Danmaku = React.createClass({
        getInitialState:function () {
            return {
                hovered:false,
				midheight:"0%",
				sbmid:"",
				sbname:"",
				fetchingMemberInfo:false,
				scriptele:undefined
            }
        },
		handleMemberInfo:function(obj){
			var uname = obj.cards[Object.keys(obj.cards)[0]].uname;
			document.body.removeChild(this.state.scriptele);
			this.setState({
				scriptele:undefined,
				sbname:uname
			});
		},
		onMouseOver:function () {
			if(this.state.hovered)
				return;
			this.setState({
				hovered:true
			});
			var crcPromise = new Promise((resolve)=>
			{
				resolve(revCrc(this.props.hash));
			})
			crcPromise.then((val)=>
			{
				this.setState({
					sbmid:val
				});
				if(val==-1)
				{
					this.setState({
						sbname:"匿名者"
					});
				}
				else
				{
					const script = document.createElement("script");
					script.src = `http://account.bilibili.com/api/member/getInfoByMid?mid=${val}&callback=findVirtualDom("${this.props.id}").handleMemberInfo&type=jsonp`;
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
			window.reactRef[this.props.id] = this;

			var hoverAnime ;
			if(this.state.hovered)
				hoverAnime = <script></script>;
            return <div onMouseOver={this.onMouseOver} style={{height:"40px"}} is mid={this.state.sbmid}>
			<a href={"http://space.bilibili.com/"+this.state.sbmid} target="view_window" style={{width:"100%",height:"100%",textOverflow: "ellipsis",whiteSpace: "nowrap"}} className="collection-item waves-effect black-text">
			<span style={{float: "right",overflow: "hidden",height:this.state.midheight}} className="badge grey-text">{this.state.sbname.length >0 ? this.state.sbname : this.state.sbmid}</span>
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

var findVirtualDom = function(id)
{
	return window.reactRef[id];
}
window.reactRef = new Object();
window.xmlFecth = xmlFecth;
window.findVirtualDom = findVirtualDom;