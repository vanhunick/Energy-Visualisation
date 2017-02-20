module.exports = function(grunt){

  grunt.initConfig({

    pkg : grunt.file.readJSON('package.json'),

  uglify: {
    // uglify task configuration goes here.
    dist: {
      files: {
        'public/javascripts/compare.min.js': ['public/javascripts/compare.js']
      }
    }

  },
  cssmin : {
    combine : 'public/stylesheets/indexmin.css' : ['public/stylesheets/index.css']
  }
  // Arbitrary non-task-specific properties.

  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['cssmin', 'uglify']);
};
