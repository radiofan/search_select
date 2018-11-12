//Author: RADIOFAN
jQuery(document).ready(function ($) {
	
	/*
	* Функция экранирования спецсимволов
	* Возвращает экранированную строку
	*
	* Function for escape special symbols
	* Return screened string
	*/
	function escapeRegExp(txt){
		return txt.replace(/[-[\]{}()*+?.\\^$|\s]/g, "\\$&");
	}
	
	/*
	* Функция сортировки списка
	* Получает значение инпута и список опций jQuery
	* Создаёт регулярку на основе значения инпута
	* Не удовлетворяющие регулярке опции скрываются
	* Остальные сортируются в алфавитном порядке,
	* причём сначала идут совпадения с началом строки
	* Возвращает отсортированный лист опций
	*
	* List sorting function
	* Gets the value of the input, and a list of options jQuery
	* Creates a regular based on the input value
	* Options that do not satisfy the regular expression are hidden
	* The rest are sorted alphabetically,
	* and first there are matches with the beginning of the line
	* Returns a sorted list of options
	*/
	function sortList(text, box){
		text = escapeRegExp(text);
		var reg1 = new RegExp('^'+text, 'ig');
		var reg2 = new RegExp(text, 'ig');
		var $result1 = $(box).filter(function(ind, el){
			$(el).show().removeClass('select-region');
			return reg1.test($(el).text());
		});
		box = $(box).not($result1);
		var $result2 = $(box).filter(function(ind, el){
			return reg2.test($(el).text());
		});
		box = $(box).not($result2);
		$(box).each(function(ind, el){
			$(el).hide();
		});
		$($result1).sort(function(a, b){
			return $(a).show().text().localeCompare($(b).show().text());
		});
		$result1 = $($result1).detach();
		$($result2).sort(function(a, b){
			return $(a).show().text().localeCompare($(b).show().text());
		});
		$result2 = $($result2).detach();
		box = $($result2).add(box);
		box = $($result1).add(box);
		return box;
	}
	
	/*
	* Устанавливаем обработчики для каждого инпута
	*
	* Set handlers for each input
	*/
	$('.radiofan-input').each(function (ind, el){
		//Сумма высот видимых опций находящиеся до выбранной опции и её самой
		//The sum of the heights of the visible options located before the selected option and it's most
		var scrol = 0;
		//Направление движения
		//Direction of scroll
		var scroling = 0;
		$(el).children('input').on({
			//Фокус - появление списка и замена значения-по-умолчанию на введённое до этого значение
			//Focus - the list appears and the default value replaces with the previously entered value
			focus: function(e){
				if($(this).data('flag')){
					$(this).val($(this).data('value'));
				}else if($(this).val() == '' || $(this).data('value') !== $(this).val()){
					$(this).data('flag', true);
				}
				$(this).siblings('.radiofan-select').slideDown({
				  duration: 200,
				  easing: "linear",
				  queue: true
				});
			},
			//Выход из фокуса - скрытие списка, невалидное значение заменяется значением-по-умолчанию, показ предупреждения
			//Out of focus - hiding the list, the invalid value is replaced with the default value, show the warning
			blur: function(e){
				if($(this).data('flag')){
					$(this).data('value', $(this).val());
					$(this).val($(el).find('.radiofan-option.default-region:last').text());
					var $tooltip = $(el).children('.radiofan-tooltip').show();
					setTimeout(function(){$($tooltip).fadeOut(600)}, 5000);
				}
				$(this).siblings('.radiofan-select').slideUp({
				  duration: 100,
				  easing: "linear",
				  queue: true
				});
			},
			//Изменение значения - сортировка списка относительно нового значения, отмена выбора региона
			//Change input value - sort the list relative to the new value, deselect the region
			input: function(e){
				var val = $(this).val();
				$(this).data('flag', true);
				scrol = 0;
				scroling = 0;
				$(el).children('.radiofan-select').scrollTop(scrol);
				val = val.trim();
				//Если значение пустое, то показывем список опций
				//If input value is empty, then the list appears
				if(val == ''){
					var $list = $(el).find('.radiofan-option:not(.default-region)');
					$list.sort(function(a, b){
						return $(a).show().removeClass('select-region').text().localeCompare($(b).show().removeClass('select-region').text());
					});
					$list = $list.detach();
					$(el).find('ul').prepend($list);
				}else{
					//Функция сортировки
					var $list = $(el).find('.radiofan-option:not(.default-region)').detach();
					$list = sortList(val, $list);
					$(el).find('ul').prepend($list);
					//Если имеется полное совпадение то присваиваем инпуту значение опции
					//If there is a full match, assign the value of the option to the input
					var reg = new RegExp('^'+escapeRegExp(val)+'$', 'ig');
					var txt = $($list).eq(0).text();
					if(reg.test(txt)){
						$(this).val(txt).data({
						  value: txt,
						  flag: false
						});
					}
				}
			}
		});

		//Выбор региона с помощью стрелок и Enter'а
		//Region selection with the arrow keys and Enter key
		var $opt;//Выбранная опция
		$(el).keydown(function(e){
			if($(el).children('.radiofan-select').is(':visible')){
				switch(e.which){
					case 38://↑
						e.preventDefault();
						$opt = $(el).find('.radiofan-option.select-region');
						if($($opt).size()){
							if($($opt).prevAll('.radiofan-option:visible:first').addClass('select-region').size() == 0){
								$($opt).removeClass('select-region');
								scroling = 0;
							}else{
								$($opt).removeClass('select-region');
								//ПРОЛИСТЫВАНИЕ
								//SCROLL
								var height = $($opt).prevAll('.radiofan-option:visible:first').outerHeight();//Высота предыдущей опции
								height += $($opt).prev('hr').outerHeight(true);
								scrol -= height;
								if(scrol < $(el).children('.radiofan-select').scrollTop()){
									$(el).children('.radiofan-select').scrollTop(scrol);
								}
							}
						}else if(scroling == 1){
							scrol -= $(el).find('.radiofan-option:last')
							.addClass('select-region')
							.outerHeight();//Высота следующей опции
							scroling = 2;
						}
						break;
					case 40://↓
						e.preventDefault();
						$opt = $(el).find('.radiofan-option.select-region');
						if($($opt).size()){
							if($($opt).nextAll('.radiofan-option:visible:first').addClass('select-region').size() == 0){
								$($opt).removeClass('select-region');
								scroling = 1;
							}else{
								$($opt).removeClass('select-region');
								//ПРОЛИСТЫВАНИЕ
								//SCROLL
								var height = $($opt).nextAll('.radiofan-option:visible:first').outerHeight();//Высота следующей опции
								height += $($opt).next('hr').outerHeight(true);
								scrol += height;
								var selht = $(el).children('.radiofan-select').height();
								if(scrol - $(el).children('.radiofan-select').scrollTop() > selht){
									$(el).children('.radiofan-select').scrollTop(scrol - selht);
								}
							}
						}else if(scroling == 0){
							scrol += $(el).find('.radiofan-option:visible:first')
							.addClass('select-region')
							.outerHeight();//Высота следующей опции
							scroling = 2;
						}
						break;
					case 13://enter
						e.preventDefault();
						$opt = $(el).find('.radiofan-option.select-region');
						if($($opt).size()){
							$($opt).removeClass('select-region');
							scroling = 0;
							scrol = 0;
							$(el).children('input').data({
							  value: $($opt).text(),
							  flag: false
							})
							.val($($opt).text())
							.blur();
							//Если выбран регион по умолчанию, то показать предупреждение
							//If the default region is selected, show a warning
							if($($opt).hasClass('default-region')){
								var $tooltip = $(el).children('.radiofan-tooltip').show();
								setTimeout(function(){$($tooltip).fadeOut(600)}, 5000);
							}
							//Сортировка списка после выбора значения
							//Sort the list after selecting a value
							var $list = $(el).find('.radiofan-option:not(.default-region)').detach();
							$list = sortList($($opt).text(), $list);
							$(el).find('ul').prepend($list);
							$(el).children('.radiofan-select').scrollTop(scrol);
						}else{
							$(el).children('input').blur();
						}
						break;
					default:
						break;
				}
			}
		});
		
		//Выбор опции по клику нан ней
		//Select an option by clicking on it
		$(el).find('.radiofan-option').each(function (index, elem){
			$(elem).mousedown(function(e){
				e.preventDefault();
				scroling = 0;
				scrol = 0;
				var txt = $(elem).text();
				$(el).children('input').data({
				  value: txt,
				  flag: false
				})
				.val(txt)
				.blur();
				if($(elem).hasClass('default-region')){
					var $tooltip = $(el).children('.radiofan-tooltip').show();
					setTimeout(function(){$($tooltip).fadeOut(600)}, 5000);
				}
				var $list = $(el).find('.radiofan-option:not(.default-region)').detach();
				$list = sortList(txt, $list);
				$(el).find('ul').prepend($list);
				$(el).children('.radiofan-select').scrollTop(scrol);
			});
		});
	});
});