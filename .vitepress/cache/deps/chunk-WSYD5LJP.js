import {
  createError,
  invariant
} from "./chunk-KN4KRTHQ.js";

// node_modules/@codesandbox/sandpack-client/dist/client.utils-7a723432.mjs
var EventEmitter = (
  /** @class */
  function() {
    function EventEmitter2() {
      this.listeners = {};
      this.listenersCount = 0;
      this.channelId = Math.floor(Math.random() * 1e6);
      this.listeners = [];
    }
    EventEmitter2.prototype.cleanup = function() {
      this.listeners = {};
      this.listenersCount = 0;
    };
    EventEmitter2.prototype.dispatch = function(message) {
      Object.values(this.listeners).forEach(function(listener) {
        return listener(message);
      });
    };
    EventEmitter2.prototype.listener = function(listener) {
      var _this = this;
      if (typeof listener !== "function") {
        return function() {
          return;
        };
      }
      var listenerId = this.listenersCount;
      this.listeners[listenerId] = listener;
      this.listenersCount++;
      return function() {
        delete _this.listeners[listenerId];
      };
    };
    return EventEmitter2;
  }()
);
function isCommand(char) {
  return /[a-zA-Z.]/.test(char);
}
function isAlpha(char) {
  return /[a-zA-Z]/.test(char);
}
function isWhitespace(char) {
  return /\s/.test(char);
}
function isOperator(char) {
  return /[&|]/.test(char);
}
function isArgument(char) {
  return /-/.test(char);
}
function isString(char) {
  return /["']/.test(char);
}
function isEnvVar(char) {
  return isAlpha(char) && char === char.toUpperCase();
}
var TokenType;
(function(TokenType2) {
  TokenType2["OR"] = "OR";
  TokenType2["AND"] = "AND";
  TokenType2["PIPE"] = "PIPE";
  TokenType2["Command"] = "Command";
  TokenType2["Argument"] = "Argument";
  TokenType2["String"] = "String";
  TokenType2["EnvVar"] = "EnvVar";
})(TokenType || (TokenType = {}));
var operators = /* @__PURE__ */ new Map([
  ["&&", { type: TokenType.AND }],
  ["||", { type: TokenType.OR }],
  ["|", { type: TokenType.PIPE }],
  ["-", { type: TokenType.Argument }]
]);
function tokenize(input) {
  var current = 0;
  var tokens = [];
  function parseCommand() {
    var value = "";
    while (isCommand(input[current]) && current < input.length) {
      value += input[current];
      current++;
    }
    return { type: TokenType.Command, value };
  }
  function parseOperator() {
    var value = "";
    while (isOperator(input[current]) && current < input.length) {
      value += input[current];
      current++;
    }
    return operators.get(value);
  }
  function parseArgument() {
    var value = "";
    while ((isArgument(input[current]) || isAlpha(input[current])) && current < input.length) {
      value += input[current];
      current++;
    }
    return { type: TokenType.Argument, value };
  }
  function parseString() {
    var openCloseQuote = input[current];
    var value = input[current];
    current++;
    while (input[current] !== openCloseQuote && current < input.length) {
      value += input[current];
      current++;
    }
    value += input[current];
    current++;
    return { type: TokenType.String, value };
  }
  function parseEnvVars() {
    var value = {};
    var parseSingleEnv = function() {
      var key = "";
      var pair = "";
      while (input[current] !== "=" && current < input.length) {
        key += input[current];
        current++;
      }
      if (input[current] === "=") {
        current++;
      }
      while (input[current] !== " " && current < input.length) {
        pair += input[current];
        current++;
      }
      value[key] = pair;
    };
    while (isEnvVar(input[current]) && current < input.length) {
      parseSingleEnv();
      current++;
    }
    return { type: TokenType.EnvVar, value };
  }
  while (current < input.length) {
    var currentChar = input[current];
    if (isWhitespace(currentChar)) {
      current++;
      continue;
    }
    switch (true) {
      case isEnvVar(currentChar):
        tokens.push(parseEnvVars());
        break;
      case isCommand(currentChar):
        tokens.push(parseCommand());
        break;
      case isOperator(currentChar):
        tokens.push(parseOperator());
        break;
      case isArgument(currentChar):
        tokens.push(parseArgument());
        break;
      case isString(currentChar):
        tokens.push(parseString());
        break;
      default:
        throw new Error("Unknown character: " + currentChar);
    }
  }
  return tokens;
}
var counter = 0;
function generateRandomId() {
  var now = Date.now();
  var randomNumber = Math.round(Math.random() * 1e4);
  var count = counter += 1;
  return (+("" + now + randomNumber + count)).toString(16);
}
var writeBuffer = function(content) {
  if (typeof content === "string") {
    return new TextEncoder().encode(content);
  } else {
    return content;
  }
};
var readBuffer = function(content) {
  if (typeof content === "string") {
    return content;
  } else {
    return new TextDecoder().decode(content);
  }
};
var fromBundlerFilesToFS = function(files) {
  return Object.entries(files).reduce(function(acc, _a) {
    var key = _a[0], value = _a[1];
    acc[key] = writeBuffer(value.code);
    return acc;
  }, {});
};
var findStartScriptPackageJson = function(packageJson) {
  var scripts = {};
  var possibleKeys = ["dev", "start"];
  try {
    scripts = JSON.parse(packageJson).scripts;
  } catch (e) {
    throw createError("Could not parse package.json file: " + e.message);
  }
  invariant(scripts, "Failed to start. Please provide a `start` or `dev` script on the package.json");
  var _loop_1 = function(index2) {
    if (possibleKeys[index2] in scripts) {
      var script = possibleKeys[index2];
      var candidate = scripts[script];
      var env_1 = {};
      var command_1 = "";
      var args_1 = [];
      tokenize(candidate).forEach(function(item) {
        var commandNotFoundYet = command_1 === "";
        if (item.type === TokenType.EnvVar) {
          env_1 = item.value;
        }
        if (item.type === TokenType.Command && commandNotFoundYet) {
          command_1 = item.value;
        }
        if (item.type === TokenType.Argument || !commandNotFoundYet && item.type === TokenType.Command) {
          args_1.push(item.value);
        }
      });
      return { value: [command_1, args_1, { env: env_1 }] };
    }
  };
  for (var index = 0; index < possibleKeys.length; index++) {
    var state_1 = _loop_1(index);
    if (typeof state_1 === "object")
      return state_1.value;
  }
  throw createError("Failed to start. Please provide a `start` or `dev` script on the package.json");
};
var getMessageFromError = function(error) {
  if (typeof error === "string")
    return error;
  if (typeof error === "object" && "message" in error) {
    return error.message;
  }
  return createError("The server could not be reached. Make sure that the node script is running and that a port has been started.");
};

export {
  EventEmitter,
  generateRandomId,
  writeBuffer,
  readBuffer,
  fromBundlerFilesToFS,
  findStartScriptPackageJson,
  getMessageFromError
};
//# sourceMappingURL=chunk-WSYD5LJP.js.map
