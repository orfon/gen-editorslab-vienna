addToClasspath(module.resolve("../../lib/appengine-api-1.0-sdk-1.9.28.jar"));
addToClasspath(module.resolve("../../lib/mysql-connector-java-5.1.37-bin.jar"));

var system = require("system");
var strings = require("ringo/utils/strings");
var shell = require("ringo/shell");
var term = require("ringo/term");

var utils = require("../utils");

var store = require("../model/store");

// create tables if necessary, and app is not in production mode
if (require("ringo/engine").getRhinoEngine().getConfig().isReloading()) {
   if (typeof(store.syncTables) === "function") {
      store.syncTables();
   }
}

var AdminUser = require("../model/adminuser");

var main = function(args) {
   var username, password, passwordConfirm, email;
   while (!username) {
      username = shell.readln("Username: ").trim();
      if (username.length > 0) {
         if (AdminUser.exists(username)) {
            term.writeln(term.BOLD, "This username is already registered, please choose a different", term.RESET);
            username = null;
         }
      }
   }

   while (!password || (password !== passwordConfirm)) {
      password = shell.readln("Password: ", "*");
      passwordConfirm = shell.readln("Confirm password: ", "*");
      if (password !== passwordConfirm) {
         term.writeln(term.BOLD, "\nPasswords do not match, please try again.\n", term.RESET);
      }
   }

   email = shell.readln("Email: ");
   term.writeln("\nAn new account will be created:\n");
   term.writeln("  Username:", term.BOLD, username, term.RESET);
   term.writeln("  Email:", term.BOLD, email, term.RESET);

   var salt = utils.createSalt();
   var passwordHash = utils.createDigest(password, salt);
   var adminuser = AdminUser.create(username, strings.b64encode(passwordHash), strings.b64encode(salt), email);

   term.writeln(term.GREEN, "Successfully created the account '" + username + "'", term.RESET);
};

if (require.main == module.id) {
    system.exit(main(system.args.slice(1)));
}