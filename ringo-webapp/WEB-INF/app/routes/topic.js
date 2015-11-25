var dates = require("ringo/utils/dates");
var strings = require("ringo/utils/strings");
var response = require("ringo/jsgi/response");

var {Reinhardt} = require("reinhardt");
var reinhardt = new Reinhardt({
   loader: "WEB-INF/app/templates"
});

var {AdminUser, Topic, Question, Enquirer} = require("../model/all");
var {Application} = require("stick");

var app = exports.app = new Application();
app.configure("route");

var isAdmin = function(request) {
   return request.session.data.isAdmin === true;
};

var getCurrentUser = function(request) {
   if(isAdmin(request)) {
      return AdminUser.getByName(request.session.data.name);
   }

   return null;
};

app.get("/:slug", function(request, slug) {

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.notFound().html(
         reinhardt.getTemplate("notfound.html").render({})
      );
   }

   return response.html(reinhardt.getTemplate("topic/index.html").render({
      "topic": topic,
      "reviewedQuestions": topic.reviewedQuestions.map(function(question) {
         if (request.session.data.countedVotes != null) {
            if (request.session.data.countedVotes.contains(new java.lang.Integer(question.id))) {
               question.voted = true;
            }
         }
         return question;
      }),
      "investigationQuestions": topic.investigationQuestions.all,
      "answeredQuestions": topic.answeredQuestions.all
   }));
});

app.post("/:slug/createQuestion", function(request, slug) {
   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.notFound().html(
         reinhardt.getTemplate("notfound.html").render({})
      );
   }

   if (request.postParams && request.postParams.text && request.postParams.enqName && request.postParams.enqEmail) {
      let text = request.postParams.text.trim();
      let enqName = request.postParams.enqName.trim();
      let enqEmail = request.postParams.enqEmail.trim();

      let enqPhone = request.postParams.enqPhone.trim();
      let enqTwitter = request.postParams.enqTwitter.trim();

      // extract location data from request
      let gaeCountry = request.headers["x-appengine-country"] || "",
          gaeRegion = request.headers["x-appengine-region"] || "",
          gaeCity = request.headers["x-appengine-city"] || "",
          gaeCityLatLong = request.headers["x-appengine-citylatlong"] || "";

      if (text.length < 3 || enqName.length < 3 || !strings.isEmail(enqEmail)) {
         return response.redirect("/tp/" + slug);
      }

      // FIXME check further constraints like max length

      let enquirer = Enquirer.create(enqName, enqEmail, enqTwitter, enqPhone,
         gaeCountry, gaeRegion, gaeCity, gaeCityLatLong);
      let question = Question.create(topic, text, enquirer);

      request.session.volatile = question.id;

      return response.redirect("/tp/" + slug + "/danke");
   }

   return response.redirect("/tp/" + slug);
});

app.get("/:slug/danke", function(request, slug) {
   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.notFound().html(
         reinhardt.getTemplate("notfound.html").render({})
      );
   }

   let qid = request.session.volatile;
   if (typeof qid === "number" && qid > 0) {
      console.log("qid", qid);
      let question = Question.getById(qid);

      if (question != null && dates.diff(question.created, new Date(), "second") < 5) {
         return response.html(reinhardt.getTemplate("topic/thanks.html").render({
            "topic": topic,
            "question": question
         }));
      }
   }

   return response.redirect("/tp/" + slug);
});

app.get("/:slug/fragen/:qid", function(request, slug, qid) {
   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.notFound().html(
         reinhardt.getTemplate("notfound.html").render({})
      );
   }

   qid = parseInt(qid, 10);
   if (!isNaN(qid) && qid > 0) {
      let question = Question.getById(qid);

      if (question != null && (question.state == Question.UNDER_INVESTIGATION || question.state == Question.REVIEWED || question.state == Question.ANSWERED)) {
         return response.html(reinhardt.getTemplate("topic/answers.html").render({
            "topic": topic,
            "question": question,
            "answers": question.answers.all
         }));
      }
   }

   return response.notFound().html(
      reinhardt.getTemplate("notfound.html").render({})
   );
});