/*
Grammer for Expressions:

E => T A
A => + T A
     - T A
     epsilon
T => F B
B => * F B
     / F B
     epsilon
F => ( E )
     - F
     NUMBER

Where

E = Expression
T = Term
F = Factor
A = ExpressionRemainder // a placeholder created to remove the left-recursion
B = TermRemainder // same as above

*/



function Calculator(){
  this.lexer = function(inputStr){
    var tokenTypes = [
      ["NUMBER",    /^\d+/ ],
      ["ADD",       /^\+/  ],
      ["SUB",       /^\-/  ],
      ["MUL",       /^\*/  ],
      ["DIV",       /^\//  ],
      ["LPAREN",    /^\(/  ],
      ["RPAREN",    /^\)/  ]
    ];

    // remove spaces from inputStr
    inputStr = inputStr
        .split("")
        .filter((s) => s !== ' ')
        .reduce((a, b) => a += b, '');

    // match tokenTypes for individual characters of inputStr and
    //  create an array of the new object {name: tokenType, value: character}
    this.tokenStream = inputStr
        .split("")
        .map((s) => {
          return {
            name: tokenTypes
              .filter((t) => {
                return !!s.match(t[1]);
              })[0][0],
            value: s
          };
        });
  };
  this.tokenStream = [];
}
Calculator.prototype.peek = function(){
  return this.tokenStream[0] || null;
};
Calculator.prototype.get = function () {
  return this.tokenStream.shift();
};
Calculator.prototype.parseExpression = function(){
  return new TreeNode("Expression", this.parseTerm(), this.parseA());
}
Calculator.prototype.parseA = function(){
  var curExpression = this.peek() ? this.peek().name : null;
  if(curExpression === "ADD" || curExpression === "SUB"){
    return new TreeNode("A", this.get().value, this.parseTerm(), this.parseA());
  }
  return new TreeNode("A");
}
Calculator.prototype.parseB = function(){
  var curExpression = this.peek() ? this.peek().name : null;
  if(curExpression === "MUL" || curExpression === "DIV"){
    return new TreeNode("B", this.get().value, this.parseFactor(), this.parseB());
  }
  return new TreeNode("B");
}
Calculator.prototype.parseTerm = function(){
  return new TreeNode("Term", this.parseFactor(), this.parseB());
}
Calculator.prototype.parseFactor = function(){
  var curExpression = this.peek() ? this.peek().name : null;
  if(curExpression === "NUMBER"){
    var num = '';
    while(this.peek() && this.peek().name === "NUMBER"){
      num += this.get().value;
    }
    return new TreeNode("F", num);
  } else if(curExpression === "SUB"){
    return new TreeNode("F", this.get().value, this.parseFactor());
  } else if(curExpression === "LPAREN"){
    return new TreeNode("F", this.get().value, this.parseExpression(), this.get().value);
  }
}

function TreeNode(name, ...children){
  this.name = name;
  this.children = children;
  this.level = 0;
}
TreeNode.prototype.addLevel = function(curLevel){
  if(!curLevel) curLevel = 0;
  this.level = curLevel;
  this.children.forEach(el => {if(typeof el === 'object') el.addLevel(curLevel + 1);});
};
// TreeNode.prototype.print = function(){
//   var queue = [this];
//   var curLevel = this.level;
//   while(queue.length){
//     var curNode = queue.shift();
//     if(typeof curNode === 'object' && curLevel !== curNode.level){
//       console.log(" ");
//       console.log("Level", ++curLevel);
//     }
//     if(typeof curNode === 'object'){
//       curNode.children.forEach(el => queue.push(el));
//       console.log(curNode.name);
//     } else console.log(curNode);
//   }
// };
TreeNode.prototype.accept = function(visitor){
  return visitor.visit(this);
};

function InfixVisitor() {

  this.visit = function(node) {
    switch(node.name) {
      case "Expression":
      case "Term":
        return node.children[0].accept(this) + node.children[1].accept(this);
        break;

      case "A":
      case "B":
        if(node.children.length > 0) {
          return  node.children[0] + node.children[1].accept(this) + node.children[2].accept(this);
        } else {
          return "";
        }
        break;
      case "F":
        if(node.children.length === 1){
          return node.children[0];
        } else if (node.children.length === 2) {
          return node.children[0] + node.children[1].accept(this);
        } else{
          return node.children[0] + node.children[1].accept(this) + node.children[2];
        }
        break;
      default:
        break;
    }
  }
}

function PostfixVisitor(){
  this.visit = function(node){
    switch(node.name){
      case "Expression":
      case "Term":
        return node.children[0].accept(this) + node.children[1].accept(this);
        break;
      case "A":
      case "B":
        if(node.children.length){
          return node.children[1].accept(this) + node.children[2].accept(this) + node.children[0];
        } else {
          return ""
        }
        break;
      case "F":
        if(node.children.length === 1){
          return ' ' + node.children[0] + ' ';
        } else if (node.children.length === 2) {
          return node.children[0] + node.children[1].accept(this);
        } else{
          return node.children[0] + node.children[1].accept(this) + node.children[2];
        }
        break;
      default:
        break;
    }
  }
}


var calc = new Calculator();
var exp = "2 + (3 - (4 + 7)) / 10 * 5";
calc.lexer(exp);
console.log(exp);
//console.log(calc.tokenStream);
var root = calc.parseExpression();
var visitorInfix = new InfixVisitor();
console.log(root.accept(visitorInfix));

var visitorPostfix = new PostfixVisitor();
console.log(root.accept(visitorPostfix));
