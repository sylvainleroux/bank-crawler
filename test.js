var page = require('webpage').create();
var fs = require('fs');
var system = require('system');
require('./dateformat');
var jsCookies = require('./cookieformat').jsCookies;
var timer = 10000;


require('./config');
console.log("Start now");
console.log(config.account);
var process = require("child_process");
var spawn = process.spawn;
var child = spawn("security", ["find-generic-password", "-a", config.account, "-l", "com.sleroux.bank.crawler.credentials", "-w"]);
child.stdout.on("data", function(data) {
    config.password = data.replace("\n", "");
    console.log(config.password);
});
child.stderr.on("data", function(data) {
    console.log("spawnSTDERR:", JSON.stringify(data));
});
child.on("exit", function(code) {
    if (code == 0) {
        return;
    }
    console.log("spawnEXIT:", code);
});
page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};
console.log("> open login page");
page.open('https://www.icgauth.banquepopulaire.fr/WebSSO_BP/_16707/index.html', function(status) {
    console.log("> login page loaded, waiting javascript completed for 8 sec");
    // Wait for complete load
    setTimeout(function() {
        console.log("> should be loaded now, taking snapshot 00");
        page.render('step_00.png');
        console.log("> fill login and password");
        page.evaluate(function() {
            var login = $("input[ng-model=login]");
            login.css("background-color", "red");
            login.click();
            login.focus();
            return login;
        });
        page.sendEvent("keypress", config.account + "");
        page.render('step_01.png');
        page.evaluate(function() {
            var e = $("input[ng-model=password]");
            e.css("background-color", "red");
            e.click();
            e.focus();
            return e;
        });
        page.sendEvent("keypress", config.password);
        page.render('step_02.png');
        console.log("> now click on Valider");
        page.evaluate(function() {
            $("input.btn[value=Valider]").click();
        });
        page.render('step_03.png');
        setTimeout(function() {
            page.render('step_04.png');
            console.log("Go to accounts list");
            page.evaluate(function() {
                $("li.pink:nth-child(5) > a:nth-child(1)").click();
            });
            setTimeout(function() {
                page.render('step_06.png');
                console.log("Go to download options");
                page.evaluate(function() {
                    frames.frames[0].frames[1].frames[0].document.getElementById("TtelechargementOp").firstChild.click();
                });
                setTimeout(function() {
                    page.render('step_07.png');
                    console.log('select options');
                    page.evaluate(function() {
                        frames.frames[0].frames[1].frames[1].document.getElementById("lst33_2").click();
                    });
                    setTimeout(function() {
                        page.render('step_08.png');
                        console.log('post form');
                        page.evaluate(function() {
                            frames.frames[0].frames[1].frames[1].document.getElementById("btn8").click();
                        });
                        setTimeout(function() {
                            page.render('step_09.png');
                            console.log('post form');
                            page.evaluate(function() {
                                frames.frames[0].frames[1].frames[1].document.getElementById("SEL_tbl10_0").click();
                            });
                            setTimeout(function() {
                                page.render('step_10.png');
                                console.log('post form');
                                page.onResourceReceived = function(response) {
                                    if (response.url.indexOf("DownloadDocument.do?documentId") > 0 && response.stage == "end") {
                                        fs.write("download-url", response.url, "w");
                                    }
                                };
                                var a = new Date(new Date().getTime() - 3600 * 1000 * 24 * 7);
                                var strDate = a.format("dd/mm/yyyy");
                                page.evaluate(function(strDate) {
                                    frames.frames[0].frames[1].frames[1].document.getElementById("fld750").value = strDate;
                                    frames.frames[0].frames[1].frames[1].document.getElementById("btn1").click();
                                }, strDate);
                                setTimeout(function() {
                                    fs.write("cookies", jsCookies(page.cookies), "w");
                                    phantom.exit();
                                }, timer);
                            }, timer);
                        }, timer);
                    }, timer);
                }, timer);
            }, timer);
        }, timer);
    }, timer);
});