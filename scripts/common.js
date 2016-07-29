/* jshint -W097 */
/* global exports */

var execFile = require("child_process").execFile;

var readKeychain = function(account, key, callback) {
	execFile("security", ["find-generic-password", "-a", account, "-l", key, "-w"], null, function(err, stdout, stderr) {
		if (err) {
			console.log("Error while trying to retrieve credentials");
			exit();
		}
		callback(stdout.replace("\n", ""));
		//;
	});
};


exports.waitFor = function(testFx, onReady, onFail, timeOutMillis) {
	var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
		start = new Date().getTime(),
		condition = false,
		interval = setInterval(function() {
				if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
					condition = testFx();
				} else {
					if (!condition) {
						debug("'waitFor()' timeout");
						if (onFail !== null) {
							onFail();
						}
						phantom.exit(1);
					} else {
						if (DEBUG) {
							debug("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
						}
						onReady();
						clearInterval(interval); //< Stop this interval
					}
				}
			},
			150); //< repeat check every 150ms
};


var getCredentials = function(account, callback) {

	this.login = "NONE";
	this.password = "NONE";

	readKeychain(account, "com.sleroux.bank.crawler.login", function(_login) {
		this.login = _login;
	});
	readKeychain(account, "com.sleroux.bank.crawler.password", function(_password) {
		this.password = _password;
	});

	exports.waitFor(function() {
			// Check login and password is set
			return this.login !== undefined && this.login !== "" && this.password !== undefined && this.password !== "";
		}, function() {
			// Login and password are set, continue
			callback(this.login, this.password);
		},
		function() {
			// Show setup informations
			console.log("Can't find credentials. Store credentials in keychain with : ");
			console.log("security add-generic-password -a bpo -l com.sleroux.bank.crawler.login -w MY_LOGIN");
			console.log("security add-generic-password -a bpo -l com.sleroux.bank.crawler.password -w MY_PASSWORD");
		},
		// 1 sec timeout
		1000);
};

exports.getCredentials = getCredentials;
