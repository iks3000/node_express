module.exports = function(grunt){

    // Загружаем плагины
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec'
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });

    // Настраиваем плагины
    grunt.initConfig({
        cafemocha: {
            all: { src: 'qa/tests-*.js', options: { ui: 'tdd' } }  // This test doesn't work (not yet!!!), problem with zombie
        },
        jshint: {
            app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js']
        },
        exec: {
            blc: { cmd: 'blc http://localhost:3000/ -ro' } // must installed broken-link-checker Global
        }
    });

    // Регестрируем задания
    grunt.registerTask('default', ['jshint', 'exec', 'cafemocha']);
};