const mix = require('laravel-mix');

mix.setResourceRoot('');

mix.js('src/js/entity-filter.js', 'dist');
mix.copyDirectory('dist', 'demo/resources');