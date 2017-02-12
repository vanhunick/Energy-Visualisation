/**
 * Created by Nicky on 6/02/2017.
 */
var pg = require('pg');
var squel = require('squel');

var validSections = new ValidSelections([],[],[],[],[]);

function ValidSelections(sections, categories, subCategories, descriptions, companies){
    this.sections = sections;
    this.categories = categories;
    this.subCategories = subCategories;
    this.descriptions = descriptions;
    this.companies = companies;
}

var tableName = "large_strata_energy";

function getValidSections(){
    var queryString = squel.select()
        .from(tableName)
        .field("section")
        .distinct().toString();

    var validRows = [];


    pg.connect(global.databaseURI, function (err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if (err) {
            console.error('Could not connect to the database FOR SQL PROTECTION QUERY');
            console.error(err);
            return;
        }

        client.query(queryString, function (error, result) {
            done();
            if (error) {
                console.error('Failed to execute query FOR SQL PROTECTION QUERY');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].section;
                    validRows.push(c);
                }
                validSections.sections = validRows;
                console.log("Finished Section Query");
            }
        })
    });
}

function getValidSubCategories(){
    var queryString = squel.select()
        .from(tableName)
        .field("sub_category")
        .distinct().toString();

    var validRows = [];

    pg.connect(global.databaseURI, function (err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if (err) {
            console.error('Could not connect to the database FOR SQL PROTECTION QUERY');
            console.error(err);
            return;
        }

        client.query(queryString, function (error, result) {
            done();
            if (error) {
                console.error('Failed to execute query FOR SQL PROTECTION QUERY');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].sub_category;
                    validRows.push(c);
                }
                validSections.subCategories = validRows;
                console.log("Finished Sub Category Query");
            }
        })
    });
}

function getValidCategories(){
    var queryString = squel.select()
        .from(tableName)
        .field("category")
        .distinct().toString();

    var validRows = [];
    validRows.push("");

    pg.connect(global.databaseURI, function (err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if (err) {
            console.error('Could not connect to the database FOR SQL PROTECTION QUERY');
            console.error(err);
            return;
        }

        client.query(queryString, function (error, result) {
            done();
            if (error) {
                console.error('Failed to execute query FOR SQL PROTECTION QUERY');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].category;
                    validRows.push(c);
                }
                validSections.categories = validRows;
                console.log("Finished Category Query");
            }
        })
    });

}

function getValidDescriptions(){
    var queryString = squel.select()
        .from(tableName)
        .field("description")
        .distinct().toString();

    var validRows = [];

    pg.connect(global.databaseURI, function (err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if (err) {
            console.error('Could not connect to the database FOR SQL PROTECTION QUERY');
            console.error(err);
            return;
        }

        client.query(queryString, function (error, result) {
            done();
            if (error) {
                console.error('Failed to execute query FOR SQL PROTECTION QUERY');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].description;
                    validRows.push(c);
                }
                validSections.descriptions = validRows;
                console.log("Finished descriptions Query");
            }
        })
    });


}

function distinctCompanies(){
    var queryString = squel.select()
        .from(tableName)
        .field("edb")
        .distinct().toString();

    var validRows = [];

    pg.connect(global.databaseURI, function (err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if (err) {
            console.error('Could not connect to the database FOR SQL PROTECTION QUERY');
            console.error(err);
            return;
        }

        client.query(queryString, function (error, result) {
            done();
            if (error) {
                console.error('Failed to execute query FOR SQL PROTECTION QUERY');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].edb;
                    validRows.push(c);
                }
                validSections.companies = validRows;
                console.log("Finished Company Query");
            }
        })
    });
}

function createValidSelectionData(){
    getValidSections();
    getValidSubCategories();
    getValidCategories();
    getValidDescriptions();
    distinctCompanies();
}

function validSection(stringToCheck){
    return validSections.sections.indexOf(stringToCheck) > -1;
}

function validCategory(stringToCheck){
    return validSections.categories.indexOf(stringToCheck) > -1;
}

function validSubCategory(stringToCheck){
    return validSections.subCategories.indexOf(stringToCheck) > -1;
}

function validDescription(stringToCheck){
    return validSections.descriptions.indexOf(stringToCheck) > -1;
}

function validCompany(stringToCheck){
    return validSections.companies.indexOf(stringToCheck) > -1;
}

module.exports = {
    createValidSelectionData : function (){
        getValidSections();
        getValidSubCategories();
        getValidCategories();
        getValidDescriptions();
        distinctCompanies();
    },
    validSection : validSection,
    validCategory : validCategory,
    validSubCategory : validSubCategory,
    validDescription : validDescription,
    validCompany : validCompany
};



