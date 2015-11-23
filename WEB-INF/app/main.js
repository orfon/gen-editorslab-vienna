var response = require("ringo/jsgi/response");

var {Application} = require("stick");
var app = exports.app = Application();
app.configure("params", "mount", "route");


var {Reinhardt} = require("reinhardt");
var reinhardt = new Reinhardt({
   loader: module.resolve("WEB-INF/app/templates")
});

app.get("/", function (req) {
   return response.html(reinhardt.getTemplate("frontpage.html").render({}));
});

app.get("/version", function (req) {
   var engine = require("ringo/engine");

   var properties = java.lang.System.getProperties();
   var keys = properties.keys();
   var sb = new java.lang.StringBuffer(1000);
   while (keys.hasMoreElements()) {
      let key = keys.nextElement();
      sb.append(key + " -> " + properties.get(key) + "\n");
   }

   return response.text("Running on Ringo " + engine.version.join(".") + "\n\n" + sb.toString());
});