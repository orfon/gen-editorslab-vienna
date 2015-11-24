var response = require("ringo/jsgi/response");

var {Reinhardt} = require("reinhardt");
var reinhardt = new Reinhardt({
   loader: "WEB-INF/app/templates"
});

var {Application} = require("stick");

var app = exports.app = new Application();
app.configure("route");

app.get("/", function(request) {
   return response.html(reinhardt.getTemplate("admin-signin.html").render({}));
});
