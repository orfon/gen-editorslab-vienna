var log = require("ringo/logging").getLogger(module.id);
var store = require("./store");

var Clue = module.exports = store.defineEntity("Clue", {
   "table": "t_clue",
   "id": {
      "column": "clu_id",
      "sequence": "clue_id"
   },
   "properties": {
      "question": {
         "type": "object",
         "entity": "Question",
         "column": "clu_f_question"
      },
      "created": {
         "column": "clu_created",
         "type": "timestamp"
      },
      "text": {
         "type": "string",
         "column": "clu_text"
      },
      "state": {
         "type": "integer",
         "column": "clu_state"
      },
      "whistleblower": {
         "type": "string",
         "column": "clu_whistleblower",
         "length": 1000
      }
   }
});