(function($){
	
	var escapes = ['id', 'value', 'data-value'];
	var methods = {
		init: function(options, customs){
			return this.map(function(ind, select){
				var $select = $(select);
				switch(select.tagName.toLowerCase()){
					case 'select':
						$select = methods.gen_select.apply($select, []);
						break;
					case 'input':
						if($select.attr('type').toLowerCase() === 'text' && !$select.data('searchSelect')){
							$select = methods.gen_input.apply($select, []);
							break;
						}
					default:
						console.group('Search-select');
						console.dir($select);
						$.error('Can\'t init \'' + select.tagName + '\' for jQuery.searchSelect');
						console.groupEnd();
						return;
						break;
				}
				var data = $select.data('searchSelect');
				data.scrol = 0;//Сумма высот видимых опций находящиеся до выбранной опции и её самой
				data.scroling = 1;//Направление движения 1 - вниз, -1 - вверх, 0 - за пределами
				$select.data('searchSelect', data);
				$select.find('div.radiofan-input')
				.on('keydown.searchSelect', {'select': $select}, methods.boardNav)
				.on('mousedown.searchSelect', '.radiofan-option', {'select': $select}, methods.optClick)
				.children('input.radiofan-input')
				.on({
				  'focus.searchSelect': methods.inputFocus,
				  'blur.searchSelect':  methods.inputBlur,
				  'input.searchSelect': methods.inputChange
				}, {'select': $select});
				if(options)
					methods.addOption.apply($select, [options]);
				return $select;
			});
		},
		
		addOption: function(options){
			return this.each(function(ind, elem){
				$elem = $(elem);
				if(!($elem.hasClass('radiofan-search') && $elem.data('searchSelect'))){
					console.warn('this isn\'t search-select');
					console.groupEnd();
					return $elem;
				}
				if(!$.isArray(options))
					options = [options];
				let out = '';
				let temp = '';
				for(let key in options){
					temp = '';
					if(typeof(options[key]) !== 'object'){
						console.warn('Invalid variable type \''+typeof(options)+'\'');
						continue;
					}
					if(!options[key].hasOwnProperty('val')){
						console.warn('\'val\' property is missing');
						continue;
					}
					if(!options[key].hasOwnProperty('text'))
						options[key].text = options[key].val.trim()
					if(!options[key].text){
						console.warn('\'text\' property is missing');
						continue;
					}
					if(!options[key].hasOwnProperty('atts') || typeof(options[key].atts) !== 'object'){
						options[key].atts = {};
					}
					if(options[key].atts.hasOwnProperty('class')){
						options[key].atts.class += ' radiofan-option';
					}else{
						options[key].atts.class = 'radiofan-option';
					}
					for(let attr in options[key].atts){
						if(!(attr.match(/^[a-zA-Z_\\-]+$/) && escapes.indexOf(attr.toLowerCase()) === -1))
							continue;
						temp += ' '+attr.toLowerCase()+'="'+options[key].atts[attr]+'"';
					}
					out += '<li' + temp + ' data-value="'+options[key].val+'">'+options[key].text+'</li>\n';
				}
				$elem.find('ul').append(out);
				return $elem;
			});
		},
		
		selectOpt: function(val, text){
			return this.each(function(ind, $elem){
				let data = $elem.data('searchSelect');
				if(!$.isEmptyObject(data)){
					val = val || '';
					text = text || '';
					if($elem.get(0).tagName.toLowerCase() === 'input' && $elem.hasClass('radiofan-input')){
						$elem = $elem.closest('.radiofan-search');
					}else if($elem.get(0).tagName.toLowerCase() !== 'div' || !$elem.hasClass('radiofan-search')){
						console.error($elem + ' isn\'t searchSelect');
					}
					let flag = true;
					if(val && text){
						let $opt = $elem.find('.radiofan-option[data-value = '+val+']');
						if($opt.size()){
							$opt.each(function(i, el){
								if(flag && $opt.get(i).text() === text){
									flag = false;
									$opt.eq(i).mousedown();
								}
							});
						}
					}else if(val){
						let $opt = $elem.find('.radiofan-option[data-value = '+val+']');
						if($opt.size()){
							$opt.eq(0).mousedown();
						}
					}else if(text){
						let $opt = $elem.find('.radiofan-option');
						if($opt.size()){
							$opt.each(function(i, el){
								if(flag && $opt.get(i).text() === text){
									flag = false;
									$opt.eq(i).mousedown();
								}
							});
						}
					}
				}
			});
		},
		
		escapeRegExp: function(txt){
			return txt.replace(/[-[\]{}()*+?.\\^$|\s]/g, "\\$&");
		},
		
		compareStr: function(a, b){
			return $(a).show().text().localeCompare($(b).show().text());
		},
		
		sortList: function(text, box){
			text = methods.escapeRegExp(text);
			var reg1 = new RegExp('^'+text, 'i');
			var reg2 = new RegExp(text, 'i');
			var $result1 = box.filter(function(ind, el){
				$(el).show().removeClass('select-region');
				return reg1.test($(el).text());
			});
			box = box.not($result1);
			var $result2 = box.filter(function(ind, el){
				return reg2.test($(el).text());
			});
			box = box.not($result2);
			box.each(function(ind, el){
				$(el).hide();
			});
			$result1.sort(methods.compareStr);
			$result2.sort(methods.compareStr);
			$result1 = $result1.detach();
			$result2 = $result2.detach();
			box = $result2.add(box);
			box = $result1.add(box);
			return box;
		},
		
		scrolReset: function($select){
			let data = $select.data('searchSelect');
			data.scroling = 1;
			data.scrol = 0;
			$select.data('searchSelect', data);
			$select.children().children('.radiofan-select').scrollTop(data.scrol);
		},
		
		gen_select: function(){
			let opts = '';
			let temp, temp1;
			this.find('option').each(function(ind, el){
				temp1 = '';
				temp = $(el);
				for(let attr in temp.attributes){
					if(escapes.indexOf(attr.toLowerCase()) === -1 && attr.toLowerCase() !== 'class')
						temp1 += ' '+attr.toLowerCase()+'="'+temp.attributes[attr]+'"';
				}
				opts += '<li class="radiofan-option" data-value="' + temp.attr('value')
						 + '"' + temp1 + '>' + temp.text() + '</li>\n';
			});
			temp = this.attr('name');
			let $this = this.wrap('<div class="radiofan-search"></div>').parent();
			$this.html('<div class="radiofan-input">\n<input type="hidden" name="'+temp+'">\n<input type="text" class="radiofan-input '+(this.attr('class') || '')+'" autocomplete="off" spellcheck="false" data-search-select="1">\n<div class="radiofan-select" style="display:none;">\n<ul>\n'+opts+'</ul>\n</div>\n</div>');
			$this.data('searchSelect', {'name': temp}).find('input.radiofan-input').data({'searchSelectName': name, 'searchSelect': {}});
			return $this;
		},
		
		gen_input: function(){
			let name = this.attr('name');
			let $this = this.wrap('<div class="radiofan-search"></div>').parent();
			$this.html('<div class="radiofan-input">\n<input type="hidden" name="'+name+'">\n<input type="text" class="radiofan-input '+(this.attr('class') || '')+'" autocomplete="off" spellcheck="false" data-search-select="1">\n<div class="radiofan-select" style="display:none;">\n<ul>\n</ul>\n</div>\n</div>');
			$this.data('searchSelect', {'name': name}).find('input.radiofan-input').data({'searchSelectName': name, 'searchSelect': {}});
			return $this;
		},
		
		//дальше нельзя вызвать
		boardNav: function(e){
			var $input = $(this);
			var $opt;
			let temp = {'exec': 0};
			if($input.children('.radiofan-select').is(':visible')){
				switch(e.which){
					case 38://↑
						temp.exec = -1;
						temp.act = 'prev';
						temp.elem = 'last';
						break;
					case 40://↓
						temp.exec = 1;
						temp.act = 'next';
						temp.elem = 'first';
						break;
					case 13://enter
						temp.exec = 2;
						break;
				}
				if(temp.exec){
					e.preventDefault();
					//let $parent = $input.parent();
					let $parent = e.data.select;
					$opt = $input.find('.radiofan-option.select-region');
					let data = $parent.data('searchSelect');
					
					if(temp.exec == 2){
						if($opt.size()){
							$opt.removeClass('select-region');
							methods.scrolReset($parent);
							$input.children('input')
                            .data('searchSelect', {
							  value: $opt.text(),
							  flag:  false,
							  opt:   $opt
							})
							.val($opt.text())
							.blur();
							let $list = $input.find('.radiofan-option').detach();
							$list = methods.sortList($opt.text(), $list);
							$input.find('ul').prepend($list);
						}else{
							$input.children('input').blur();
						}
					}else{
						if($opt.size()){
							if($opt[temp.act+'All']('.radiofan-option:visible:first').addClass('select-region').size() == 0){
								$opt.removeClass('select-region');
								data.scroling = -temp.exec;
								$parent.data('searchSelect', data);
							}else{
								$opt.removeClass('select-region');
								//ПРОЛИСТЫВАНИЕ
								let height = $opt[temp.act+'All']('.radiofan-option:visible:first').outerHeight();//Высота следующей опции
								height += $opt[temp.act]('hr').outerHeight(true);
								data.scrol += temp.exec*height;
								$parent.data('searchSelect', data);
								
								let $select = $input.children('.radiofan-select');
								if(temp.exec == -1){
									if(data.scrol < $select.scrollTop()){
										$select.scrollTop(data.scrol);
									}
								}else{
									let selht = $select.height();
									if(data.scrol - $select.scrollTop() > selht){
										$select.scrollTop(data.scrol - selht);
									}
								}
							}
						}else if(data.scroling == temp.exec){
							data.scrol += temp.exec * $input.find('.radiofan-option:visible:'+temp.elem)
							.addClass('select-region')
							.outerHeight();//Высота следующей опции
							data.scroling = 0;
							$parent.data('searchSelect', data);
						}
					}
				}
			}
		},
		
		optClick: function(e){
			e.preventDefault();
			methods.scrolReset(e.data.select);
			let txt = $(this).text();
			e.data.select.find('input.radiofan-input')
            .data('searchSelect', {
			  value: txt,
			  flag:  false,
			  opt:   $(this)
			})
			.val(txt)
			.blur();
			let $select = $(this).closest('.radiofan-select');
			let $list = $select.find('.radiofan-option').detach();
			$list = methods.sortList(txt, $list);
			$select.find('ul').prepend($list);
		},
		
		inputFocus: function(e){
			let $input = $(this);
			let data = $input.data('searchSelect');
			if(data.flag){
				$input.val(data.value);
			}else if($input.val() == '' || data.value !== $input.val()){
				data.flag = true;
				$input.data('searchSelect', data);
			}
			$input.siblings('.radiofan-select').slideDown({
			  duration: 200,
			  easing: "linear",
			  queue: true
			});
		},
		
		inputBlur: function(e){
			let $input = $(this);
			let data = $input.data('searchSelect');
			if(data.flag){
				data.value = $input.val();
				$input.data('searchSelect', data);
                $input.val('');
				$input.siblings('input[name = '+$input.data('searchSelectName')+' ]').val('');
			}else{
				$input.siblings('input[name = '+$input.data('searchSelectName')+' ]').val(data.opt.data('value'));
				$input.trigger('rad_select_complete', [data.opt]);//Выбор опции
			}
			$input.siblings('.radiofan-select').slideUp({
			  duration: 100,
			  easing: "linear",
			  queue: true
			});
		},
		
		inputChange: function(e){
			$input = $(this);
			let val = $input.val();
			let data = $input.data('searchSelect');
			data.flag = true;
			$input.data('searchSelect', data);
			$input.trigger('rad_select_change', [val]);
			let $select = $input.siblings('.radiofan-select');
			
			methods.scrolReset(e.data.select);
			
			val = val.trim();
			if(val == ''){
				var $list = $select.find('.radiofan-option');
				$list.sort(function(a, b){
					return $(a).show().removeClass('select-region').text().localeCompare($(b).show().removeClass('select-region').text());
				});
				$list = $list.detach();
				$select.find('ul').prepend($list);
			}else{
				//Функция сортировки
				var $list = $select.find('.radiofan-option').detach();
				$list = methods.sortList(val, $list);
				$select.find('ul').prepend($list);
				var reg = new RegExp('^'+methods.escapeRegExp(val)+'$', 'ig');
				var txt = $list.eq(0).text();
				if(reg.test(txt)){
					$input.val(txt).data('searchSelect', {
					  value: txt,
					  flag:  false,
					  opt:   $list.eq(0)
					});
				}
			}
		}
	};
		
	$.fn.searchSelect = function(method){
		if(!method || typeof(method) === 'object'){
			return methods.init.apply(this, arguments);
		}else if(methods[method] && ['inputChange', 'inputBlur', 'inputFocus', 'optClick', 'boardNav'].indexOf(method) === -1){
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}else{
			console.error('Call undefined method \'' +  method + '\' for jQuery.searchSelect');
		}
	};
})(jQuery);