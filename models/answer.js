var mongoonse = require('mongoose');

var Schema = mongoonse.Schema;

var AnswersSchema = new Schema({
   answer: String,
   a_date: Date
});

module.exports = mongoonse.Model('AnswerModel', AnswersSchema);