const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

exports.prompt = message =>
  new Promise((resolve, reject) =>
    rl.question(message, answer => resolve(answer))
  );

exports.cleanPrompt = () => rl.close();