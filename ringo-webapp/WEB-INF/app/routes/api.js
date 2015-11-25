var log = require("ringo/logging").getLogger(module.id);

var {EvictingQueue} = Packages.com.google.common.collect;

var strings = require("ringo/utils/strings");
var dates = require("ringo/utils/dates");
var response = require("ringo/jsgi/response");

var {AdminUser, Topic, Question, Answer} = require("../model/all");
var {Application} = require("stick");

var app = exports.app = new Application();
app.configure("route");

app.get("/upvote", function(request) {
   var qid = parseInt(request.queryParams.q, 10);
   if (isNaN(qid) || qid < 0) {
      return response.json({"ok": "no"}).notFound();
   }

   if (request.session.data) {
      let fresh = false;
      let countedVotes = request.session.data.countedVotes;
      let lastVote = request.session.data.lastVote;
      if (countedVotes == null || lastVote == null) {
         request.session.invalidate();
         countedVotes = request.session.data.countedVotes = EvictingQueue.create(100);
         request.session.data.lastVote = Date.now();
         fresh = true;
      }

      if (fresh || dates.diff(new Date(), new Date(request.session.data.lastVote), "second") > 5) {

         // check if user already voted in this session
         if (!countedVotes.contains(new java.lang.Integer(qid))) {
            // retrieve the question
            let question = Question.getById(qid);
            if (question.state == Question.REVIEWED) {
               // Store the current vote
               countedVotes.add(new java.lang.Integer(qid));
               request.session.data.lastVote = Date.now();

               // update the counter and save
               question.upvotes = question.upvotes + 1;
               question.save();
               question.topic.reviewedQuestions.invalidate();
               return response.json({"count": question.upvotes});
            }
         }
      }
   }

   request.session.data.lastVote = Date.now();
   return response.json({"ok": "no"}).bad();
});