var assert = chai.assert;

describe('Database tests', function() {

  // Grab sections test
  it('Grabbing sections should contain at least one result', function(done) {
      Database.getSectionsFromDatabase(function(sections){
        assert.isTrue(sections.length > 0);
        done();
      });
  });

  // Grabbing Categories test
  it('Grabbing category for known section should contain at least one result', function(done) {
      Database.getCategoriesFromDatabase("1(i): Expenditure metrics", function(categories, noResult){
        assert.isFalse(noResult);
        assert.isTrue(categories.length > 0);
        done();
      });
  });

  it('Grabbing category for random section should not contain a result', function(done) {
      Database.getCategoriesFromDatabase("dfdfdfdf", function(categories, noResult){
        assert.isTrue(noResult);
        assert.equal(categories.length, 0);
        done();
      });
  });


  // Grabbing sub section tests
  it('Grabbing subCategory for known section and category should contain at least one result', function(done) {
      Database.getSubCategoriesFromDatabase("1(i): Expenditure metrics", "Operational expenditure" ,function(subCategories, noResult){
        assert.isFalse(noResult);
        assert.isTrue(subCategories.length > 0);
        done();
      });
  });

  it('Grabbing subCategory for random section and category should not contain a result', function(done) {
      Database.getSubCategoriesFromDatabase("dfdfdfdf","sdsds",function(subCategories, noResult){
        assert.isTrue(noResult);
        assert.equal(subCategories.length, 0);
        done();
      });
  });


  // Grabbing description tests
  it('Grabbing description for known sectionm, category and subCategory should contain at least one result', function(done) {
      Database.getDescriptionsFromDatabase("1(i): Expenditure metrics", "Operational expenditure","Network", function(descriptions, noResult){
        assert.isFalse(noResult);
        assert.isTrue(descriptions.length > 0);
        done();
      });
  });
  
  it('Grabbing description for random section, sub category and category should not contain a result', function(done) {
      Database.getDescriptionsFromDatabase("dfdfdfdf","sdsds","dfd", function(descriptions, noResult){
        assert.isTrue(noResult);
        assert.equal(descriptions.length, 0);
        done();
      });
  });
});
