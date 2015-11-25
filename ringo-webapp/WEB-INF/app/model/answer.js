var log = require("ringo/logging").getLogger(module.id);
var store = require("./store");

var Answer = module.exports = store.defineEntity("Answer", {
   "table": "t_answer",
   "id": {
      "column": "ans_id",
      "sequence": "answer_id"
   },
   "properties": {
      "question": {
         "type": "object",
         "entity": "Question",
         "column": "ans_f_question"
      },
      "created": {
         "column": "ans_created",
         "type": "timestamp"
      },
      "creator": {
         "type": "object",
         "entity": "AdminUser",
         "column": "ans_f_creator"
      },
      "text": {
         "type": "string",
         "column": "ans_text"
      },
      "state": {
         "type": "integer",
         "column": "ans_state"
      },
      "link": {
         "type": "string",
         "column": "ans_link",
         "length": 2000
      }
   }
});

Answer.OFFLINE = 0;
Answer.PUBLISHED = 1;

Answer.create = function(creator, question, text, link) {
   var answer = new Answer({
      "question": question,
      "text": text,
      "state": Answer.PUBLISHED,
      "link": link,
      "creator": creator,
      "created": new Date()
   });
   answer.save();
   question.answers.invalidate();
   return answer;
};

Answer.getById = function(id) {
   return store.query("from Answer as asw where asw.id = :id", {
         "id": id
      })[0] || null;
};

Answer.prototype.toString = function() {
   return "[Answer " + this.id + "]";
};