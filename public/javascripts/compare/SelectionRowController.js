// Contains information for a row of selections
// Recieves events from selectors when the selection changes and updates it's state
// Send out events when selectors change and other selectors should be notified
function SelectionRowController(id){
    this.idNumb = id;
    this.rowSelections = { id : id, section : "", category : "", subCategory : "", description : "" };

    this.setInitialState = function (rowData) {
      this.rowSelections = rowData;
    }

    this.clear = function () {
      this.rowSelections = { id : this.id, section : "", category : "", subCategory : "", description : "" };
    }

    this.validSelection = function () {
      if(this.rowSelections.section !== "" && this.rowSelections.description === "")return false;
      return true;
    }

    this.initEventListener = function (urlSelections) {
      var id = this.idNumb;
      var urlSelection = urlSelections.filter(function(e){return (e.id === id)})[0];

      this.rowSelections.section = urlSelection.section;
      this.rowSelections.category = urlSelection.category;
      this.rowSelections.subCategory = urlSelection.subCategory;
      this.rowSelections.description = urlSelection.description;
    }

    this.updateSection = function (update) {
        if(update.id === this.idNumb){
          // Set the new selected section
          this.rowSelections.section = update.section;
          events.emit("NEW_SECTION", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.updateCategory = function (update) {
        if(update.id === this.idNumb){
          this.rowSelections.category = update.category;
          events.emit("NEW_CATEGORY", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.updateSubCategory = function (update) {
        if(update.id === this.idNumb){
          this.rowSelections.subCategory = update.subCategory;
          events.emit("NEW_SUBCATEGORY", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.updateDescription = function (update) {
        if(update.id === this.idNumb){
          this.rowSelections.description = update.description;
          events.emit("NEW_DESCRIPTION", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.getRowSelection = function () {
        return this.rowSelections;
    }

    // If any of these events call the update function
    events.on("SECTION_CHANGED", this.updateSection.bind(this));
    events.on("CATEGORY_CHANGED", this.updateCategory.bind(this));
    events.on("SUBCATEGORY_CHANGED", this.updateSubCategory.bind(this));
    events.on("DESCRIPTION_CHANGED", this.updateDescription.bind(this));
    events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}
