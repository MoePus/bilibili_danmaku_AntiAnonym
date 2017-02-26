var BiliBili_midcrc=function(){
	var CRCPOLYNOMIAL = 0xEDB88320,
	crctable=new Array(256),
	create_table=function(){
		var crcreg,
		i,j;
		for (i = 0; i < 256; ++i)
		{
			crcreg = i;
			for (j = 0; j < 8; ++j)
			{
				crcreg = (crcreg & 1) != 0 ? CRCPOLYNOMIAL ^ (crcreg >>> 1) : crcreg >>> 1;
			}
			crctable[i] = crcreg;
		}
	},
	crc32=function(input,returnIndex){
		var crcstart = 0xFFFFFFFF, len = input.length, index;
		for(var i=0;i<len;++i){
			index = (crcstart ^ input.charCodeAt(i)) & 0xff;
			crcstart = (crcstart >>> 8) ^ crctable[index];
		}
		return returnIndex?index:crcstart;
	},
	getcrcindex=function(t){
		for(var i=0;i<256;i++){
			if(crctable[i] >>> 24 == t)
				return i;
		}
		return -1;
	},
	deepCheckData='',
	deepCheck=function(i,index){
		var tc=0x00,str='',
		hash=crc32(i.toString(),!1);
		tc = hash & 0xff ^ index[2];
		if (!(tc <= 57 && tc >= 48))
			return 0;
		str+=tc-48;
		hash = crctable[index[2]] ^ (hash >>> 8);
		tc = hash & 0xff ^ index[1];
		if (!(tc <= 57 && tc >= 48))
			return 0;
		str+=tc-48;
		hash = crctable[index[1]] ^ (hash >>> 8);
		tc = hash & 0xff ^ index[0];
		if (!(tc <= 57 && tc >= 48))
			return 0;
		str+=tc-48;
		hash = crctable[index[0]] ^ (hash >>> 8);
		deepCheckData=str;
		return 1;
	};
	create_table();
	var index=new Array(4);
	return function(input){
		var ht=parseInt(input,16)^0xffffffff,
		snum,i,lastindex;
		for(i=1;i<1001;i++){
			if(ht==crc32(i.toString(),!1))
				return i;
		}
		for(i=3;i>=0;i--){
			index[3-i]=getcrcindex( ht >>> (i*8) );
			snum=crctable[index[3-i]];
			ht^=snum>>>((3-i)*8);
		}
		for(i=0;i<1e5; i++){
			lastindex = crc32(i.toString(),!0);
			if(lastindex == index[3]){
				if(deepCheck(i,index))
					break;
			}
		}
		return (i==1e5)?-1:(i+''+deepCheckData);
	}
};
exports.engine = BiliBili_midcrc;