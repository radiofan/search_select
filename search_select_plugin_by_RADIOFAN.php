<?php
/*
Plugin Name: Search and Select plugin
Plugin URI: https://github.com/radiofan/search_select
Description: This is a search and select plugin
Version: 1.0
Author: RADIOFAN
Author URI: http://vk.com/radio_fan
*/

add_action( 'wp_enqueue_scripts', 'example_style' );
function example_style(){
	wp_register_style('example_style', plugins_url('example_style.css', __FILE__));
	wp_enqueue_style('example_style');
}

add_action( 'wp_enqueue_scripts', 'example_scripts' );
function example_scripts(){
	wp_register_script('example_scripts', plugins_url('example_scripts.js', __FILE__), array('jquery'));
	wp_enqueue_script('example_scripts');
}

add_shortcode('example', 'example');

function example($attrs, $content = '' ){
$text= <<<CONTENT
<div class="radiofan-search">
	<div class="radiofan-input">
		<input type="text" name="calculate-location-from" class="form-control ts-calculate-form">
		<div class="radiofan-tooltip">Введенное значение не было найдено в списке, поэтому оно заменено на значение по умолчанию.</div>
		<div class="radiofan-select">
			<ul>
				<li class="radiofan-option">Hello</li>
				<li class="radiofan-option">world</li>
				<li class="radiofan-option">!</li>
				<li class="radiofan-option">Привет</li>
				<li class="radiofan-option">мир</li>
				<li class="radiofan-option">!</li>
				<li class="radiofan-option">JavaScript</li>
				<li class="radiofan-option">MySQL</li>
				<li class="radiofan-option">HTML</li>
				<li class="radiofan-option">PHP</li>
				<li class="radiofan-option">wordpress</li>
				<li class="radiofan-option">C++</li>
				<li class="radiofan-option">python</li>
				<li class="radiofan-option">fallout</li>
				<li class="radiofan-option">JQuery</li>
				<li class="radiofan-option">CSS</li>
				<li class="radiofan-option">АлисА</li>
				<li class="radiofan-option">Трасса Е-95</li>
				<li class="radiofan-option">Веретено</li>
				<li class="radiofan-option">Ария</li>
				<li class="radiofan-option">Беспечный ангел</li>
				<hr>
				<li class="radiofan-option default-region">by</li>
				<li class="radiofan-option default-region">RADIOFAN</li>
			</ul>
		</div>
	</div>
</div>
CONTENT;
	return $text;
}
?>