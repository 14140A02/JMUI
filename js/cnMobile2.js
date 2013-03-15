//base
(function(){
	var cm={
 		$namespace: function(name) {
	        if ( !name ) {
	            return window;
	        }

	        nsArr = name.split(".");
	        var ns=window;

            for(i = 0 , l = nsArr.length; i < l; i++){
            	var n = nsArr[i];
  				ns[n] = ns[n] || {};
  				ns = ns[n];
            }

            return ns;
        },
		$package:function(ns,func){
			var target;
			if(typeof ns == "function"){
				func=ns;
				target = window; 
			}
			else if(typeof ns == "string"){
				target = this.$namespace(ns);
			}
			else if(typeof ns == "object"){
				target  = ns;
			}
			func.call(target,this);
		},
		extend:function(destination,source){
			for(var n in source){
				if(source.hasOwnProperty(n)){
					destination[n]=source[n];
				}
			}
			return destination;

		},
	    bind:function(func, context, var_args) {
	        var slice = [].slice;
	        var a = slice.call(arguments, 2);
	        return function(){
	            return func.apply(context, a.concat(slice.call(arguments)));
	        };
		},
		Class:function(){
	        var length = arguments.length;
	        var option = arguments[length-1];
        	option.init = option.init || function(){};
   
	        if(length === 2){
	            var superClass = arguments[0].extend;
	
	            var tempClass = function() {};
	            tempClass.prototype = superClass.prototype;

	            var subClass = function() {
	                this.init.apply(this, arguments);
	            }
	          
	            subClass.superClass = superClass.prototype;
	            subClass.callSuper = function(context,func){
	                var slice = Array.prototype.slice;
	                var a = slice.call(arguments, 2);
	                var func = subClass.superClass[func];
	           
	                if(func){
	                    func.apply(context, a.concat(slice.call(arguments)));
	                }
	            };
	            subClass.prototype = new tempClass();
	            subClass.prototype.constructor = subClass;
	            
	            cm.extend(subClass.prototype, option);
	            

	            subClass.prototype.init = function(){
	                option.init.apply(this, arguments);
	            };
	            return subClass;
	        }else if(length === 1){
	            var newClass = function() {
	                return this.init.apply(this, arguments);
	            }
	            newClass.prototype = option;
	            return newClass;
	        }   
	    },
		indexOf:function(arr,elem){
			var $T= cm.type;
			//数组或类数组对象
			if(arr.length){
				return [].indexOf.call(arr,elem);
			}
			else if($T.isObject(arr)){
				for(var i in arr){
					if(arr.hasOwnProperty(i) && arr[i] === elem){
						return i;
					}	
				}
			}			
		},
		every:function(arr,callback){
			if(arr.length){
				return [].every.call(arr,callback);
			}
			else if($T.isObject(arr)){
				var flag = true;
				this.each(arr,function(e,i,arr){
					if(!callback(e,i,arr)) flag = false;
				});
				return flag;
			}
		},
		some:function(arr,callback){
			if(arr.length){
				return [].some.call(arr,callback);
			}
			else if($T.isObject(arr)){
				var flag = false;
				this.each(arr,function(e,i,arr){
					if(callback(e,i,arr)) flag = true;
				});
				return flag;
			}
		},
		each:function(arr,callback){
			var $T = cm.type;
			if(arr.length){
				[].forEach.call(arr,callback);
			}
			else if($T.isObject(arr)){
				for(var i in arr){
					if(arr.hasOwnProperty(i))
						if(callback.call(arr[i],arr[i],i,arr) === false) return;
				}
			}
		},
		map:function(arr,callback){
			var $T = cm.type;
			if(arr.length){
				[].map.call(arr,callback);
			}
			else if($T.isObject(arr)){
				for(var i in arr){
					if(arr.hasOwnProperty(i))
						arr[i] = callback.call(arr[i],arr[i],i,arr);
				}				
			}
		},
		filter:function(arr,callback){
			var $T = cm.type;
			if(arr.length){
				return [].filter.call(arr,callback);
			}
			else if($T.isObject(arr)){
				var newObj={};
				this.each(arr,function(e,i){
					if(callback(e,i)){
						newObj[i] = e;
					}
				});
				return newObj;
			}
		},
		isEmptyObject:function(obj){
			for(var n in obj){
				return false;
			}
			return true;
		}

	}
	window.cnMobile=window.cm=cm;
})();
//connection
cm.$package(function(cm){
	var c = navigator.connection || {type:0};
	var ct = ["unknow","ethernet","wifi","cell_2g","cell_3g"];
	cm.connectType = ct[c.type]; 
});
//type
cm.$package(function(cm){

	var ots=Object.prototype.toString;

	var type={
		isArray : function(o){
			return o && (o.constructor === Array || ots.call(o) === "[object Array]");
		},
	    isObject : function(o) {
	    	return o && (o.constructor === Object || ots.call(o) === "[object Object]");
		},
	    isBoolean : function(o) {
	    	return (o === false || o) && (o.constructor === Boolean);
		},
	    isNumber : function(o) {
	    	return (o === 0 || o) && o.constructor === Number;
		},
	    isUndefined : function(o) {
	   		return typeof(o) === "undefined";
		},
	    isNull : function(o) {
	   		return o === null;
		},
	    isFunction : function(o) {
	   		return o && (o.constructor === Function);
		},
		isString : function(o) {
        	return (o === "" || o) && (o.constructor === String);
    	}
	}
	cm.type=type;
});
//browser
cm.$package(function(cm){
	var ua = navigator.userAgent;
	var platform = {};

	platform.android = ua.indexOf("Android") > -1 ,
	platform.iPhone = ua.indexOf("iPhone") > -1 ,
	platform.iPad = ua.indexOf("iPad") > -1 ,
	platform.iPod = ua.indexOf("iPod") > -1 ,
	platform.winPhone = ua.indexOf("IE") > -1 ,
	platform.IOS = platform.iPad || platform.iPhone;
	platform.touchDevice = "ontouchstart" in window;

	cm.platform = platform;
});
//dom
cm.$package(function(cm){
	var doc = document,
	$T = cm.type,
	tagNameExpr = /^[\w-]+$/,
	idExpr = /^#([\w-]*)$/,
	classExpr = /^\.([\w-]+)$/,
	selectorEngine;

	var hasClassListProperty = 'classList' in document.documentElement;
	var vendors = ['o', 'ms' ,'moz' ,'webkit'];
	var div = document.createElement('div');

	var $D={

		$:function(selector,context){
			var result;
			var qsa;
			context = context || doc;

			//优先使用原始的
			if(idExpr.test(selector)) {
				result = this.id(selector.replace("#",""));
				if(result)  return [result] ;
				else return [] ;
			}
			else if(tagNameExpr.test(selector)){
				result = this.tagName(selector);
			}
			else if(classExpr.test(selector)){
				result = this.className(selector.replace(".",""));
			}
			//自定义选择器
			else if(selectorEngine) result = selectorEngine(selector,context);
			//querySelectorAll
			else if(qsa=context.querySelectorAll) result = qsa.call(context,selector);
			else throw Error("querySelectorAll required");

			//nodeList转为array
			return [].slice.call(result);
				
		},
		id:function(id){
			return doc.getElementById(id);
		},
		tagName:function(tagName,context){
			context=context||doc;
			return context.getElementsByTagName(tagName);
		},
		className:function(className,context){
			context=context||doc;
			return context.getElementsByClassName(className);
		},
		setSelectorEngine:function(func){
			selectorEngine=func;
		},
		matchesSelector:function(ele,selector){
			if(!ele || !selector) return;
			var matchesSelector = ele.webkitMatchesSelector || ele.mozMatchesSelector || ele.oMatchesSelector || ele.matchesSelector;
			if(matchesSelector) return matchesSelector.call(ele,selector);
			var list = this.$(selector);
			if(cm.indexOf(list,ele) > 0) return true;
			return false;
		},
		closest:function(elem,selector){
			while(elem){
				if($D.matchesSelector(elem,selector)){
					return elem;
				}
				elem = elem.parentNode;
			}
		},
		toDomStyle:function(cssStyle){
			if(!$T.isString(cssStyle)) return;
				return cssStyle.replace(/\-[a-z]/g,function(m) { return m.charAt(1).toUpperCase(); });
		},
		toCssStyle:function(domStyle){
			if(!$T.isString(domStyle)) return;
  				return domStyle.replace(/[A-Z]/g, function(m) { return '-'+m.toLowerCase(); });
		},
		setStyle:function(elem ,styleName,styleValue){
			var self = this;
			if($T.isArray(elem)){
				cm.each(elem ,function(e){
					self.setStyle(e,styleName,styleValue);
				});
				return;
			}
			if($T.isObject(styleName)){
				for(var n in styleName){
					if(styleName.hasOwnProperty(n)){
						elem.style[n] = styleName[n];
					}
				}
				return;
			}
			if($T.isString(styleName)){
				elem.style[styleName] = styleValue;
			}
		},
		//获取带有出产商的属性名
		getVendorPropertyName : function(prop) {
			var style = div.style;
			var _prop;
		    if (prop in style) return prop;
		    // _prop = prop;
		    _prop = prop.charAt(0).toUpperCase() + prop.substr(1);
		    for(var i = vendors.length; i--;){
		    	var v = vendors[i];
		    	var vendorProp = v + _prop;
		    	if (vendorProp in style) {
		    		return vendorProp;
		    	}
		    }	  	
		},
	 	//检测是否支持3D属性
	 	isSupprot3d : function(){
	 		// var transformStr = $D.getVendorPropertyName("transform");
	 		// $D.setStyle(div ,transformStr ,"rotatex(90deg)");
	 		// if(div.style[transformStr] == "") return false;
	 		// return true;
	 		var p_prop = $D.getVendorPropertyName("perspective");
	 		return p_prop && p_prop in div.style;
	 	},
		filterSelector:function(arr,selector){
			return cm.filter(arr,function(elem){
				return $D.matchesSelector(elem,selector);
			});
		},
		addClass:function(){
			if(hasClassListProperty){
	            return function (elem, className) {
	                if (!elem || !className || $D.hasClass(elem, className)){
	                    return;
	                }
	                elem.classList.add(className);
	            };
			}
			else{
				return function(elem, className){
	                if (!elem || !className || $D.hasClass(elem, className)) {
	                    return;
	                }
	                elem.className += " "+ className;
				}	
			}
		}(),
	    hasClass:function(){
	        if (hasClassListProperty) {
	            return function (elem, className) {
	                if (!elem || !className) {
	                    return false;
	                }
	                return elem.classList.contains(className);
	            };
	        } else {
	            return function (elem, className) {
	                if (!elem || !className) {
	                    return false;
	                }
	                return -1 < (' ' + elem.className + ' ').indexOf(' ' + className + ' ');
	            };
	        }
	    }(),
	    removeClass:function(){
	        if (hasClassListProperty) {
	            return function (elem, className) {
	                if (!elem || !className || !$D.hasClass(elem, className)) {
	                    return;
	                }
	                elem.classList.remove(className);
	            };
	        } else {
	            return function (elem, className) {
	                if (!elem || !className || !$D.hasClass(elem, className)) {
	                    return;
	                }
	                elem.className = elem.className.replace(new RegExp('(?:^|\\s)' + className + '(?:\\s|$)'), ' ');
	            };
	        }	    	
	    }(),
	    toggleClass:function(ele,className){
	    	if($D.hasClass(ele,className)){
	    		$D.removeClass(ele,className);
	    	}
	    	else{
	    		$D.addClass(ele,className);
	    	}
	    }
	};

	cm.dom=$D;
});

//event
cm.$package(function(cm){

	var $T=cm.type;

	var isDomEvent=function(obj,evtType){
		//addEventListener supported by ie9+
		return obj.addEventListener && "on" + evtType in obj;
	}

	var $E={
		on:function(obj, evtType, handler){
			if($T.isArray(obj)){
				for(var i=obj.length;i--;){
					$E.on(obj[i], evtType, handler);
				}			
			}
			//evtType is a string split by space
			if($T.isString(evtType)&&evtType.indexOf(" ")>0){
				evtType = evtType.split(" ");
				for(var i=evtType.length;i--;){
					$E.on(obj, evtType[i], handler);
				}
				return;
			}
			//handler is an array
			if($T.isArray(handler)){
				for(var i=handler.length;i--;){
					$E.on(obj, evtType, handler[i]);
				}
				return;
			}
			//evtType is an object
			if($T.isObject(evtType)){
				for(var eName in evtType){
					$E.on(obj, eName, evtType[eName]);
				}
				return;
			}
			//is dom event may need fixed
			// if(domFixedEvent[evtType]){
			// 	if(domFixedEvent[evtType](ele,handler)){
			// 		return;
			// 	}
			// }
			//is dom event support
			if(isDomEvent(obj,evtType)){
				obj.addEventListener(evtType ,handler ,false);
				return;
			}
			//is specific custom event
			if(customEvent[evtType]){
				customEvent[evtType](obj,handler);
				return;
			}
			//other custom event
			if(!obj.events) obj.events={};
			if(!obj.events[evtType]) obj.events[evtType]=[];

			obj.events[evtType].push(handler);
			

		},
		once:function(obj,evtType,handler){
			var f = function(){
				handler();
				$E.off(obj ,evtType ,f);
			}
			$E.on(obj ,evtType ,f);
		},
		off:function(obj,evtType,handler){
			//evtType is a string split by space
			if($T.isString(evtType)&&evtType.indexOf(" ")>0){
				evtType = evtType.split(" ");
				for(var i=evtType.length;i--;){
					$E.off(obj, evtType[i], handler);
				}
				return;
			}
			//handler is an array
			if($T.isArray(handler)){
				for(var i=handler.length;i--;){
					$E.off(obj, evtType, handler[i]);
				}
				return;
			}
			//evtType is an object
			if($T.isObject(evtType)){
				for(var eName in evtType){
					$E.off(obj, eName, evtType[eName]);
				}
				return;
			}

			if(isDomEvent(obj,evtType)){
				obj.removeEventListener( evtType , handler ,false );
				return;
			}	
			//is specific custom event
			if(customEvent[evtType]){
				customEvent._off(obj,evtType,handler);
				return;
			}	
			
			if(!evtType) {
				obj.events={}; 
				return;
			}
	
			if(obj.events){
				if(!handler) {
					obj.events[evtType]=[];
					return;
				}
				if(obj.events[evtType]){
					var evtArr=obj.events[evtType];
					for(var i=evtArr.length;i--;){
						if(evtArr[i]==handler){
							evtArr.splice(i,1);
							return;
						}
					}
				}
			}
		},
		fire:function(obj,evtType){
			var arg = [].slice.call(arguments,2);
			//obj is dom element
			if(isDomEvent(obj,evtType)){
		        var evt = document.createEvent('HTMLEvents');
        		evt.initEvent(evtType, true, true);
        		obj.dispatchEvent(evt);
        		return;
			}
			if(obj.events&&obj.events[evtType]){
				var handler=obj.events[evtType];
				for(var i=0,l=handler.length;i<l;i++){
					handler[i].apply(window,arg);
				}
			}
		}

	};

	var startEvt,moveEvt,endEvt;
	//选择不同事件
	if(cm.platform.touchDevice){
		startEvt="touchstart";
		moveEvt="touchmove";
		endEvt="touchend";
	}
	else{
		startEvt="mousedown";
		moveEvt="mousemove";
		endEvt="mouseup";			
	}

	var getTouchPos = function(e){
		var t = e.touches;
		if(t && t[0]) {
			return { x : t[0].pageX , y : t[0].pageY };
		}
		return { x : e.pageX , y: e.pageY };
	}
	//计算两点之间距离
	var getDist = function(p1 , p2){
		if(!p1 || !p2) return 0;
		return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));

	}
	//计算两点之间所成角度
	var getAngle = function(p1 , p2){
		var r = Math.atan2(p2.y - p1.y, p2.x - p1.x);
		var a = r * 180 / Math.PI;
		return a;
	};


	var customEventHandlers = [];
	var isCustomEvtMatch = function(ch,ele,evtType,handler){
		return ch.ele == ele && evtType == ch.evtType && handler == ch.handler
	}
	//自定义事件
	var customEvent = {
		_fire:function(ele,evtType,handler){
			cm.each(customEventHandlers,function(ch){
				if(isCustomEvtMatch(ch,ele,evtType,handler)){
					handler.call(ele,{
						type:evtType
					});
				}
			});			
		},
		_off:function(ele,evtType,handler){
			cm.each(customEventHandlers,function(ch,i){
				var at = ch.actions;
				if(isCustomEvtMatch(ch,ele,evtType,handler)){
					//删除辅助处理程序
					for(var n in at){
						var h = at[n];
						if($T.isObject(h)){
							//非绑定在该元素的handler
							$E.off(h.ele ,n ,h.handler);
						}
						else{
							$E.off(ele ,n ,h);
						}
					}
					//删除本处理程序数据
					customEventHandlers.splice(i,1);
					return;
				}
			});
		},
		tap:function(ele,handler){
			//按下松开之间的移动距离小于20，认为发生了tap
			var TAP_DISTANCE = 20;
			//双击之间最大耗时
			var DOUBLE_TAP_TIME = 300;
			var pt_pos;
			var ct_pos;
			var pt_up_pos;
			var pt_up_time;
			var evtType;
			var startEvtHandler = function(e){
				e.stopPropagation();
				var touches = e.touches;
				if(!touches || touches.length == 1){//鼠标点击或者单指点击
					ct_pos = pt_pos = getTouchPos(e);
				}
			}
			var moveEvtHandler = function(e){
				e.stopPropagation();
				e.preventDefault();
				ct_pos = getTouchPos(e);
			}
			var endEvtHandler = function(e){
				e.stopPropagation();
				var now = Date.now(); 
				var dist = getDist(ct_pos , pt_pos);
				var up_dist = getDist(ct_pos , pt_up_pos);

				if(dist < TAP_DISTANCE){
					if(pt_up_time && now - pt_up_time < DOUBLE_TAP_TIME && up_dist < TAP_DISTANCE){
						evtType = "doubletap";
					}
					else{
						evtType = "tap";
					}
					// handler.call(ele,{
					// 	oriEvt:e,
					// 	type:evtType
					// });
					//使用自定义dom事件，可以支持冒泡等dom事件特性
					var evt = document.createEvent('MouseEvents');
					evt.initMouseEvent('tap',true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY);
					ele.dispatchEvent(evt);
				}
				pt_up_pos = ct_pos;
				pt_up_time = now;
			}
		
			if(!("ontap" in ele)) {

				ele.ontap = null;
			}
			$E.on(ele,"tap",handler);
			$E.on(ele,startEvt,startEvtHandler);
			$E.on(ele,moveEvt,moveEvtHandler);
			$E.on(ele,endEvt,endEvtHandler);

			var evtOpt = {
				ele:ele,
				evtType:evtType,
				handler:handler
			}
			evtOpt.actions = {};
			evtOpt.actions[startEvt] = startEvtHandler;
			evtOpt.actions[moveEvt] = moveEvtHandler;
			evtOpt.actions[endEvt] = endEvtHandler;

			customEventHandlers.push(evtOpt);
			
		},
		hold:function(ele,handler){
			//按下松开之间的移动距离小于20，认为点击生效
			var HOLD_DISTANCE = 20;
			//按下两秒后hold触发
			var HOLD_TIME = 2000;
			var holdTimeId;
			var pt_pos;
			var ct_pos;
			var startEvtHandler = function(e){
				e.stopPropagation();
				var touches = e.touches;
				if(!touches || touches.length == 1){//鼠标点击或者单指点击
					pt_pos = ct_pos = getTouchPos(e);
					pt_time = Date.now();

					holdTimeId = setTimeout(function(){
						if(touches && touches.length != 1) return;
						if(getDist(pt_pos,ct_pos) < HOLD_DISTANCE){
							// handler.call(ele,{
							// 	oriEvt:e,
							// 	type:"hold"
							// });
							var evt = document.createEvent('MouseEvents');
							evt.initMouseEvent('hold',true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY);
							ele.dispatchEvent(evt);
						}
					},HOLD_TIME);
				}
			}
			var moveEvtHandler = function(e){
				e.stopPropagation();
				e.preventDefault();
				ct_pos = getTouchPos(e);
			}
			var endEvtHandler = function(e){
				e.stopPropagation();
				clearTimeout(holdTimeId);
			}
				
			if(!("onhold" in ele)) ele.onhold = null;
			$E.on(ele,"hold",handler);
			$E.on(ele,startEvt,startEvtHandler);
			$E.on(ele,moveEvt,moveEvtHandler);
			$E.on(ele,endEvt,endEvtHandler);	

			var evtOpt = {
				ele:ele,
				evtType:"hold",
				handler:handler
			}
			evtOpt.actions = {};
			evtOpt.actions[startEvt] = startEvtHandler;
			evtOpt.actions[moveEvt] = moveEvtHandler;
			evtOpt.actions[endEvt] = endEvtHandler;

			customEventHandlers.push(evtOpt);	
		},
		swipe:function(ele,handler){
			//按下之后移动30px之后就认为swipe开始
			var SWIPE_DISTANCE = 30;
			//swipe最大经历时间
			var SWIPE_TIME = 500;
			var pt_pos;
			var ct_pos;
			var pt_time;
			var pt_up_time;
			var pt_up_pos;
			//获取swipe的方向
			var getSwipeDirection = function(p2,p1){
				var dx = p2.x - p1.x;
				var dy = -p2.y + p1.y;	
				var angle = Math.atan2(dy , dx) * 180 / Math.PI;

				if(angle < 45 && angle > -45) return "right";
				if(angle >= 45 && angle < 135) return "top";
				if(angle >= 135 || angle < -135) return "left";
				if(angle >= -135 && angle <= -45) return "bottom";

			}
			var startEvtHandler = function(e){
				e.stopPropagation();
				var touches = e.touches;
				if(!touches || touches.length == 1){//鼠标点击或者单指点击
					pt_pos = ct_pos = getTouchPos(e);
					pt_time = Date.now();

				}
			}
			var moveEvtHandler = function(e){
				e.stopPropagation();
				e.preventDefault();
				ct_pos = getTouchPos(e);
			}
			var endEvtHandler = function(e){
				e.stopPropagation();
				var dir;
				pt_up_pos = ct_pos;
				pt_up_time = Date.now();

				if(getDist(pt_pos,pt_up_pos) > SWIPE_DISTANCE && pt_up_time - pt_time < SWIPE_TIME){
					dir = getSwipeDirection(pt_up_pos,pt_pos);
					// handler.call(ele,{
					// 	oriEvt:e,
					// 	type:"swipe",
					// 	direction:dir
					// });
					var evt = document.createEvent('MouseEvents');
					evt.initMouseEvent('swipe' + dir,true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY);
					evt.direction = dir;
					ele.dispatchEvent(evt);
				}
			}	
			if(!("onswipe" in ele)) ele.onswipe = null;
			$E.on(ele,"swipe",handler);
			$E.on(ele,startEvt,startEvtHandler);
			$E.on(ele,moveEvt,moveEvtHandler);
			$E.on(ele,endEvt,endEvtHandler);	

			var evtOpt = {
				ele:ele,
				evtType:"swipe",
				handler:handler
			}
			evtOpt.actions = {};
			evtOpt.actions[startEvt] = startEvtHandler;
			evtOpt.actions[moveEvt] = moveEvtHandler;
			evtOpt.actions[endEvt] = endEvtHandler;

			customEventHandlers.push(evtOpt);				
		},
		transform:function(ele,handler){
			var pt_pos1;
			var pt_pos2;
			var pt_len;//初始两指距离
			var pt_angle;//初始两指所成角度
			var startEvtHandler = function(e){
				var touches = e.touches;
				if(!touches) return;

				if(touches.length == 2){//双指点击
					pt_pos1 = getTouchPos( e.touches[0]);
					pt_pos2 = getTouchPos( e.touches[1]);
					pt_len = getDist(pt_pos1,pt_pos2);
					pt_angle = getAngle(pt_pos1,pt_pos2);
				}
			}
			var moveEvtHandler = function(e){
				e.preventDefault();
				var touches = e.touches;
				if(!touches) return;
				if(touches.length == 2){//双指点击

					var ct_pos1 = getTouchPos( e.touches[0]);
					var ct_pos2 = getTouchPos( e.touches[1]);
					var ct_len = getDist(ct_pos1 , ct_pos2);
					var ct_angle = getAngle(ct_pos1,ct_pos2);
					var scale = ct_len / pt_len; 
					var rotate = ct_angle - pt_angle;

					handler.call(ele,{
						oriEvt:e,
						type:"transform",
						scale:scale,
						rotate:rotate
					});
				}
			}

			$E.on(ele,startEvt,startEvtHandler);
			$E.on(ele,moveEvt,moveEvtHandler);
			var evtOpt = {
				ele:ele,
				evtType:"transform",
				handler:handler
			}
			evtOpt.actions = {};
			evtOpt.actions[startEvt] = startEvtHandler;
			evtOpt.actions[moveEvt] = moveEvtHandler;

			customEventHandlers.push(evtOpt);		
		},
		scrollstart:function(ele,handler){
			var isScrolling;
			var scrollTimeId;
			var scrollHandler = function(e){
				if(!isScrolling){
					isScrolling = true;
					handler.call(ele,{
						oriEvt:e,
						type:"scrollstart"
					});
				}
				clearTimeout(scrollTimeId);
				scrollTimeId = setTimeout(function(){
					isScrolling = false;
				},250);
			}	
			$E.on(ele,"scroll",scrollHandler);	

			var evtOpt = {
				ele:ele,
				evtType:"scrollstart",
				handler:handler
			};	
			evtOpt.actions = {};
			evtOpt.actions["scroll"] = scrollHandler;
			customEventHandlers.push(evtOpt);
		},
		scrollend:function(ele,handler){
			var scrollTimeId;
			var scrollHandler = function(e){
				clearTimeout(scrollTimeId);
				scrollTimeId = setTimeout(function(){
					handler.call(ele,{
						oriEvt:e,
						type:"scrollend"
					});
				},250);
			}	
			$E.on(ele,"scroll",scrollHandler);		

			var evtOpt = {
				ele:ele,
				evtType:"scrollend",
				handler:handler
			};	
			evtOpt.actions = {};
			evtOpt.actions["scroll"] = scrollHandler;
			customEventHandlers.push(evtOpt);
		}

	}
	// var fixedEventHandlers = [];

	// var resizeHandler = function(e){
	// 	var p = window.innerWidth / window.innerHeight;
	// 	p > 1 ? window.orientation = 90 : window.orientation = 0;
	// 	handler.call(window);
	// }
	// //dom事件修复
	// var domFixedEvent = {
	// 	_off:function(ele,evtType,handler){
	// 		if(evtType == "orientationchange"){
	// 			if(ele != window) return;
	// 			$E.off(window,"resize",resizeHandler);
	// 		}
	// 	},
	// 	orientationchange:function(ele,handler){
	// 		//对window的orientationchange进行fix
	// 		if(ele != window || "onorientationchange" in ele){
	// 			return false;
	// 		}
	// 		$E.on(ele,"resize",resizeHandler);
	// 		return true;
	// 	}
	// }

	cm.event = $E;
});
//Util
cm.$package(function(cm){
	var $D = cm.dom,
		$E = cm.event,
		$T = cm.type;
	var preventScroll = function(e){
        if (e.target.type === 'range') { return; }
            e.preventDefault();
	}
	var hideScroll = function(){
		setTimeout(function(){
			if(!location.hash){
				var ph = window.innerHeight + 60;
				if(document.documentElement.clientHeight < ph){
					$D.setStyle(document.body,"minHeight",ph + "px");
				}
				window.scrollTo(0,1);
			}
		},200);
	}
		

	var Util = {
		//隐藏URL栏
		hideUrlBar:function(){
			$E.on(window ,"load" ,hideScroll);
		},
		//禁止滚动
		preventScrolling : function() {
	 	    $E.on(document ,'touchmove' ,preventScroll);
    	},
    	//启用滚动
    	activeScrolling:function(){
    		$E.off(document ,'touchmove' ,preventScroll);
    	},
		//滚动到顶部动画(css3动画)
		scrollToTop:function(duration,runType){
			var $A = cm.Animation;
			var body = document.body;
			var scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

			$D.setStyle(body, $D.getVendorPropertyName("transform"), "translate3d(0,"+ (- scrollTop) + "px,0)");
			body.scrollTop ? body.scrollTop = 0:document.documentElement.scrollTop = 0;	
		
			new $A({
				selector:body,
				duration:duration,
				runType:runType,
				use3d:true
			}).translateY(0).transit();
		
		}
	};
	cm.Util = Util;
});

//animation time, runType ,scale, rotate, rotateX, rotateY, translateX, translateY, skewX, skewY
cm.$package(function(cm){
	var $D = cm.dom,
		$E = cm.event,
		$T = cm.type;
	
 	//3d支持
 	var support3d = $D.isSupprot3d();
 	var finishedCount = 0;

	var Animation = cm.Class({
		init:function(options){
		
			this.setElems(options.selector);
			this.setDuration(options.duration || 1000);
			this.setRunType(options.runType || "ease-in-out");
			this.setDelay(options.delay || 0);
			this.setUsed3d(options.use3d);
			this.transformArr = [];
		},
		setDuration:function(duration){
			this.duration = duration;
			return this;
		},
		setDelay:function(delay){
			this.delay = delay;
			return this;
		},
		setElems:function(selector){
			if($T.isString(selector)){
				this.elems = $D.$(selector);
			}
			else if($T.isArray(selector)){
				this.elems = selector;
			}
			else if(selector.tagName){
				this.elems = [selector];
			}
			return this;
		},
		setRunType:function(runType){
			this.runType = runType;
			return this;
		},
		setUsed3d:function(use3d){
			this.use3d = use3d;
			return this;
		},
		scale:function(scale){
			this.transformArr.push("scale(" + scale + ")");
			return this;
		},
		scaleX:function(scaleX){
			this.transformArr.push("scalex(" + scaleX + ")");
			return this;
		},
		scaleY:function(scaleY){
			this.transformArr.push("scaley(" + scaleY + ")");
			return this;
		},
		rotate:function(rotate){
			this.transformArr.push("rotate(" + rotate + "deg)");
			return this;
		},
		rotateX:function(rotateX){
			this.transformArr.push("rotatex(" + rotateX + "deg)");
			return this;
		},
		rotateY:function(rotateX){
			this.transformArr.push("rotatey(" + rotateY + "deg)");
			return this;
		},
		rotateZ:function(rotateZ){
			this.transformArr.push("rotatez(" + rotateZ + "deg)");
			return this;
		},
		translate:function(translateX,translateY,translateZ){
			if(support3d && translateZ)
				this.transformArr.push("translate3d" + '(' + translateX + ',' + translateY + ','+ translateZ +')');
			else
				this.transformArr.push("translate" + '(' + translateX + ',' + translateY + ')');
			return this;
		},
		translateX:function(translateX){
			this.translate(translateX,0);
			return this;
		},
		translateY:function(translateY){
			this.translate(0,translateY);
			return this;
		},	
		skew:function(x,y){
			this.transformArr.push("skew(" + x + "deg," + y + "deg)");
			return this;
		},
		skewX:function(x){
			this.transformArr.push("skewx(" + x + "deg)");
			return this;
		},	
		skewY:function(y){
			this.transformArr.push("skewy(" + y + "deg)");
			return this;
		},	
		setStyle:function(styleName,styleValue){
			var s = "";
			if($T.isUndefined(this.styleStr)) this.styleStr = "";
			//样式变化
			if($T.isObject(styleName)){
				cm.each(styleName ,function(sv,sn){
					s += $D.toCssStyle($D.getVendorPropertyName(sn)) + ":" + sv + ";";
				});
			}
			else if($T.isString(styleName)){
				s += $D.toCssStyle($D.getVendorPropertyName(styleName)) + ":" + styleValue + ";";
			}
			this.styleStr += s;
			return this;
			
		},
		toOrigin:function(){
			this.transformArr = [];
			return this;
		},
		transit:function(onFinished){
			var self = this;
			var elems = this.elems;
			cm.each(elems ,function(e){
				self._transit(e);
			});
			window.setTimeout(function(){
				$E.fire(self,"end");
				cm.each(elems,function(elem){
					$D.setStyle(elem ,$D.getVendorPropertyName("transition") ,"");
				});
				onFinished && onFinished.call(self);
			},this.duration);
			return this;
		},
		_transit:function(elem){
		
			var self = this;
			var transformStr = this.transformArr.join(" ");
			if(support3d && this.use3d){
				transformStr += " translatez(0)";
			}

			var aStr =  "all"
						+ ' ' + this.duration/1000 + 's ' 
						+ this.runType
						+ ' ' + this.delay/1000 + 's';
				
			$D.setStyle(elem ,$D.getVendorPropertyName("transition") ,aStr);
			
			elem.style[$D.getVendorPropertyName("transform")] = transformStr;
			elem.style.cssText += this.styleStr;

			$E.fire(this ,"start");
		}
	});
	cm.Animation = Animation;
});

//http
cm.$package(function(cm){
	var http = {
		serializeParam : function ( param ) {
			if ( !param ) return '';
			var qstr = [];
			for ( var key in  param ) {
				qstr.push( encodeURIComponent(key) + '=' + encodeURIComponent(param[key]) );
			};
			return  qstr.join('&');
		},
		getUrlParam :  function ( name ,href ,noDecode ) {
			var re = new RegExp( '(?:\\?|#|&)' + name + '=([^&]*)(?:$|&|#)',  'i' ), m = re.exec( href );
			var ret = m ? m[1] : '' ;
			return !noDecode ? decodeURIComponent( ret ) : ret;
		},
		ajax : function ( option ) {
			var o = option;
			var m = o.method.toLocaleUpperCase();
			var isPost = 'POST' == m;
			var isComplete = false;
			var overtime = o.overtime;

			var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : false;
			if ( !xhr ) {
			 	o.error && o.error.call( null, { ret : 999 , msg : 'Create XHR Error!' } );
			 	return false;
			}

			var qstr = http.serializeParam( o.param );

			// get 请求 参数处理
			!isPost && ( o.url += ( o.url.indexOf( '?' ) > -1 ?  '&' : '?' ) + qstr );

			xhr.open( m, o.url, true );

			isPost && xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );

			xhr.onreadystatechange = function(){
				if ( 4 == xhr.readyState ) {
					var status = xhr.status;
					if ( (status >= 200 && status < 300) || status == 304) {
						var response = xhr.responseText.replace( /(\r|\n|\t)/gi, '' );
						// var m = /callback\((.+)\)/gi.exec( response );
						// var result = { ret : 998, msg : '解析数据出错，请稍后再试' };
						// try{ result = eval( '(' + m[1] + ')' ) } catch ( e ) {};
						// result = eval( '(' + m[1] + ')' )
						o.success && o.success(JSON.parse(response),xhr);
					}else{
						o.error && o.error(xhr);
					};
					isComplete = true;
				}
				
			};
			

			xhr.send( isPost ? qstr : void(0) );
	
			if(overtime){
				setTimeout(function(){
					if(!isComplete){
						xhr.abort();//不abort同一url无法重新发送请求？
						o.timeout && o.timeout(xhr);
					}
				},overtime);
			}

			return xhr;
		}	
	}
	cm.http = http;
});


