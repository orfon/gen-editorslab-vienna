var log = require("ringo/logging").getLogger(module.id);
var store = require("./store");

var Question = require("./question");

var Topic = module.exports = store.defineEntity("Topic", {
   "table": "t_topic",
   "id": {
      "column": "tpc_id",
      "sequence": "topic_id"
   },
   "properties": {
      "slug": {
         "type": "string",
         "column": "tpc_slug",
         "length": 255
      },
      "title": {
         "type": "string",
         "column": "tpc_password",
         "length": 1000
      },
      "image": {
         "type": "string",
         "column": "tpc_image",
         "length": 1000
      },
      "creator": {
         "type": "object",
         "entity": "AdminUser",
         "column": "tpc_f_creator"
      },
      "created": {
         "column": "tpc_created",
         "type": "timestamp"
      },
      "unreviewedQuestions": {
         "type": "collection",
         "query": "from Question que where que.topic = :id and que.state = " + Question.WAITING_FOR_REVIEW
      },
      "reviewedQuestions": {
         "type": "collection",
         "query": "from Question que where que.topic = :id and que.state = " + Question.REVIEWED
      },
      "investigationQuestions": {
         "type": "collection",
         "query": "from Question que where que.topic = :id and que.state = " + Question.UNDER_INVESTIGATION
      },
      "answeredQuestions": {
         "type": "collection",
         "query": "from Question que where que.topic = :id and que.state = " + Question.ANSWERED
      }
   }
});

Topic.create = function(title, slug, image, creator) {
   var topic = new Topic({
      "title": title,
      "slug": slug,
      "image": image,
      "creator": creator,
      "created": new Date()
   });
   topic.save();
   return topic;
};

Topic.getBySlug = function(slug) {
   return store.query("from Topic as tpc where tpc.slug = :slug", {
         "slug": slug
      })[0] || null;
};

Topic.prototype.toString = function() {
   return "[Topic " + this.slug + "]";
};