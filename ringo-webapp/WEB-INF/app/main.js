var response = require("ringo/jsgi/response");
var config = require(module.resolve("./config/config"));

var {Application} = require("stick");
var app = exports.app = Application();
app.configure("params", "session", "mount", "route");

var {Reinhardt} = require("reinhardt");
var reinhardt = new Reinhardt({
   loader: "WEB-INF/app/templates"
});

// the SQL store
var store = require("./model/store");
var {AdminUser, Topic, Question, Answer} = require("./model/all");

// detect if development or production environment
var {SystemProperty} = Packages.com.google.appengine.api.utils;
const PROD_ENV = SystemProperty.environment.value() == SystemProperty.Environment.Value.Production;

if (typeof(store.syncTables) === "function") {
   store.syncTables();
}

// mount routes
app.mount("/admin", require("./routes/admin"));
app.mount("/tp", require("./routes/topic"));
app.mount("/api", require("./routes/api"));

// default routes
app.get("/", function (req) {
   return response.html(reinhardt.getTemplate("frontpage.html").render({
      topics: Topic.all()
   }));
});

app.get("/invalidate", function(req) {
   req.session.invalidate();
   return response.text("Done");
});

app.get("/version", function (req) {
   var engine = require("ringo/engine");

   var properties = java.lang.System.getProperties();
   var keys = properties.keys();
   var sb = new java.lang.StringBuffer(1000);
   while (keys.hasMoreElements()) {
      let key = keys.nextElement();
      if (key.indexOf("java.vm") === 0) {
         sb.append(key + " -> " + properties.get(key) + "\n");
      }
   }

   return response.text("Running on Ringo " + engine.version.join(".") + "\n\n" + sb.toString());
});