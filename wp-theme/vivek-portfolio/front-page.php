<?php
/* Template: Front Page rendering static sections */
if (!defined('ABSPATH')) { exit; }
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<?php /* Include the existing static HTML from index.html */ ?>
<?php
	// Load the built static HTML as content for now
	$static = get_template_directory() . '/static-index.html';
	if (file_exists($static)) {
		readfile($static);
	}
?>

<?php wp_footer(); ?>
</body>
</html>


