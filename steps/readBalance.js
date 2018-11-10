const waitForPageEval = require("../utils/waitForPageEval");
const sleep = require("../utils/sleep");

module.exports = async function(page) {
  return await page.evaluate(function() {
    var res = [];
    var nodes = document.querySelectorAll(
      "div.entete>div>div:nth-child(2)>div:nth-child(2)"
    );
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      res.push(
        node.innerText
          .trim()
          .replace(/[ € ]*/g, "")
          .replace(",", ".")
      );
    }

    var result = [];
    var labels = document.querySelectorAll(
      "div.entete>div>div:nth-child(1)>div:first-child"
    );
    for (var j = 0; j < labels.length; j++) {
      var label = labels[j];
      var key = label.innerText.trim();
      result.push({
        compte: key,
        solde: res[j]
      });
    }
    return result;
  });
};
