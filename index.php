<?php

require_once __DIR__ . '/vendor/autoload.php';

$loader = new Twig_Loader_Filesystem(__DIR__ . '/src/Templates');
$twig = new Twig_Environment($loader);

try {
    $template = $twig->load('index.twig');
} catch (Exception $e) {
    echo 'An unknown error occured.';
}
echo $template->render();
