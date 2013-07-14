#!/usr/bin/env node
/*
 *
 * Copyright 2013 Anis Kadri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

// copyright (c) 2013 Andrew Lunny, Adobe Systems
var path = require('path')
    , url = require('url')
    , package = require(path.join(__dirname, 'package'))
    , nopt = require('nopt')
    , plugins = require('./src/util/plugins')
    , plugman = require('./plugman');

var known_opts = { 'platform' : [ 'ios', 'android', 'blackberry10', 'wp7', 'wp8' ]
        , 'project' : path
        , 'plugin' : [String, path, url]
        , 'install' : Boolean
        , 'uninstall' : Boolean
        , 'adduser' : Boolean
        , 'publish' : Boolean 
        , 'unpublish' : Boolean 
        , 'search' : String
        , 'version' : Boolean
        , 'help' : Boolean
        , 'debug' : Boolean
        , 'plugins': path
        , 'link': Boolean
        , 'variable' : Array
        , 'www': path
}, shortHands = { 'var' : ['--variable'], 'v': ['--version'], 'h': ['--help'] };

var cli_opts = nopt(known_opts, shortHands);

// Default the plugins_dir to './cordova/plugins'.
var plugins_dir;

// Without these arguments, the commands will fail and print the usage anyway.
if (cli_opts.plugins_dir || cli_opts.project) {
    plugins_dir = typeof cli_opts.plugins_dir == 'string' ?
        cli_opts.plugins_dir :
        path.join(cli_opts.project, 'cordova', 'plugins');
}

process.on('uncaughtException', function(error){
        if (cli_opts.debug) {
        console.error(error.stack);
        } else {
        console.error(error.message);
        }
        process.exit(1);
        });

// Set up appropriate logging based on events
if (cli_opts.debug) {
    plugman.on('log', console.log);
}
plugman.on('warn', console.warn);
plugman.on('error', console.error);
plugman.on('results', console.log);
if (cli_opts.version) {
    console.log(package.name + ' version ' + package.version);
} 
else if (cli_opts.help) {
    console.log(plugman.help());
}
else if ((cli_opts.install || cli_opts.uninstall || cli_opts.argv.original.length == 0) && (!cli_opts.platform || !cli_opts.project || !cli_opts.plugin)) {
    console.log(plugman.help());
}
else if (cli_opts.uninstall) {
    plugman.uninstall(cli_opts.platform, cli_opts.project, cli_opts.plugin, plugins_dir, { www_dir: cli_opts.www });
}
else if (cli_opts.adduser) {
  plugman.adduser();
}
else if (cli_opts.publish && cli_opts.plugin) {
  plugman.publish(new Array(cli_opts.plugin));
}
else if (cli_opts.unpublish && cli_opts.plugin) {
  plugman.unpublish(new Array(cli_opts.plugin));
}
else if (cli_opts.search) {
  plugman.search(cli_opts.search.split(','));
}
else if(cli_opts.install) {
    var cli_variables = {}
    if (cli_opts.variable) {
        cli_opts.variable.forEach(function (variable) {
                var tokens = variable.split('=');
                var key = tokens.shift().toUpperCase();
                if (/^[\w-_]+$/.test(key)) cli_variables[key] = tokens.join('=');
                });
    }
    var opts = {
subdir: '.',
        cli_variables: cli_variables,
        www_dir: cli_opts.www
    };
    plugman.install(cli_opts.platform, cli_opts.project, cli_opts.plugin, plugins_dir, opts);
} else {
    console.log(plugman.help());
}
