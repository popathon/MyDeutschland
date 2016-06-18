/**
 * @module Shared
 */

/**
 * I am the Database.
 * I store all data coming from the server. The data model objects (like {{#crossLink "HypervideoModel"}}HypervideoModel{{/crossLink}})
 * get their data from me. When they are done with manipulating the data, I can store the data back to the server.
 *
 * Note: All data objects inside me must be passed by reference, so that data can be manipulated in place, and insertions and deletions
 * should alter immediatly the database. In this way, data is kept consistent across the app 
 * (see {{#crossLink "Annotation/FrameTrail.newObject:method"}}FrameTrail.newObject('Annotation', data){{/crossLink}}).
 *
 * @class Database
 * @static
 */

 FrameTrail.defineModule('Database', function(){


    var projectID    = FrameTrail.module('RouteNavigation').projectID || '',
        hypervideoID = '',
        project      = {},
        hypervideos  = {},
        hypervideo   = {},
        sequence     = {},
        
        overlays     = [],
        links        = [],
        codeSnippets = [],
        resources    = {},

        annotations            = {},
        annotationfileIDs      = {},

        subtitles              = {},
        subtitlesLangMapping   = {
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français'
        },

        users  = {};
    
    /**
     * I load the project index data (../_data/projects/_index.json) from the server
     * and save the data for my projectID (from {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}})
     * in my attribute {{#crossLink "Database/project:attribute"}}Database/project{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadProjectData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadProjectData(success, fail) {


        $.ajax({

            type:   "GET",
            url:    '../_data/projects/_index.json',
            cache:  false,
            dataType: "json",
            mimeType: "application/json" 
        }).done(function(data){

            project = data.projects[projectID];

            if(!project){
                return fail('This project does not exist.');
            }

            success.call(this);

        }).fail(function(){

            fail('No project index file.');

        });


    };


    /**
     * I load the resource index data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} /resources/_index.json) from the server
     * and save the data in my attribute {{#crossLink "Database/resources:attribute"}}Database/resources{{/crossLink}}.
     * I call my success or fail callback respectively.
     * 
     * @method loadResourceData
     * @param {Function} success
     * @param {Function} fail
     */
    function loadResourceData(success, fail) {

        $.ajax({

            type:   "GET",
            url:    ('../_data/projects/' + projectID + '/resources/_index.json'),
            cache:  false,
            dataType: "json",
            mimeType: "application/json"      
        }).done(function(data){
        
            resources = data.resources;
            
            success.call(this);

        }).fail(function(){

            fail('No resources index file.');

        });

    };


    /**
     * I load the user.json of the current project from the server
     * and save the  data in my attribute {{#crossLink "Database/users:attribute"}}Database/users{{/crossLink}}.
     * I call my success or fail callback respectively.
     * 
     * @method loadUserData
     * @param {Function} success
     * @param {Function} fail
     */
    function loadUserData(success, fail) {

        if (!FrameTrail.module('RouteNavigation').environment.server) {
            
            $.ajax({
                type:   "GET",
                url:    ('../_data/projects/' + projectID + '/users.json'),
                cache:  false,
                dataType: "json",
                mimeType: "application/json"      
            }).done(function(data){
            
                users = data.user;
                
                success.call(this);

            }).fail(function(){

                fail('No user index file.');

            });
        } else {

            $.ajax({

                type:   "POST",
                url:    ('../_server/ajaxServer.php'),
                cache:  false,
                dataType: "json",
                mimeType: "application/json",
                data:   {

                    a:          'userGet',
                    projectID:  projectID

                }
            
            }).done(function(data){

                users = data.response.user;
                
                success.call(this);

            }).fail(function(){

                fail('No user index file.');

            });

        }

        

    };


    /**
     * I load the hypervideo index data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} /hypervideos/_index.json) from the server
     * and save the data in my attribute {{#crossLink "Database/hypervideos:attribute"}}Database/hypervideos{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadHypervideoData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadHypervideoData(success, fail) {

        $.ajax({

            type:   "GET",
            url:    ('../_data/projects/' + projectID + '/hypervideos/_index.json'),
            cache:  false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){
        
            hypervideos = data.hypervideos;
            
            success.call(this);

        }).fail(function(){

            fail('No hypervideo index file.');

        });

    };



    /**
     * I load the hypervideo sequence data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} 
     * /hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /hypervideo.json) from the server
     * and save the data in my attribute {{#crossLink "Database/hypervideo:attribute"}}Database/hypervideos{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadSequenceData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadSequenceData(success, fail) {
        
        $.ajax({

            type: "GET",
            url: ('../_data/projects/' + projectID + '/hypervideos/' + hypervideoID + '/hypervideo.json'),
            cache: false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){
        
            sequence = data;
            success.call(this);

        }).fail(function() {

            fail('No hypervideo data.');

        });


    };


    /**
     * I load the overlay data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} 
     * /hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /hypervideo.json) from the server
     * and save the data in my attribute {{#crossLink "Database/overlays:attribute"}}Database/overlays{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadOverlayData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadOverlayData(success, fail) {

        $.ajax({

            type: "GET",
            url: ('../_data/projects/' + projectID + '/hypervideos/' + hypervideoID + '/overlays.json'),
            cache: false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){
        
            overlays = data;
            success.call(this);

        }).fail(function() {

            fail('No Overlay data.');

        });

    };



    /**
     * I load the video link data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} 
     * /hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /hypervideo.json) from the server
     * and save the data in my attribute {{#crossLink "Database/links:attribute"}}Database/links{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadLinksData
     * @param {Function} success
     * @param {Function} fail
     * @private 
     */
    function loadLinksData(success, fail) {

        $.ajax({

            type: "GET",
            url: ('../_data/projects/' + projectID + '/hypervideos/' + hypervideoID + '/links.json'),
            cache: false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){

            links = data;
            success.call(this);

        }).fail(function() {

            fail('No Links data.');

        });

    };


    /**
     * I load the annotation data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} 
     * /hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /hypervideo.json) from the server
     * and save the data in my attribute {{#crossLink "Database/annotations:attribute"}}Database/annotations{{/crossLink}},
     * and the respective annotationfileIDs in my attribute {{#crossLink "Database/annotationfileIDs:attribute"}}Database/annotationfileIDs{{/crossLink}},
     * 
     *
     * I call my success or fail callback respectively.
     *
     * @method loadAnnotationData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadAnnotationData(success, fail) {

        var annotationsCount = 0;

        // clear previous data
        annotationfileIDs = {};
        annotations  = {};


        for (var id in hypervideo.annotationfiles) {
            annotationsCount ++;
        }

        for (var id in hypervideo.annotationfiles) {
            
            (function(id){

                $.ajax({
                    type: "GET",
                    url: ('../_data/projects/' + projectID + '/hypervideos/' + hypervideoID + '/annotationfiles/' + id + '.json'),
                    cache: false,
                    dataType: "json",
                    mimeType: "application/json"
                }).done(function(data){
                

                    annotations[hypervideo.annotationfiles[id].ownerId]       = data;
                    annotationfileIDs[hypervideo.annotationfiles[id].ownerId] = id;

                    annotationsCount--;
                    if(annotationsCount === 0){
                        
                        // all annotation data loaded from server
                        success.call(this);

                    }


                }).fail(function() {

                    fail('Missing annotation file.');

                });

            }).call(this, id)

        }


    };


    /**
     * I load the Code Snippet data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} 
     * /hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /codeSnippets.json) from the server
     * and save the data in my attribute {{#crossLink "Database/codesnippets:attribute"}}Database/codesnippets{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadCodeSnippetData
     * @param {Function} success
     * @param {Function} fail
     * @private 
     */
    function loadCodeSnippetData(success, fail) {

        $.ajax({

            type: "GET",
            url: ('../_data/projects/' + projectID + '/hypervideos/' + hypervideoID + '/codeSnippets.json'),
            cache: false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){

            codeSnippets = data;
            success.call(this);

        }).fail(function() {

            // call success anyway to deal with old versions (without codeSnippets.json file)
            success.call(this);
            
            //fail('No Code data.');

        });

    };

    
    /**
     * I load the subtitles data (../_data/projects/ {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} 
     * /hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /subtitles/...) from the server
     * and save the data in my attribute {{#crossLink "Database/subtitles:attribute"}}Database/subtitles{{/crossLink}}
     *
     * I call my success or fail callback respectively.
     *
     * @method loadSubtitleData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadSubtitleData(success, fail) {

        var subtitleCount = 0;

        subtitles = {};

        if (hypervideo.subtitles && hypervideo.subtitles.length > 0) {
            
            for (var idx in hypervideo.subtitles) {
                subtitleCount ++;
            }

            for (var i = 0; i < hypervideo.subtitles.length; i++) {
            
                (function(i){

                    var currentSubtitles = hypervideo.subtitles[i];

                    $.ajax({

                        type: "GET",
                        url: ('../_data/projects/' + projectID + '/hypervideos/' + hypervideoID + '/subtitles/' + currentSubtitles.src),
                        cache: false

                    }).done(function(data){
                        
                        var parsedCues = [];

                        // parse webvtt contents
                        var parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
                        parser.onregion = function(region) {};
                        parser.oncue = function(cue) {
                            parsedCues.push(cue);
                        };
                        parser.onparsingerror = function(e) {
                            console.log(e);
                        };
                        parser.parse(data);
                        parser.flush();

                        var langLabel;
                        if (subtitlesLangMapping[currentSubtitles.srclang]) {
                            langLabel = subtitlesLangMapping[currentSubtitles.srclang];
                        } else {
                            langLabel = currentSubtitles.srclang;
                        }

                        // write parsed contents in subtitles var
                        subtitles[currentSubtitles.srclang] = {};
                        subtitles[currentSubtitles.srclang]['label'] = langLabel;
                        subtitles[currentSubtitles.srclang]['cues'] = parsedCues;

                        subtitleCount--;
                        if(subtitleCount === 0){
                            
                            // all subtitle data loaded from server
                            success.call(this);

                        }


                    }).fail(function() {

                        fail('Missing subtitle file.');

                    });

                }).call(this, i)

            }

        } else {

            // no subtitles found, continue
            success.call(this);

        }


    };




    
    /**
     * I initialise the load process of the database
     *
     * First I look for the {{#crossLink "RouteNavigation/projectID:attribute"}}RouteNavigation/projectID{{/crossLink}} and
     * {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}}.
     *
     * Then I call the nested load functions to fetch all data from the server.
     * I call my success or fail callback respectively.
     *
     * @method loadData
     * @param {Function} success
     * @param {Function} fail
     */
    function loadData(success, fail) {


        projectID    = FrameTrail.module('RouteNavigation').projectID;
        hypervideoID = FrameTrail.module('RouteNavigation').hypervideoID;
        

        if(projectID === undefined){

            return fail('No Project was selected.');

        }


        if(hypervideoID === undefined){

            //FrameTrail.module('InterfaceModal').showStatusMessage('No Hypervideo is selected.');

            hypervideo   = null;
            sequence     = {};
            annotations  = {};
            overlays     = [];
            links        = [];
            codeSnippets = [];

            return  loadProjectData(function(){

                        loadResourceData(function(){

                            loadUserData(function(){

                                loadHypervideoData(function(){
                                
                                    success.call();

                                }, fail);

                            }, fail);

                        }, fail);

                    }, fail);

        }


        loadProjectData(function(){

            loadResourceData(function(){

                loadUserData(function(){

                    loadHypervideoData(function(){

                    
                        hypervideo = hypervideos[hypervideoID];

                        if(!hypervideo){

                            return fail('This hypervideo does not exist.');
                            
                        }

                        loadSequenceData(function(){

                            loadSubtitleData(function(){
                                
                                loadOverlayData(function(){

                                    loadLinksData(function(){

                                        loadAnnotationData(function(){

                                            loadCodeSnippetData(function(){
                                                
                                                success.call();

                                            }, fail);

                                        }, fail);

                                    }, fail);

                                }, fail);

                            }, fail);

                        }, fail);


                    }, fail);


                }, fail);
            
            }, fail);

        }, fail);


    };



    /**
     * I update the hypervideo data inside the database
     *
     * @method updateHypervideoData
     * @param {Function} success
     * @param {Function} fail
     */
    function updateHypervideoData(success, fail) {

        hypervideoID = FrameTrail.module('RouteNavigation').hypervideoID;

        loadHypervideoData(function(){

            hypervideo = hypervideos[hypervideoID];
            
            if(!hypervideo){

                return fail('This hypervideo does not exist.');
                
            }

            loadSequenceData(function(){

                loadSubtitleData(function(){
                    
                    loadOverlayData(function(){

                        loadLinksData(function(){

                            loadAnnotationData(function(){

                                loadCodeSnippetData(function(){
                                                
                                    success.call();

                                }, fail);

                            }, fail);

                        }, fail);

                    }, fail);

                }, fail);

            }, fail);


        }, fail);

    };




    /**
     * I save the overlay data back to the server.
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     *
     * or
     *
     *     { failed: 'overlays', error: ... }
     *
     * @method saveOverlays
     * @param {Function} callback
     */
    function saveOverlays(callback) {

        $.ajax({
            type:   'POST',
            url:    '../_server/ajaxServer.php',
            cache:  false,

            data: {

                a:              'hypervideoChangeFile',
                projectID:      projectID,
                hypervideoID:   hypervideoID,
                type:           'overlays',

                src:            JSON.stringify(overlays)

            }

        }).done(function(data) {
            
            if (data.code === 0) {

                callback.call(window, { success: true });

            } else {

                callback.call(window, { 
                    failed: 'overlays', 
                    error: 'ServerError', 
                    code: data.code 
                });

            }

        }).fail(function(error){

            callback.call(window, { 
                failed: 'overlays', 
                error: error 
            });

        });

    };


    /**
     * I save the video link data back to the server.
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     *
     * or
     *
     *     { failed: 'links', error: ... }
     *
     * @method saveLinks
     * @param {} callback
     */
    function saveLinks(callback) {

        $.ajax({
            type:   'POST',
            url:    '../_server/ajaxServer.php',
            cache:  false,

            data: {

                a:              'hypervideoChangeFile',
                projectID:      projectID,
                hypervideoID:   hypervideoID,
                type:           'links',

                src:            JSON.stringify(links)

            }

        }).done(function(data) {
            
            if (data.code === 0) {

                callback.call(window, { success: true });

            } else {

                callback.call(window, { 
                    failed: 'links', 
                    error: 'ServerError', 
                    code: data.code 
                });

            }

        }).fail(function(error){

            callback.call(window, { 
                failed: 'links', 
                error: error 
            });

        });


    };


    /**
     * I save the code snippet data back to the server.
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     *
     * or
     *
     *     { failed: 'codesnippets', error: ... }
     *
     * @method saveCodeSnippets
     * @param {} callback
     */
    function saveCodeSnippets(callback) {

        $.ajax({
            type:   'POST',
            url:    '../_server/ajaxServer.php',
            cache:  false,

            data: {

                a:              'hypervideoChangeFile',
                projectID:      projectID,
                hypervideoID:   hypervideoID,
                type:           'codeSnippets',

                src:            JSON.stringify(codeSnippets)

            }

        }).done(function(data) {
            
            if (data.code === 0) {

                callback.call(window, { success: true });

            } else {

                callback.call(window, { 
                    failed: 'codeSnippets', 
                    error: 'ServerError', 
                    code: data.code 
                });

            }

        }).fail(function(error){

            callback.call(window, { 
                failed: 'codeSnippets', 
                error: error 
            });

        });


    };


    /**
     * I save the annotation data back to the server.
     *
     * I choose by myself the appropriate server method ($_POST["action"]: "save" or "saveAs")
     * wether the user's annotation file does already exist, or has to be created.
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     *
     * or
     *
     *     { failed: 'annotations', error: ... }
     *
     * @method saveAnnotations
     * @param {Function} callback
     */
    function saveAnnotations(callback) {

        var userID              = FrameTrail.module('UserManagement').userID,
            action              = annotationfileIDs.hasOwnProperty(userID)
                                    ? 'save'
                                    : 'saveAs',

            annotationfileID    = annotationfileIDs[userID],

            name                = FrameTrail.getState('username'),
            description         = FrameTrail.getState('username') + '\'s annotations',
            hidden              = false;



        $.ajax({
            type:   'POST',
            url:    '../_server/ajaxServer.php',
            cache:  false,

            data: {

                a:                'annotationfileSave',
                projectID:        projectID,
                hypervideoID:     hypervideoID,
                action:           action,
                annotationfileID: annotationfileID,
                name:             name,
                description:      description,
                hidden:           hidden,

                src:              JSON.stringify(annotations[userID])

            }

        }).done(function(data) {
            
            if (data.code === 0) {

                if (action === 'saveAs') {
                    annotationfileIDs[userID] = data.annotationID.toString();
                }

                callback.call(window, { success: true });

            } else {

                callback.call(window, { 
                    failed: 'annotations', 
                    error: 'ServerError', 
                    code: data.code 
                });

            }

        }).fail(function(error){

            callback.call(window, { 
                failed: 'annotations', 
                error: error 
            });

        });


    };









    /**
     * I search the resource database for a given data object and return its id.
     *
     * @method getIdOfResource
     * @param {} resourceData
     * @return String or null
     */
    function getIdOfResource(resourceData) {

        for (var id in resources) {
            if (resources[id] === resourceData){
                return id;
            }
        }
        return null;
    };


    /**
     * I search the hypervideo database for a given data object and return its id.
     *
     * @method getIdOfHypervideo
     * @param {} data
     * @return String or null
     */
    function getIdOfHypervideo(data) {

        for (var id in hypervideos) {
            if (hypervideos[id] === data){
                return id;
            }
        }
        return null;
    };



    return {

        /**
         * I store the project index data (from the server's ../_data/projects/_index.json)
         * @attribute project
         */
        get project()       { return project },

        /**
         * I store the hypervideo index data (from the server's ../_data/projects/<ID>/hypervideos/_index.json)
         * @attribute hypervideos
         */
        get hypervideos()   { return hypervideos },
        /**
         * I store the hypervideo index data for the current hypervideo
         * @attribute hypervideo
         */
        get hypervideo()     { return hypervideo },

        //TODO Check if setting hypervideo data on update necessary
        set hypervideo(data) { return hypervideo = data },

        /**
         * I store the hypervideo sequence data (from the server's ../_data/projects/<ID>/hypervideos/<ID>/hypervideo.json)
         * @attribute sequence
         */
        get sequence()      { return sequence },
        /**
         * I store the overlays data (from the server's ../_data/projects/<ID>/hypervideos/<ID>/overlays.json)
         * @attribute overlays
         */
        get overlays()      { return overlays },
        /**
         * I store the video links data (from the server's ../_data/projects/<ID>/hypervideos/<ID>/links.json)
         * @attribute links
         */
        get links()         { return links },
        /**
         * I store the code snippets data (from the server's ../_data/projects/<ID>/hypervideos/<ID>/codeSnippets.json)
         * @attribute codesnippets
         */
        get codeSnippets()         { return codeSnippets },

        /**
         * I store the annotation data (from all json files from the server's ../_data/projects/<ID>/hypervideos/<ID>/annotationfiles/).
         *
         * I am a map of keys (userIDs) to an array of all annotations from that user.
         *
         *     {
         *         "userID": [ annotationData, annotationData, ... ]
         *     }
         * 
         * 
         * @attribute annotations
         */
        get annotations()        { return annotations       },
        /**
         * I store the file IDs of the user's annotation sets.
         *
         * The server manages file names automatically without influence of the client. That is why the client has to remeber the file ID 
         * of the several sets of annotations, which belong to a single user.
         *
         *     {
         *       "userID": "fileID"
         *     }
         * 
         * @attribute annotationfileIDs
         */
        get annotationfileIDs()  { return annotationfileIDs },

        /**
         * I store the subtitle data (from all .vtt files from the server's ../_data/projects/<ID>/hypervideos/<ID>/subtitles/).
         * 
         * @attribute annotations
         */
        get subtitles()        { return subtitles       },

        /**
         * I store a map of subtitle language codes and labels.
         * 
         * @attribute subtitlesLangMapping
         */
        get subtitlesLangMapping() { return subtitlesLangMapping },

        /**
         * I store the resource index data (from the server's ../_data/projects/<ID>/resources/_index.json)
         * @attribute resources
         */
        get resources()     { return resources },

        /**
         * I store the user data (from the projects user.json). The keys are the userIDs, and the values are maps of the user's attributes.
         * @attribute users
         */
        get users()     { return users },


        getIdOfResource:       getIdOfResource,
        getIdOfHypervideo:     getIdOfHypervideo,

        loadData:              loadData,
        loadProjectData:       loadProjectData,
        loadResourceData:      loadResourceData,

        loadHypervideoData:    loadHypervideoData,
        updateHypervideoData:  updateHypervideoData,
        loadSequenceData:      loadSequenceData,
        loadSubtitleData:      loadSubtitleData,

        saveOverlays:          saveOverlays,
        saveLinks:             saveLinks,
        saveCodeSnippets:      saveCodeSnippets,
        saveAnnotations:       saveAnnotations

    }
    


});