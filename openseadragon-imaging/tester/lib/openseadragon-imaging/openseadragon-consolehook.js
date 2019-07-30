//! openseadragon-consolehook 2.0.0
//! Build date: 2019-06-29
//! Git commit: --24355e6-dirty
//! https://github.com/msalsbery/OpenSeadragonConsoleHook
/*
 * Copyright (c) 2019 Mark Salsbery
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/* global OpenSeadragon */

/**
 * @file
 * @version  openseadragon-consolehook 2.0.0
 * @author Mark Salsbery <msalsbery@hotmail.com>
 *
 */

/**
 * @module openseadragon-consolehook
 * @version  openseadragon-consolehook 2.0.0
 *
 */


(function (OSD, $, undefined) {

	// if (!OSD.version || OSD.version.major < 1) {
	// 	throw new Error(
	// 		'OpenSeadragonConsoleHook requires OpenSeadragon version 1.0.0+'
	// 	);
	// }

	/**
	 * Creates a new ConsoleHook.
	 *
	 * @method addConsoleHook
	 * @memberof external:"OpenSeadragon.Viewer"#
	 * @param {Object} options
     * @param {Function} [options.log] - console.log function. Function can return true to prevent original function call.
     * @param {Function} [options.debug] - console.debug function. Function can return true to prevent original function call.
     * @param {Function} [options.info] - console.info function. Function can return true to prevent original function call.
     * @param {Function} [options.warn] - console.warn function. Function can return true to prevent original function call.
     * @param {Function} [options.error] - console.error function. Function can return true to prevent original function call.
	 * @returns {OpenSeadragonImaging.ConsoleHook}
	 *
	 **/
	OSD.Viewer.prototype.addConsoleHook = function (options) {
		options = options || {};
		return new $.ConsoleHook(options);
	};

    /**
     * Creates a new OpenSeadragonImaging.ConsoleHook.
     *
     * @class ConsoleHook
     * @classdesc Provides hooks into the OpenSeadragon console pipeline.
     * @memberof OpenSeadragonImaging
     * @param {Object} options
     * @param {Function} [options.log] - console.log function. Function can return true to prevent original function call.
     * @param {Function} [options.debug] - console.debug function. Function can return true to prevent original function call.
     * @param {Function} [options.info] - console.info function. Function can return true to prevent original function call.
     * @param {Function} [options.warn] - console.warn function. Function can return true to prevent original function call.
     * @param {Function} [options.error] - console.error function. Function can return true to prevent original function call.
     *
     **/
    $.ConsoleHook = function (options) {
        options = options || {};

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
				/*jshint loopfunc:true*/
				// eslint-disable-next-line no-loop-func
                (function (handler) {
                    var origHandler = OSD.console[key];
                    OSD.console[key] = function () {
                        if (!handler.apply(this, arguments) && origHandler) {
                            origHandler.apply(this, arguments);
                        }
                    };
                }(options[key]));
                /*jshint loopfunc:false*/
            }
        }
    };

	/**
	 * ConsoleHook version.
	 * @member {Object} OpenSeadragonImaging.ConsoleHook.version
	 * @property {String} versionStr - The version number as a string ('major.minor.revision').
	 * @property {Number} major - The major version number.
	 * @property {Number} minor - The minor version number.
	 * @property {Number} revision - The revision number.
	 */
	$.ConsoleHook.version = {
		versionStr: '2.0.0'
	};
	var versionSplits = $.ConsoleHook.version.versionStr.split('.');
	$.ConsoleHook.version.major = parseInt(versionSplits[0], 10);
	$.ConsoleHook.version.minor = parseInt(versionSplits[1], 10);
	$.ConsoleHook.version.revision = parseInt(versionSplits[2], 10);


}(OpenSeadragon, window.OpenSeadragonImaging = window.OpenSeadragonImaging || {}));
