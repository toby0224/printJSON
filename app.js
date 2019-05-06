const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// json input file
var data = require("./SystemViewController.json");

async function printSelector(selectorType, data, name, res) {
  var subviewsArray = data.subviews;

  // className
  if (selectorType === ".") {
    for (var subview of subviewsArray) {
      if (subview.classNames) {
        // subview -> classNames
        for (var cName in subview.classNames) {
          if (subview.classNames[cName] === name) {
            res.push({
              class: subview.class,
              classNames: subview.classNames
            });
          }
        }
      } // subview -> subviews[]
      if (subview.subviews) {
        res.push(printSelector(selectorType, subview, name, res));
      }
    }
    return res;
  }
  // identifier
  else if (selectorType === "#") {
    if (data.identifier === name) {
      // data -> identifier
      res.push({
        identifier: data.identifier
      });
    }
    for (var subview of subviewsArray) {
      if (subview.identifier === name) {
        res.push({
          class: subview.class,
          identifier: subview.identifier,
          title: subview.title
        });
      }
      // subview -> control -> identifier
      else if (
        subview.control &&
        subview.control.identifier &&
        subview.control.identifier === name
      ) {
        res.push({
          class: subview.control.class,
          identifier: subview.control.identifier,
          expectsStringValue: subview.control.expectsStringValue,
          var: subview.control.var
        });
      } // subview -> contentView []
      if (subview.contentView) {
        res.push(printSelector(selectorType, subview.contentView, name, res));
      }
      // subview -> subviews []
      if (subview.subviews) {
        res.push(printSelector(selectorType, subview, name, res));
      }
    }
    return res;
  }
  // class
  else {
    for (var subview of subviewsArray) {
      // subview -> class
      if (subview.class && subview.class === name) {
        res.push({
          class: subview.class,
          className: subview.classNames,
          label: subview.label,
          control: subview.control
        });
      }
      // subview -> control -> class
      if (
        subview.control &&
        subview.control.class &&
        subview.control.class === name
      ) {
        res.push({
          class: subview.control.class,
          identifier: subview.control.identifier,
          var: subview.control.var
        });
      }
      // subview -> contentView -> subviews []   .... recurse here ....
      if (subview.contentView) {
        res.push(printSelector(selectorType, subview.contentView, name, res));
      }
      // subview -> subviews []     ... recurse here ...
      if (subview.subviews) {
        res.push(printSelector(selectorType, subview, name, res));
      }
    }
    return res;
  }
}

// function to read command line input from user
function getUserInput() {
  console.log("identifier starts with '#' ");
  console.log("className starts with '.' ");
  console.log("enter 'exit' to quit the program");
  rl.question("Enter your selection: ", selector => {
    if (selector === "exit") {
      console.log("goodbye...");
      rl.close();
    } else {
      console.log("Your selection: " + selector);
      printSelector(
        selector.charAt(0),
        // data.subviews,
        data,
        selector.charAt(0) === "." || selector.charAt(0) === "#"
          ? selector.substring(1, selector.length)
          : selector,
        []
      ).then(result => {
        var outputArray = result.filter(item => Object.keys(item).length);
        console.log(JSON.stringify(outputArray, null, 2)); // flatten it here
        getUserInput();
      });
    }
  });
}

// program starts here
getUserInput();
