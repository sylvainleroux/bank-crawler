var page = require('webpage').create();
var fs = require('fs');
var system = require('system');
var process = require("child_process");
var spawn = process.spawn;
require('./dateformat');
var jsCookies = require('./cookieformat').jsCookies;

var globalJSessionID = null;


var DEBUG = false;


require('./config');


console.log("Start now");
console.log(config.cmb.account);


var child = spawn("security", ["find-generic-password", "-a", config.account, "-l", "com.sleroux.bank.crawler.credentials", "-w"]);
child.stdout.on("data", function(data) {
    config.password = data.replace("\n", "");
});
child.stderr.on("data", function(data) {
    console.log("spawnSTDERR:", JSON.stringify(data));
});
child.on("exit", function(code) {
    if (code === 0) {
        return;
    }
    console.log("spawnEXIT:", code);
});

page.onConsoleMessage = function(msg, lineNum, sourceId) {
	debug('CONSOLE: ' + msg );
};


var createClickElementInDom = function(){
  if (window._phantom) {
    if (!HTMLElement.prototype.click) {
      HTMLElement.prototype.click = function() {
        var e = document.createEvent('MouseEvents');
        e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        this.dispatchEvent(e);
      };
    }
  }
};


function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                     if (DEBUG) {console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");}
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 150); //< repeat check every 150ms
}


var selectAccountsAndSearchForOperations = function() {
  // Select all accounts
  for (var i = 0; i < 40; i++){
    var a = document.getElementById("gwt-uid-"+i);
    if (a != null){
      if (a.getAttribute("type") == "checkbox"){
        a.click();
        break;
      }
    }
  }
  // Click search button       
  document.querySelectorAll("a.gwt-Anchor.label")[0].click();
};
 
var renderSnapshot = function(_name) {
	if(DEBUG){
		page.render(_name);
	}
};

var debug = function(_message) {
	if (DEBUG){
		console.log(_message);
	}
};


var closeSecurityAlert = function(){

		console.log("> Close security alert");

		waitFor(function() {
			debug("wait loaded");
			return page.evaluate(function() {
				return jQuery("a[class=button]:contains('Fermer')").is(":visible");
			});
		}, function() {
			debug("security alert found");
			renderSnapshot('tmp/cmb_00.png');
			page.evaluate(function() {
				jQuery("a[class=button]:contains('Fermer')").click();
			});

			goLoginScreen();
		});


};

var goLoginScreen = function(){
	renderSnapshot('tmp/cmb_01.png');
  console.log("> Login screen");

	waitFor(function() {
		debug("wait loaded");
		return page.evaluate(function() {
			return jQuery("#connexion-bouton > a").is(":visible");
		});
	}, function() {
		renderSnapshot('tmp/cmb_01.png');
		page.evaluate(function() {
			jQuery("#connexion-bouton > a").click();
		});

		fillLoginForm();
	});



};


var fillLoginForm = function(){
	renderSnapshot('tmp/cmb_02.png');
	console.log("> Enter login info");

	waitFor(
		function(){
			return page.evaluate(function() {
				return jQuery("#password").is(":visible");
			});
		}, 
		function(){
			page.evaluate(function(login, pass){
				jQuery("#identifiant").val(login);
				jQuery("#password").val(pass);
			}, config.cmb.account, config.password);

			doLogin();
		}
	);

};


var doLogin = function(){
	renderSnapshot('tmp/cmb_03.png');
	console.log("> Credentials set, do login");

	waitFor(
		function(){
			return page.evaluate(function() {
				return jQuery("#gwt-uid-14").is(":visible");
			});
		}, 
		function(){
			page.evaluate(function() {
				jQuery("#gwt-uid-14").click();
			});
			goDownloadPage();
		}
	);
};


var goDownloadPage = function(){
	console.log("> Go to download page");


	waitFor(
		function(){
			return page.evaluate(function() {
				try {
					if (document.querySelectorAll("#principal")[0].offsetHeight > 100) return true;
				} catch(e){
					console.log(e);
					return false;
				}

			});
		},
		function(){

			// Get JSessionID cookie value from disk 
			var content = fs.read('tmp/cmb-cookies');
			var re = /(JSESSIONID=[^;]*;)/g;
			var search = re.exec(content);
			var jsessionID = search[1];
			globalJSessionID = jsessionID;
			if (DEBUG) {
				console.log("Found JSessionID : " + globalJSessionID);
			}

			renderSnapshot('tmp/cmb_04.png');
			page.evaluate(function(){
				window.location.hash="#TelechargementOperationPlace:";
			});

			fillDownloadForm();

		},
		8000
	);
};


var fillDownloadForm = function(){

	console.log("> Fill download form");
	renderSnapshot('tmp/cmb_05.png');
	waitFor(
		function(){
			return page.evaluate(function(){
				try {
					if (document.querySelectorAll("a.gwt-Anchor.label")[0].offsetWidth > 0) return true;
				} catch (e){
					console.log(e);
					return false;
				}
			});

		},function(){
			page.evaluate(createClickElementInDom);
			page.evaluate(selectAccountsAndSearchForOperations);
			setTimeout(	listDownloadFiles,1000);
		
		});
	};


var listDownloadFiles = function(){
	renderSnapshot('tmp/cmb_06.png');
	console.log("> List files to download ");

	var files = [];

	page.onResourceRequested = function(requestData, networkRequest) {
		//console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
		files.push(requestData.url);
	};

	page.onResourceReceived = function(response) {
		//console.log(JSON.stringify(response));
	}

	waitFor(
		function(){
			return page.evaluate(
				function() {

				try {
					var node = document.querySelectorAll("div.actif>div>a");
					console.log(node.length + " elements found");

					// Text objects referencing found operations
					var textNodes = document.getElementsByClassName("espace libelle_2");

					var visible = true;
					for (var i in node){
						try {
							if("object" == typeof node[i]){
								var height = node[i].offsetHeight;
								console.log("element " + i , height);

								// Check if there is no operations
								if (i > 0){
									var textNode = textNodes[i-1];
									//console.log(textNode.innerHTML);

									// Hack size validation
									if (textNode != null && textNode.innerHTML.indexOf("aucune") > -1){
										height = 100;
									}
								}
							
								visible = visible && height > 0;
							}
						} catch(e){
							console.log("ERROR: ", e);
						}
					}

					var returnVal = visible && node.length > 3;
					console.log("SIZE : " + returnVal);
					return returnVal;
				}catch(e){return false;}
			});
		}, function(){

			

					renderSnapshot('tmp/cmb_07.png');
						page.evaluate(function(){
							var a = document.querySelectorAll("div.actif>div>a");
								for (k in a) { 
									if( "object" == typeof a[k]){
										if ( k > 0 ){

											// Do not download if no operation 
											if (a[k].offsetHeight > 0 ){
												console.log("CLICK OBJECT");
												var e = document.createEvent('MouseEvents');
												e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
												a[k].dispatchEvent(e);
											} else {
												console.log("Empty file");
											}
										}
									}
							};
						});
					finalize(files);
			},
		5000);

}



var finalize = function(files){

	if (DEBUG){
		console.log("found " + files.length + " files");
		for (f in files){
			console.log("  " + files[f]);
		}
	}

  var comptes = ["CMB","LB","PEL"];

  console.log("> Finalize"); 
  var urls = "";
  for (index in files){
    urls += [
      "/usr/bin/curl",
      "-s",
      "'" + files[index] + "'",
      "-H", "'Referer: https://www.cmb.fr/banque/assurance/credit-mutuel/web/yc_8462/prive'",
      "-H", "'Cookie:"+globalJSessionID+"'",
      ">",
      "~/Downloads/RELEVE_" + new Date().format("yyyy_mm_dd") + "_"+ comptes[index] + "_last5weeks"  + ".csv"
    ].join(" ") + "\n";
  }
  fs.write("tmp/cmb-files", urls, 'w');

  exit();

}

function exit(){
	 if(page){
	 		page.close();
	 }
	setTimeout(function(){ phantom.exit(); }, 0);
  phantom.onError = function(){};
}



console.log("> Open www.cmb.fr");
page.open('https://www.cmb.fr/banque/assurance/credit-mutuel/web/j_6/accueil', function(status) {
	 if (status !== "success") {
        console.log("Unable to access network");
   } else {
			debug("> login page loaded");
		closeSecurityAlert();
	}
});





