var log = require("ringo/logging").getLogger(module.id);

var strings = require("ringo/utils/strings");
var response = require("ringo/jsgi/response");
var {createDigest} = require("../utils");

var {Reinhardt} = require("reinhardt");
var reinhardt = new Reinhardt({
   loader: "WEB-INF/app/templates"
});

var {AdminUser, Topic, Question, Answer} = require("../model/all");
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

app.get("/", function(request) {
   if (isAdmin(request)) {
      return response.html(reinhardt.getTemplate("admin/overview.html").render({
         user: getCurrentUser(request),
         topics: Topic.all()
      }));
   }

   // for security to purge all old data
   request.session.invalidate();

   return response.html(reinhardt.getTemplate("admin/signin.html").render({}));
});

app.post("/signin", function(request) {

   if (request.postParams && request.postParams.username && request.postParams.password) {
      let username = request.postParams.username.trim();
      let password = request.postParams.password;

      let user = AdminUser.getByName(username);
      if (user != null) {
         var passwordHash = strings.b64encode(createDigest(password, strings.b64decode(user.salt, "raw")));

         if (user.authenticate(passwordHash)) {
            request.session.data.isAdmin = true;
            request.session.data.name = user.name;
            return response.redirect("/admin/");
         }
      }
   }

   return response.html(reinhardt.getTemplate("admin/signin.html").render({
      "message": "Could not authenticate user!"
   }));
});

app.post("/createTopic", function(request) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   if (request.postParams && request.postParams.title && request.postParams.slug) {
      let title = request.postParams.title.trim();
      let slug = request.postParams.slug.trim();
      let image = request.postParams.image || "";

      let topic = Topic.getBySlug(slug);
      let creator = getCurrentUser(request);
      if (topic == null) {
         var topic = Topic.create(title, slug, image, creator);
         return response.redirect("/admin/topic/" + slug);
      }
   }

   return response.html(reinhardt.getTemplate("admin/overview.html").render({
      "message": "Topic with the identical slug already exists!"
   }));
});

app.get("/topic/:slug", function(request, slug) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   return response.html(reinhardt.getTemplate("admin/topic.html").render({
      "topic": topic,
      "unreviewedQuestions": topic.unreviewedQuestions.all,
      "reviewedQuestions": topic.reviewedQuestions.all,
      "investigationQuestions": topic.investigationQuestions.all,
      "answeredQuestions": topic.answeredQuestions.all
   }));
});

app.get("/topic/:slug/:question/review", function(request, slug, qid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   question.state = Question.REVIEWED;
   question.save();
   topic.unreviewedQuestions.invalidate();
   topic.reviewedQuestions.invalidate();

   return response.redirect("/admin/topic/" + topic.slug);
});

app.get("/topic/:slug/:question/drop", function(request, slug, qid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   question.state = Question.DROPPED;
   question.save();
   topic.unreviewedQuestions.invalidate();

   return response.redirect("/admin/topic/" + topic.slug);
});

app.get("/topic/:slug/:question/investigate", function(request, slug, qid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   question.state = Question.UNDER_INVESTIGATION;
   question.save();
   topic.reviewedQuestions.invalidate();
   topic.investigationQuestions.invalidate();

   return response.redirect("/admin/topic/" + topic.slug);
});

app.get("/topic/:slug/:question/answered", function(request, slug, qid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   question.state = Question.ANSWERED;
   question.save();
   topic.investigationQuestions.invalidate();
   topic.answeredQuestions.invalidate();

   return response.redirect("/admin/topic/" + topic.slug);
});

app.get("/topic/:slug/:question/offline", function(request, slug, qid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   question.state = Question.OFFLINE;
   question.save();
   topic.answeredQuestions.invalidate();

   return response.redirect("/admin/topic/" + topic.slug);
});

app.get("/topic/:slug/:question/editanswers", function(request, slug, qid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   return response.html(reinhardt.getTemplate("admin/editanswers.html").render({
      "topic": topic,
      "question": question,
      "answers": question.answers.all
   }));
});

app.post("/topic/:slug/:question/editanswers", function(request, slug, qid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let creator = getCurrentUser(request);
   if (creator == null) {
      request.session.invalidate();
      return response.redirect("/admin");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   if (request.postParams && (request.postParams.text || request.postParams.link)) {
      var answer = Answer.create(creator, question, (request.postParams.text || "").trim(), (request.postParams.link || "").trim());
   } else {
      log.warn("Invalid answer submitted by", creator);
   }

   return response.redirect("/admin/topic/" + topic.slug + "/" + question.id + "/editanswers");
});

app.get("/topic/:slug/:question/:answer/offline", function(request, slug, qid, aid) {
   if (!isAdmin(request)) {
      return response.redirect("/");
   }

   let topic = Topic.getBySlug(slug);
   if (topic == null) {
      return response.redirect("/admin");
   }

   let question = Question.getById(qid);
   if (question == null || question.topic.id != topic.id) {
      return response.redirect("/admin");
   }

   let answer = Answer.getById(aid);
   if (answer == null || answer.question.id != question.id) {
      return response.redirect("/admin");
   }

   answer.state = Answer.OFFLINE;
   answer.save();
   question.answers.invalidate();

   return response.redirect("/admin/topic/" + topic.slug + "/" + question.id + "/editanswers");
});

app.get("/signout", function(request) {
   request.session.invalidate();

   return response.redirect("/admin/");
});