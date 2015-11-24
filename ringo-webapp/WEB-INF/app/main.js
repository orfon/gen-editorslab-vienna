var response = require("ringo/jsgi/response");
var config = require(module.resolve("./config/config"));

var {Application} = require("stick");
var app = exports.app = Application();
app.configure("params", "mount", "route");

var {Reinhardt} = require("reinhardt");
var reinhardt = new Reinhardt({
   loader: "WEB-INF/app/templates"
});

// mount routes
app.mount("/admin", require("./routes/admin"));

// default routes

app.get("/", function (req) {
   return response.html(reinhardt.getTemplate("frontpage.html").render({}));
});

app.get("/config", function(req) {
   return response.text(config.get("driverClass"));
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