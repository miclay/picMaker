/*
* description: import an image and one text msg, then export an overlay
* name:        Picture
* version:     2012-08-21 v1.0
* author:      Miclay
*/

var Picture=(function(win,doc){
	var extend=function(obj,opts){
		for(var key in opts){
			obj[key]=opts[key];
		}
		return obj;
	};
	return function (params) {
		var that=this;
		var conf=extend({
			stage:doc.getElementById('stage'),
			txt_max_row:2,
			txt_max_len:21, //汉字个数
			txt_color:'#ffffff',
			txt_bg_color:'rgba(0,0,0,0.6)',
			font_size:15, //px
			font_weight:300,
			font_style:'normal', //normal || italic
			font_family:'LanTingHei',
			line_height:20 //px
		},params);

		var ctx=conf.stage.getContext('2d');
		ctx.font = conf['font_style']+' '
				+conf['font_weight']+' '
				+conf['font_size']+'px/'
				+conf['line_height']+'px '
				+conf['font_family'];

		that.params={
			bg:'',
			bg_pos:[0,0],
			bg_scale:1,
			bg_width:419,
			bg_height:160,
			txt:''
		};

		that.draw=function(){
			var arr_txt=that.params.txt.split('\n');
			arr_txt.push(''); //ensure arr length >=2
			var img = new Image();
			img.onload = function(){
				var rect_width = Math.max(ctx.measureText(arr_txt[0]).width,ctx.measureText(arr_txt[1]).width)+20;
				that.params.bg_width=img.width;
				that.params.bg_height=img.height;

				/* clear stage */
				ctx.clearRect(0,0,conf.stage.width,conf.stage.height);
				ctx.drawImage(img,
					that.params.bg_pos[0],that.params.bg_pos[1],
					img.width*that.params.bg_scale,img.height*that.params.bg_scale);

				if(arr_txt[0].length||arr_txt[1].length){
					/* text bg */
					ctx.fillStyle=conf['txt_bg_color'];
					ctx.fillRect(0,conf.stage.height-52,rect_width,44);

					/* text */
					ctx.shadowBlur=1;
					ctx.shadowColor = conf['txt_color'];
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.fillStyle=conf['txt_color'];
					for(var i=0,len=arr_txt.length;i<len;i++){
						if(i > conf['txt_max_row']-1){
							break;
						}
						ctx.fillText(arr_txt[i],
							10,conf.stage.height-35+i*conf['line_height'],
							conf['txt_max_len']*conf['font_size']);
					}
				}
			}
			img.src = that.params.bg;
		};

		that.save=function(){
            var str = conf.stage.toDataURL();
            Socket.emit('upload', str);
            $('#view_list').empty();
            $('#btn_save').text('等待');
		};

		/*darggable*/
		(function(){
			var x,y,isDrag = false;
			var dom=conf.stage;
			dom.onselectstart=function(){return false;};
			dom.onmousedown = function(e){
		        e=e||win.event;
		        e.which=e.which||e.button;
		        if(e.which == 1) {
		            isDrag = true;
		            x = e.clientX-that.params.bg_pos[0];
		            y = e.clientY-that.params.bg_pos[1];
		        }
		    };
		    doc.onmousemove = function(e){
		        e=e||win.event;
		        if(isDrag) {
		            that.params.bg_pos[0]=e.clientX-x;
		            that.params.bg_pos[1]=e.clientY-y;
		            that.draw();
		        }
		    };
		    doc.onmouseup = win.onblur = function(){
		    	isDrag = false;
		    };
		})();

		return that;
	};
})(window,document);


var Socket = io.connect('/');
Socket.on('sending', function(data) {
    var quality = data['quality'];
    var size = data['size'];
    var url = data['url'];
    var cls = quality == 80 ? ' on' : '';
    $('#view_list').append('<div class="item' + cls + '">quality:' + quality + '%  size=' + size + 'B<br><img src="' + url + '" /></div>');
});
Socket.on('complete',function(){
	$('#preview').slideDown();
	$('#picmaker').slideUp();
});
$('#view_list').delegate('div','click',function(){
	$(this).addClass('on').siblings().removeClass('on');
});
$('#preview .back').click(function(){
	$('#btn_save').text('提交');
	$('#preview').slideUp();
	$('#picmaker').slideDown();
});
$('#btn_upload').click(function(e){
	e.preventDefault();
	if($.trim($('[name="img_file"]').val())==''){
		alert('请选择图片再上传');
	}else{
		$(this).parents('form').submit();
	}
});

(function(win, doc) {
    var pic = new Picture();
    var dom_url = doc.getElementById('ipt_url'),
		dom_range = doc.getElementById('ipt_range'),
		dom_range_val = doc.getElementById('ipt_range_val'),
		dom_title = doc.getElementById('ipt_title'),
		dom_save = doc.getElementById('btn_save');

    dom_url.onchange = function() {
        pic.params.bg = dom_url.value;
        pic.draw();
    };
    dom_title.onkeyup = function() {
        pic.params.txt = dom_title.value;
        pic.draw();
    };
    dom_range.onchange = function() {
        dom_range_val.value = this.value;
        pic.params.bg_scale = parseInt(this.value) / 100;
        pic.draw();
    };
    dom_range_val.onkeyup = function(e) {
        var val = parseInt(this.value);
        if (e.keyCode == 40 && val > 10) {//key down
            this.value = val - 1;
        } else if (e.keyCode == 38 && val < 1000) {//key up
            this.value = val + 1;
        }
        dom_range.value = this.value;
        pic.params.bg_scale = parseInt(dom_range.value) / 100;
        pic.draw();
    };
    dom_save.onclick = pic.save;
    setTimeout(function() {
        pic.params.bg = dom_url.value;
        pic.params.txt = dom_title.value;
        pic.params.bg_scale = parseInt(dom_range_val.value) / 100;
        pic.draw();
    }, 1000);
})(window, document);