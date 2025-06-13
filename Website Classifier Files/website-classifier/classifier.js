const natural = require('natural');
const fs = require('fs');

class WebsiteClassifier {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.loadTrainingData();
  }

  loadTrainingData() {
    const data = JSON.parse(fs.readFileSync('./training-data.json'));
    data.forEach(item => {
      this.classifier.addDocument(item.domain, item.category);
    });
    this.classifier.train();
  }

  classify(domain) {
    const category = this.classifier.classify(domain);
    return {
      category,
      productive: ['work', 'education'].includes(category)
    };
  }

  addTrainingExample(domain, category) {
    this.classifier.addDocument(domain, category);
    this.classifier.train();
    
    const data = JSON.parse(fs.readFileSync('./training-data.json'));
    data.push({ domain, category });
    fs.writeFileSync('./training-data.json', JSON.stringify(data, null, 2));
  }
}

module.exports = new WebsiteClassifier();
