var page = require('webpage').create();
var fs = require('fs');
var system = require('system');
var process = require("child_process");
var spawn = process.spawn;
require('./dateformat');
var jsCookies = require('./cookieformat').jsCookies;
var timer = 5000;


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
    if (code == 0) {
        return;
    }
    console.log("spawnEXIT:", code);
});

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};


console.log("> open login page");
page.open('https://www.cmb.fr/banque/assurance/credit-mutuel/web/j_6/accueil', function(status) {
    console.log("> login page loaded, waiting javascript completed for "+timer+" ms");
    // Wait for complete load
    setTimeout(function() {
      console.log("> should be loaded now, taking snapshot 00");
      page.render('tmp/cmb_00.png');
      console.log("> Close security alert");
      page.evaluate(function() {
          jQuery("a[class=button]:contains('Fermer')").click();
      });
      setTimeout(function() {
        page.render('tmp/cmb_01.png');
        console.log("> Login screen");
        page.evaluate(function(){
          jQuery("#connexion-bouton > a").click();
        });
        setTimeout(function() {
          page.render('tmp/cmb_02.png');
          console.log("> Enter login info");
          page.evaluate(function(login, pass){
            jQuery("#identifiant").val(login);
            jQuery("#password").val(pass);
          }, config.cmb.account,config.password);
          setTimeout(function() {
            page.render('tmp/cmb_03.png');
            console.log("> credentials set, do login");
            page.evaluate(function(){
              jQuery("#gwt-uid-11").click();
            });
            setTimeout(function() {
              console.log("> login should be done, go to download page");

              // Get JSessionID cookie value from disk 
              var content = fs.read('tmp/cmb-cookies');
              var re = /(JSESSIONID=[^;]*;)/g;
              var search = re.exec(content);
              var jsessionID = search[1];

              console.log("Found JSessionID : " + jsessionID);

              
              page.render('tmp/cmb_04.png');
              page.evaluate(function(){
                window.location.hash="#TelechargementOperationPlace:"
              });
              setTimeout(function(){
                page.render('tmp/cmb_05.png');
                page.evaluate(function(){
                  for (var i = 0; i < 40; i++){
                    var a = document.getElementById("gwt-uid-"+i);
                    if (a != null){
                      if (a.getAttribute("type") == "checkbox"){
                        a.click();
                        break;
                      }
                    }
                  }
                  document.querySelectorAll("div.c>a")[0].click();
                  });
                  setTimeout(function(){
                    page.render('tmp/cmb_06.png');
                    console.log("> List files to download ");

                    var files = [];

                    page.onResourceRequested = function(requestData, networkRequest) {
                      // console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
                      files.push(requestData.url);
                    };

                     page.onResourceReceived = function(response) {
                        //console.log(JSON.stringify(response));
                     }

                    page.evaluate(function(){
                        var a = document.querySelectorAll("div.actif>div>a");
                        for (k in a) { 
                          if( a.hasOwnProperty( k )){
                           if ( k > 0 ){
                             a[k].click();
                           }
                          }
                        };
                    });

                    setTimeout(function(){
                      finalize(files, jsessionID);
                    }, 1000);
                    
                  }, 2500);
                }, 2500);
              },5000);
            }, 1000);
          }, 1000);
        }, 1000);
    }, timer);
});


var finalize = function(files, jessionID){

  var comptes = ["CMB","LB"];

  console.log("Finalize"); 
  var urls = "";
  for (index in files){
    urls += [
      "/usr/bin/curl",
      "'" + files[index] + "'",
      "-H", "'Referer: https://www.cmb.fr/banque/assurance/credit-mutuel/web/yc_8462/prive'",
      "-H", "'Cookie:"+jessionID+"'",
      ">",
      "~/Downloads/RELEVE_" + new Date().format("yyyy_mm_dd") + "_"+ comptes[index] + "_last5weeks"  + ".csv"
    ].join(" ") + "\n";
  }
  fs.write("tmp/cmb-files", urls, 'w');
  phantom.exit();

}