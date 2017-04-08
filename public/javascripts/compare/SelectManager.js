// Relies on
// JQUERY
// DataBase
// Events


// Manages a Section dropdown menu
function SectionSelect(idNumb){
    this.idNumb = idNumb;
    this.id = "#section-select"+idNumb; // The element id
    this.$select = $(this.id); // Selectets and caches the element

    // Respoinds to an event that indicates data is avalable for the drop down
    this.initEventListener = function (urlSelections) {
      var id = this.idNumb;
      var passID = this.id;
      var selection = urlSelections.filter(function(e){return e.id === id})[0];

      // Grab section from DB and add to dropdown
      Database.getSectionsFromDatabase(function(sections){
        dp.sortSections({sections : sections});
        addOptionsToSelector(passID,sections,selection.section);
      });
    }


    // When the selector is clicked send out a section changed event
    this.updated = function (event) {
      events.emit("SECTION_CHANGED", {section : this.$select.find("option:selected").text(), id : this.idNumb});
    }

    // Listen to these events
    this.$select.on('change', this.updated.bind(this) );
    events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}


// Manages a Section dropdown menu
function CategorySelect(idNumb){
  this.idNumb = idNumb;
  this.id = "#category-select"+this.idNumb;
  this.$select = $(this.id);


  // Respoinds to an event that indicates data is avalable for the drop down
  this.initEventListener = function (urlSelections) {
    var id = this.idNumb;
    var selection = urlSelections.filter(function(e){return e.id === id})[0];
    var passID = this.id

    // Grab categories from DB and add to the dropdown
    Database.getCategoriesFromDatabase(selection.section, function (categories, noResult) {
      if(!noResult){
        addOptionsToSelector(passID,categories,selection.category);
      }
    });
  }


  // When the selector is clicked send out a section changed event
  this.updated = function (event) {
    events.emit("CATEGORY_CHANGED", {category : this.$select.find("option:selected").text(), id : this.idNumb});
  }


  // When a section changes this finds the categories required
  this.sectionChangedListener = function (update) {
    if(update.id === this.idNumb){
        this.$select.html(''); // Clear out old options
        var passID = this.id

        Database.getCategoriesFromDatabase(update.selection.section, function (categories, noResult) {
          if(!noResult){
            addOptionsToSelector(passID,categories,""); // Might change this
          }
        });
    }
  }

  // Bind function to respond to update
  this.$select.on('change', this.updated.bind(this));

  // Listen to events we care about
  events.on("NEW_SECTION", this.sectionChangedListener.bind(this));
  events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}


// Manages a Subcategory dropdown menu
function SubCategorySelect(idNumb){
  this.idNumb = idNumb;
  this.id = "#subcategory-select"+this.idNumb;
  this.$select = $(this.id);


  // Respoinds to an event that indicates data is avalable for the drop down
  this.initEventListener = function (urlSelections) {
    var id = this.idNumb;
    var selection = urlSelections.filter(function(e){return e.id === id})[0];
    var passID = this.id;

    Database.getSubCategoriesFromDatabase(selection.section, selection.category, function (subCategories, noResult) {
      if(!noResult){
        addOptionsToSelector(passID,subCategories,selection.subCategory);
      }
    });
  }


  // Listens to a change in a category
  this.categoryChangedListener = function (update) {
    if(update.id === this.idNumb){
      this.$select.html('');
      var passID = this.id;
      var passIDNumb = this.idNumb;

      Database.getSubCategoriesFromDatabase(update.selection.section,update.selection.category, function (subCategories, noResult) {
        if(!noResult){
          addOptionsToSelector(passID,subCategories,""); // Might change this
        } else {
          events.emit("SUBCATEGORY_CHANGED", {subCategory : "", id : passIDNumb});// BY sending out this event description is notified with empty subCategory
        }
      });
    }
  }


  // When we are updated by the user send out an event
  this.updated = function (event) {
    events.emit("SUBCATEGORY_CHANGED", {subCategory : this.$select.find("option:selected").text(), id : this.idNumb});
  }


  // Bind function to respond to update
  this.$select.on('change', this.updated.bind(this));

  // Listen to events we care about
  events.on("SECTION_CHANGED", clearMyself.bind(this)); // TODO test
  events.on("NEW_CATEGORY", this.categoryChangedListener.bind(this));
  events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}



// Manages a Subcategory dropdown menu
function DescriptionSelect(id){
  this.idNumb = id;
  this.id = "#description-select"+id;
  this.$select = $(this.id);

  this.updated = function (event) {
    events.emit("DESCRIPTION_CHANGED",  {description : this.$select.find("option:selected").text(), id : this.idNumb});
  }


  //
  this.initEventListener = function (urlSelections) {
    var id = this.idNumb;
    var selection = urlSelections.filter(function(e){return e.id === id})[0];
    var passID = this.id;

    Database.getDescriptionsFromDatabase(selection.section, selection.category, selection.subCategory, function (descriptions, noResult) {
      if(!noResult){
        addOptionsToSelector(passID,descriptions,selection.description);
      }
    });
  }


  //
  this.subCategoryChangedListener = function (update) {
    if(update.id === this.idNumb){
        var passID = this.id;

        Database.getDescriptionsFromDatabase(update.selection.section,update.selection.category,update.selection.subCategory, function(descriptions){
          addOptionsToSelector(passID,descriptions,"");
        });
    }
  }

  // Bind function to respond to events
  this.$select.on('change', this.updated.bind(this));

  // Listen to events from any of the other selections changing on our row
  events.on("SECTION_CHANGED", clearMyself.bind(this)); // TODO test
  events.on("CATEGORY_CHANGED", clearMyself.bind(this));
  events.on("NEW_SUBCATEGORY", this.subCategoryChangedListener.bind(this));
  events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}

// Clears the options from the select
function clearMyself(update) {
  if(update.id === this.idNumb){
      this.$select.html('');
  }
}


/**
 * Adds the drop down options to one of the selectors
 *
 * @param selectorID {String} the id of the drop down
 * @param options {String[]} the options to add
 * @param selectedOption {String} the option that should be set as selected
 * */
function addOptionsToSelector(selectorID, options, selectedOption){
  $(selectorID).html(''); // Empty temp options
  for(var i = 0; i < options.length; i++){
    if(options[i] === null)continue;
    if(options[i] === selectedOption){
      $(selectorID).append('<option selected>' + options[i] + '</option>');
    } else {
      $(selectorID).append('<option>' + options[i] + '</option>');
    }
  }
  $(selectorID).selectpicker('refresh'); // Refresh the selections
}
