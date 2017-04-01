
var selectionRows =  (function(){
    // First create the empty selectiondatarows which are used to store the current selections
    var rowsData = [new SelectionRowController(0),new SelectionRowController(1),new SelectionRowController(2),new SelectionRowController(3)];

    // Next create the object that hold the logic for the selectors

    var selectors = [];
    for(var i = 0; i < 4; i++){
      selectors.push({ s : new SectionSelect(i), c : new CategorySelect(i), sc : new SubCategorySelect(i), d : new DescriptionSelect(i)});
    }

    var getAllSelectionData = function () {
      var selections = [];
      rowsData.forEach(function(r){
        selections.push(r.getRowSelection());
      });
      return selections;
    }


    var canSearch = function () {
        for(var i = 0; i < rowsData.length; i++){
          if(!rowsData[i].validSelection())return false;
        }
        return true;
    }

    /**
     * Loads in options for each selection drop down from a search.
     * When the page is loaded from a search the option for that search need to be inserted
     *
     * @param selection {Object} one row of selections (section, category etc)
     * */
    var setSelectionsFromURL = function(selection){
        // Find all the categories associated with selected section
        Database.getCategoriesFromDatabase(selection.section, function (categories,noResult) {
          if(!noResult){
            addOptionsToSelector('#category-select'+selection.id,categories, selection.category);
          }});

        // Find all the  sub categories associated with selected section and category
        Database.getSubCategoriesFromDatabase(selection.section, selection.category, function (subCategories, noResult) {
          if(!noResult){
            searchData.validOptions[selection.id] = true; // There are options for this row and sub category
            addOptionsToSelector('#subsection-select'+selection.id,subCategories,selection.subCategory);
          }});

        // Find all the  descriptions associated with selected section, category, and subsections
        Database.getDescriptionsFromDatabase(selection.section,selection.category,selection.subCategory, function (descriptions,noResult) {
          if(!noResult){
            addOptionsToSelector('#description-select'+selection.id,descriptions,selection.description);
          }});
    }

    var init = function (urlSelections, withSearch) {
      if(withSearch){
          events.emit("INIT_SELECTIONS", urlSelections);
      } else {
        // Just fill the section selectors with sections
        Database.getSectionsFromDatabase(function(sections){
          var dp = new DataProcessor();
          dp.sortSections({sections : sections}); // TODO fix

          for(var i = 0; i < 4; i++){
            addOptionsToSelector('#section-select'+i,sections,'');
          }
        });
      }
    }



    var clear = function (rowNumber) {
        rowsData[rowNumber].clear();
        $('#description-select'+rowNumber+',#subcategory-select'+rowNumber+',#category-select'+rowNumber).html('');
        $('#section-select'+rowNumber).find("option:selected").removeAttr("selected");
        $(".selectpicker").selectpicker('refresh');
    }


    init([],false);
    return {
      getAllSelectionData : getAllSelectionData,
      setSelectionsFromURL : setSelectionsFromURL,
      init : init,
      clear : clear,
      canSearch, canSearch
    }
})();
