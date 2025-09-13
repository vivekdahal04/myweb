<?php
/**
 * Theme setup and assets
 */

if (!defined('ABSPATH')) { exit; }

add_action('after_setup_theme', function () {
	add_theme_support('title-tag');
	add_theme_support('post-thumbnails');
});

add_action('wp_enqueue_scripts', function () {
	// Vendor CSS (Bootstrap, icons, swiper)
	wp_enqueue_style('bootstrap-css', get_template_directory_uri() . '/assets/vendor/bootstrap/css/bootstrap.min.css', [], '5.3');
	wp_enqueue_style('bootstrap-icons', get_template_directory_uri() . '/assets/vendor/bootstrap-icons/bootstrap-icons.css', [], '1.11');
	wp_enqueue_style('boxicons', get_template_directory_uri() . '/assets/vendor/boxicons/css/boxicons.min.css', [], '2.1');
	wp_enqueue_style('glightbox', get_template_directory_uri() . '/assets/vendor/glightbox/css/glightbox.min.css', [], '3.3');
	wp_enqueue_style('swiper-css', get_template_directory_uri() . '/assets/vendor/swiper/swiper-bundle.min.css', [], '9');

	// Theme CSS
	wp_enqueue_style('vivek-style', get_template_directory_uri() . '/assets/css/style.css', ['bootstrap-css'], '1.0');

	// Vendor JS
	wp_enqueue_script('bootstrap-js', get_template_directory_uri() . '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', [], '5.3', true);
	wp_enqueue_script('glightbox-js', get_template_directory_uri() . '/assets/vendor/glightbox/js/glightbox.min.js', [], '3.3', true);
	wp_enqueue_script('isotope-js', get_template_directory_uri() . '/assets/vendor/isotope-layout/isotope.pkgd.min.js', [], '3.0', true);
	wp_enqueue_script('swiper-js', get_template_directory_uri() . '/assets/vendor/swiper/swiper-bundle.min.js', [], '9', true);
	wp_enqueue_script('waypoints-js', get_template_directory_uri() . '/assets/vendor/waypoints/noframework.waypoints.js', [], '4.0', true);
	wp_enqueue_script('purecounter-js', get_template_directory_uri() . '/assets/vendor/purecounter/purecounter.js', [], '1.0', true);

	// Main JS
	wp_enqueue_script('vivek-main', get_template_directory_uri() . '/assets/js/main.js', ['swiper-js', 'waypoints-js'], '1.0', true);
});

// Register a primary menu so header markup can be dynamic later if needed
add_action('init', function () {
	register_nav_menus([
		'primary' => __('Primary Menu', 'vivek-portfolio'),
	]);
});


