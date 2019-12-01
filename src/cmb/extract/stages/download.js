const waitForPageEval = require("../../../utils/waitForPageEval");
const sleep = require("../../../utils/sleep");
const logger = require("../../../utils/logger");

module.exports = async function(page) {

  await page.evaluate(function() {
    window.location.hash = "#TelechargementOperationPlace:";
  });

  await waitForPageEval(
    page,
    function() {
      try {
        elems = document.querySelectorAll("a.gwt-Anchor.label");

        if (elems && elems.length > 0 && elems[0] && elems[0].offsetWidth > 0)
          return true;
      } catch (e) {
        //console.error(e);
        return false;
      }
    },
    10000
  );
  
  var createClickElementInDom = function() {
    if (window._phantom) {
      if (!HTMLElement.prototype.click) {
        HTMLElement.prototype.click = function() {
          var e = document.createEvent("MouseEvents");
          e.initMouseEvent(
            "click",
            true,
            true,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          );
          this.dispatchEvent(e);
        };
      }
    }
  };

  await page.evaluate(createClickElementInDom);

  var selectAccountsAndSearchForOperations = function() {
    // Select all accounts
    for (var i = 0; i < 100; i++) {
      var a = document.getElementById("gwt-uid-" + i);
      if (a != null) {
        /* jshint ignore:line */
        if (a.getAttribute("type") == "checkbox") {
          a.click();
          break;
        }
      }
    }
    // Click search button
    document.querySelectorAll("a.gwt-Anchor.label")[0].click();
  };

  await page.evaluate(selectAccountsAndSearchForOperations);

  await waitForPageEval(
    page,
    function() {
      try {
        var node = document.querySelectorAll("div.actif>div>a");
        // Text objects referencing found operations
        var textNodes = document.getElementsByClassName("espace libelle_2");

        var accountNameNodes = document.getElementsByClassName(
          "espace libelle_24"
        );

        var visible = true;
        for (var i in node) {
          try {
            if ("object" == typeof node[i]) {
              var height = node[i].offsetHeight;
              //console.log("element " + i, height);

              // Check if there is no operations
              if (i > 0) {
                var nameNode = accountNameNodes[(i - 1) * 2];
                var accountName = nameNode.innerText.trim().replace(/ /g, "_");

                var textNode = textNodes[i - 1];
                //console.log(textNode.innerHTML);

                // Hack size validation
                if (
                  textNode != null &&
                  textNode.innerHTML.indexOf("aucune") > -1
                ) {
                  height = 100;
                }
              }

              visible = visible && height > 0;
            }
          } catch (e) {
            console.log("ERROR: ", e);
          }
        }

        var returnVal = visible && node.length > 3;
        //console.log("SIZE : " + returnVal);
        return returnVal;
      } catch (e) {
        return false;
      }
    },
    5000
  );

  await sleep(1000);

  var responses = [];

  await page.on("onResourceRequested", function(requestData, networkRequest) {
    if (requestData.url.indexOf("operationsDownload") > 0) {
      responses.push(requestData);
      //console.log("> REQUEST.URL: ", requestData.url);
    }
  });

  logger.info("Click on download links");

  await page.evaluate(function() {
    var a = document.querySelectorAll("div.actif>div>a");
    for (var k in a) {
      if ("object" == typeof a[k]) {
        if (k > 0) {
          // Do not download if no operation
          if (a[k].offsetHeight > 0) {
            console.log("CLICK OBJECT");
            var e = document.createEvent("MouseEvents");
            e.initMouseEvent(
              "click",
              true,
              true,
              window,
              0,
              0,
              0,
              0,
              0,
              false,
              false,
              false,
              false,
              0,
              null
            );
            a[k].dispatchEvent(e);
          } else {
            console.log("Empty file");
          }
        }
      }
    }
  });

  await sleep(1000);

  // Clone list for urls

  var urls = [];
  responses.forEach(r => {
    urls.push(r.url);
  });

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  var exports = [];

  await asyncForEach(urls, async url => {
    logger.info("Download responses: " + url);

    let fileExport = await page.evaluate(function(url) {
      //console.log("Generate synchronous xhr call");

      var request = new XMLHttpRequest();
      request.open("GET", url, false);
      request.send(null);

      if (request.status === 200) {
        return {
          filename: request
            .getResponseHeader("Content-Disposition")
            .replace("attachment;filename=", "")
            .replace(/\"/g, ""),
          content: request.responseText
        };
      }

      return null;
    }, url);
    if (fileExport != null) {
      exports.push(fileExport);
    }
  });

  return exports;
};
