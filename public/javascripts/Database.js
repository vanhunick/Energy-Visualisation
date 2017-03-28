var Database = (function(){


  /**
   *  Grabs all the sections from the database
   *
   *  @callback should take (Object[], Boolean) array contains categories boolean is true if no results false if there is a result
   * */
  function getSectionsFromDatabase(callback){
    $.get("/sections/sections", function(data){
        if(data.sections.length > 0){
          callback(data.sections, false);
        } else {
          callback(sections, true);
        }
    });
  }

  /**
   *  Grabs all the categories for a specific section
   *
   *  @param section {String} The section to look for distinct categories in
   *  @callback should take (Object[], Boolean) array contains categories boolean is true if no results false if there is a result
   * */
  function getCategoriesFromDatabase(section, callback){
    // Find all the categories associated with this section
    $.post("/sections/s",{selected : section }, function(data){
      if(data.categories.length > 0  &&  data.categories[0] !== null){
        callback(data.categories, false);
      } else { // The one special case where category is null
        callback([], true); // No result
      }});
  }


  /**
   * Grabs all sub categories for a specific section and category
   *
   * @param section {String} The section to look for distinct categories in
   * @param category {String} The category to look for distinct sub categories in
   * @param callback {function} The function to call once the query has a result
   * */
  function getSubCategoriesFromDatabase(section, category, callback){
    $.post("/sections/sc",{section : section, category : category}, function(data){
      if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
        callback(data.subCategories, false); // There is a result
      } else {
        callback([], true); // No results
      }
    });
  }


  /**
   * Grabs all description for a specific section, category and sub category if sub category
   * is not an empty string.
   *
   * @param section {String} The section to look for distinct categories in
   * @param category {String} The category to look for distinct sub categories in
   * @param subCategory {String} The sub category to look for distinct sub categories in
   * @param callback {function} The function to call once the query has a result
   * */
  function getDescriptionsFromDatabase(section,category,subCategory,callback){
    // Find all descriptions for the currently selected sub category
    $.post("/sections/desc",{category : category,section : section, subCategory : subCategory}, function(data){
      if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
        callback(data.descriptions, false);
      } else {
        callback(data.descriptions, true);
      }});
  }

  return {
      getCategoriesFromDatabase : getCategoriesFromDatabase,
      getSubCategoriesFromDatabase : getSubCategoriesFromDatabase,
      getDescriptionsFromDatabase : getDescriptionsFromDatabase,
      getSectionsFromDatabase : getSectionsFromDatabase
  }
})();
