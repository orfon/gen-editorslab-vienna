var log = require("ringo/logging").getLogger(module.id);
var store = require("./store");
var Answer = require("./answer");

var Question = module.exports = store.defineEntity("Question", {
   "table": "t_question",
   "id": {
      "column": "que_id",
      "sequence": "question_id"
   },
   "properties": {
      "topic": {
         "type": "object",
         "entity": "Topic",
         "column": "que_f_topic"
      },
      "created": {
         "column": "que_created",
         "type": "timestamp"
      },
      "text": {
         "type": "string",
         "column": "que_text"
      },
      "state": {
         "type": "integer",
         "column": "que_state"
      },
      "upvotes": {
         "type": "integer",
         "column": "que_upvotes"
      },
      "enquirer": {
         "type": "object",
         "entity": "Enquirer",
         "column": "que_f_enquirer"
      },
      "clues": {
         "type": "collection",
         "query": "from Clue where question = :id"
      },
      "answers": {
         "type": "collection",
         "query": "from Answer ans where ans.question = :id and ans.state = " + Answer.PUBLISHED
      }
   }
});

// FIXME re-numerate: 0 should be offline to be consistent
Question.WAITING_FOR_REVIEW = 0;
Question.REVIEWED = 1;
Question.UNDER_INVESTIGATION = 2;
Question.ANSWERED = 3;
Question.OFFLINE = 4;
Question.DROPPED = 5;

Question.create = function(topic, text, enquirer) {
   var question = new Question({
      "topic": topic,
      "text": text,
      "state": Question.WAITING_FOR_REVIEW,
      "upvotes": 0,
      "enquirer": enquirer,
      "created": new Date()
   });
   question.save();
   topic.unreviewedQuestions.invalidate();
   return question;
};

Question.getById = function(id) {
   return store.query("from Question as que where que.id = :id", {
         "id": id
      })[0] || null;
};

Question.prototype.toString = function() {
   return "[Question " + this.id + "]";
};