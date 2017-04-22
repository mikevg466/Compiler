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

function TreeNode(name, ...children){
  this.name = name;
  this.children = children;
}

var calc = new Calculator();
calc.lexer("2 + (3 - 4) / 10 * 5");
console.log(calc.tokenStream);
console.log(calc.peek());
console.log(calc.get());
console.log(calc.get());
console.log(calc.peek());
