/**
 * @module Player
 */


/**
 * I am the HypervideoModel which stores all data which make up the hypervideo.
 *
 * @class HypervideoModel
 * @static
 */

 FrameTrail.defineModule('HypervideoModel', function(){


    var hasHTML5Video           = true,
        duration                = 0,
        sourceFiles             = {
                                    webm: '',
                                    mp4:  ''
                                  },

        hypervideoName          = '',
        description             = '',
        creator                 = '',
        creatorId               = '',
        created                 = 0,
        lastchanged             = 0,
        hidden                  = false,

        subtitleFiles           = [],
        subtitles               = [],
        selectedLang            = '',

        overlays                = [],
        videolinks              = [],

        codeSnippets            = [],

        annotationSets          = {},
        selectedAnnotationSet   = '',
        mainAnnotationSet       = '',

        unsavedOverlays         = false,
        unsavedVideolinks       = false,
        unsavedCodeSnippets     = false,
        unsavedAnnotations      = false;



    /**
     * The data model is initialized after the {{#crossLink "Database"}}Database{{/crossLink}} is ready
     * and before the different views (like {{#crossLink "ViewVideo"}}ViewVideo{{/crossLink}}) are created.
     *
     * I do the following jobs:
     * * I read in the {{#crossLink "Database/hypervideo:attribute"}}hypervideo metadata{{/crossLink}}, and store them in my attributes (like name, description, creator)
     * * I read in the {{#crossLink "Database/hypervideo:attribute"}}configuration of the hypervideo{{/crossLink}} (hypervideo.config) and set the key-value-pairs as global state (FrameTrail.changeState())
     * * I read in the sequence data of the hypervideo, and set the video source file (webm and mp4), or – when their is no resourceId for a video – I set the {{#crossLink "HypervideoModel/duration:attribute"}}duration{{/crossLink}} attribute for a "null video".
     * * I call {{#crossLink "HypervideoModel/initModelOfOverlays:method"}}initModelOfOverlays{{/crossLink}}, {{#crossLink "HypervideoModel/initModelOfVideolinks:method"}}initModelOfVideolinks{{/crossLink}}, {{#crossLink "HypervideoModel/initModelOfCodeSnippets:method"}}initModelOfCodeSnippets{{/crossLink}} and {{#crossLink "HypervideoModel/initModelOfAnnotations:method"}}initModelOfAnnotations{{/crossLink}}.
     * * I return control to the callback.
     *
     * @method initModel
     * @param {Function} callback
     */
    function initModel(callback) {


        var database   = FrameTrail.module('Database'),
            hypervideo = database.hypervideo,
            videoData  = database.sequence.clips[0];


        // Read in metadata
        hypervideoName = hypervideo.name;
        description    = hypervideo.description;
        creator        = hypervideo.creator;
        creatorId      = hypervideo.creatorId;
        created        = hypervideo.created;
        lastchanged    = hypervideo.lastchanged;
        hidden         = hypervideo.hidden;



        // Read in config of Hypervideo
        for (var key in hypervideo.config) {

            FrameTrail.changeState('hv_config_' + key, hypervideo.config[key]);

        }

        // Set video source or NullVideo
        if (!videoData.resourceId) {

            hasHTML5Video = false;
            duration      = videoData.duration;


        } else {

            sourceFiles.webm = database.resources[videoData.resourceId].src;
            sourceFiles.mp4  = database.resources[videoData.resourceId].attributes.alternateVideoFile;

        }

        // Set subtitle files
        subtitleFiles        = hypervideo.subtitles;

        initModelOfOverlays(database);
        initModelOfVideolinks(database);
        initModelOfCodeSnippets(database);
        initModelOfAnnotations(database);
        initModelOfSubtitles(database);


        // Show warning if user tries to leave the page without having saved changes
        $(window).on('beforeunload', function(e) {
            if ( FrameTrail.getState('unsavedChanges') ) {
                // This message is not actually shown to the user in most cases, but the browser needs a return value
                var message = "You have not saved your changes. Are you sure you want to leave the page?";
                return message;
            }
        });


        callback.call()


    };


    /**
     * I create the {{#crossLink "Overlay"}}Overlay{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/overlays:attribute"}}overlays{{/crossLink}} attribute.
     *
     * @method initModelOfOverlays
     * @param {Database} database
     * @private
     */
    function initModelOfOverlays(database) {

        for (var idx in database.overlays) {

            overlays.push(
                FrameTrail.newObject('Overlay',
                    database.overlays[idx]
                )
            );

        }


    };

    /**
     * I create the {{#crossLink "Videolink"}}Videolink{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/videolinks:attribute"}}videolinks{{/crossLink}} attribute.
     *
     * @method initModelOfVideolinks
     * @param {Database} database
     * @private
     */
    function initModelOfVideolinks(database) {

        for (var idx in database.links) {

            videolinks.push(
                FrameTrail.newObject('Videolink',
                    database.links[idx]
                )
            );

        }

    };

    /**
     * I create the {{#crossLink "CodeSnippet"}}CodeSnippet{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/codeSnippets:attribute"}}codeSnippets{{/crossLink}} attribute.
     *
     * @method initModelOfCodeSnippets
     * @param {Database} database
     * @private
     */
    function initModelOfCodeSnippets(database) {

        for (var idx in database.codeSnippets) {

            codeSnippets.push(
                FrameTrail.newObject('CodeSnippet',
                    database.codeSnippets[idx]
                )
            );

        }

    };

    /**
     * I create the {{#crossLink "Annotation"}}Annotation{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/annotations:attribute"}}annotations{{/crossLink}} attribute.
     *
     * Also I select the the main annotation set (from the user who created the hypervideo) as the current one.
     *
     * @method initModelOfAnnotations
     * @param {Database} database
     * @private
     */
    function initModelOfAnnotations(database) {

        // clear previous data
        annotationSets = {};

        for (var ownerId in database.annotations) {

            annotationSets[ownerId] = [];

            for (var idx in database.annotations[ownerId]) {

                annotationSets[ownerId].push(
                    FrameTrail.newObject('Annotation',
                        database.annotations[ownerId][idx]
                    )
                );

            }

        }


        for (var ownerId in database.annotationfileIDs) {
            if (database.annotationfileIDs[ownerId] === FrameTrail.module('Database').hypervideo.mainAnnotation) {
                selectedAnnotationSet = mainAnnotationSet = ownerId;
            }
        }


    };


    /**
     * I create the {{#crossLink "Subtitle"}}Subtitle{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/subtitles:attribute"}}subtitles{{/crossLink}} attribute.
     *
     * @method initModelOfSubtitles
     * @param {Database} database
     */
    function initModelOfSubtitles(database) {

        for (var lang in database.subtitles) {

            subtitles[lang] = [];

            for (var idx in database.subtitles[lang].cues) {

                subtitles[lang].push(
                    FrameTrail.newObject('Subtitle',
                        database.subtitles[lang].cues[idx]
                    )
                );


            }
        }

        if (subtitles['en']) {
            selectedLang = 'en';
        } else if ( !$.isEmptyObject(database.subtitles) ) {
            for (first in database.subtitles) break;
                selectedLang = first;
        }


    };



    /**
     * I remove all data of an overlay from the model and from the database.
     *
     * I am called from {{#crossLink "OverlaysController/deleteOverlay:method"}}OverlaysController/deleteOverlay{{/crossLink}}.
     *
     * @method removeOverlay
     * @param {Overlay} overlay
     */
    function removeOverlay(overlay) {

        var idx;

        idx = overlays.indexOf(overlay);
        overlays.splice(idx, 1);

        idx = FrameTrail.module('Database').overlays.indexOf(overlay.data);
        FrameTrail.module('Database').overlays.splice(idx, 1);

        newUnsavedChange('overlays');

    };

    /**
     * I remove all data of a video link from the model and from the database.
     *
     * I am called from {{#crossLink "VideolinksController/deleteVideolink:method"}}VideolinksController/deleteVideolink{{/crossLink}}.
     *
     * @method removeVideolink
     * @param {Videolink} videolink
     */
    function removeVideolink(videolink) {

        var idx;

        idx = videolinks.indexOf(videolink);
        videolinks.splice(idx, 1);

        idx = FrameTrail.module('Database').links.indexOf(videolink.data);
        FrameTrail.module('Database').links.splice(idx, 1);

        newUnsavedChange('links');

    };

    /**
     * I remove all data of a code snippet from the model and from the database.
     *
     * I am called from {{#crossLink "CodeSnippetsController/deleteVideolink:method"}}CodeSnippetsController/deleteCodeSnippet{{/crossLink}}.
     *
     * @method removeCodeSnippet
     * @param {CodeSnippet} codeSnippet
     */
    function removeCodeSnippet(codeSnippet) {

        var idx;

        idx = codeSnippets.indexOf(codeSnippet);
        codeSnippets.splice(idx, 1);

        idx = FrameTrail.module('Database').codeSnippets.indexOf(codeSnippet.data);
        FrameTrail.module('Database').codeSnippets.splice(idx, 1);

        newUnsavedChange('codeSnippets');

    };


    /**
     * I remove all data of an annotation from the model and from the database.
     *
     * I am called from {{#crossLink "AnnotationsController/deleteAnnotation:method"}}AnnotationsController/deleteAnnotation{{/crossLink}}.
     *
     * @method removeAnnotation
     * @param {Annotation} annotation
     */
    function removeAnnotation(annotation) {

        var database = FrameTrail.module('Database'),
            idx;

        idx = annotationSets[selectedAnnotationSet].indexOf(annotation);
        annotationSets[selectedAnnotationSet].splice(idx, 1);

        if (database.annotations[selectedAnnotationSet]) {
            idx = database.annotations[selectedAnnotationSet].indexOf(annotation.data);
            database.annotations[selectedAnnotationSet].splice(idx, 1);
        }

        newUnsavedChange('annotations');

    };


    /**
     * I create a new {{#crossLink "Overlay"}}overlay{{/crossLink}}.
     *
     * I am called from {{#crossLink "OverlaysController/makeTimelineDroppable:method"}}OverlaysController{{/crossLink}}.
     *
     * @method newOverlay
     * @param {} protoData
     * @return Overlay
     */
    function newOverlay(protoData) {

        var resourceDatabase = FrameTrail.module('Database').resources,
            newOverlay,
            newData;

            // TODO: clean code
            if ( protoData.type == 'text' ) {
                newData = {
                    "name":         protoData.name,
                    "creator":      FrameTrail.getState('username'),
                    "creatorId":    FrameTrail.module('UserManagement').userID,
                    "created":      Date.now(),
                    "type":         protoData.type,
                    "src":          '',
                    "start":        protoData.start,
                    "end":          protoData.end,
                    "attributes":   protoData.attributes,
                    "position": {
                        "top":      protoData.position.top,
                        "left":     protoData.position.left,
                        "width":    30,
                        "height":   30
                    }
                }
            } else {
                newData = {
                    "name":         resourceDatabase[protoData.resourceId].name,
                    "creator":      FrameTrail.getState('username'),
                    "creatorId":    FrameTrail.module('UserManagement').userID,
                    "created":      Date.now(),
                    "type":         resourceDatabase[protoData.resourceId].type,
                    "src":          resourceDatabase[protoData.resourceId].src,
                    "thumb":        resourceDatabase[protoData.resourceId].thumb,
                    "start":        protoData.start,
                    "end":          protoData.end,
                    "resourceId":   protoData.resourceId,
                    "attributes":   resourceDatabase[protoData.resourceId].attributes,
                    "position": {
                        "top":      protoData.position.top,
                        "left":     protoData.position.left,
                        "width":    30,
                        "height":   30
                    }
                }
            }

            FrameTrail.module('Database').overlays.push(newData);
            newOverlay = FrameTrail.newObject('Overlay', newData)
            overlays.push(newOverlay);

            newUnsavedChange('overlays');

            return newOverlay;

    };

    /**
     * I create a new {{#crossLink "Videolink"}}video link{{/crossLink}}.
     *
     * I am called from {{#crossLink "VideolinksController/makeTimelineDroppable:method"}}VideolinksController{{/crossLink}}.
     *
     * @method newVideolink
     * @param {} protoData
     * @return Videolink
     */
    function newVideolink(protoData) {

        var newVideolink,

            newData = {
                            "name":         protoData.name,
                            "creator":      FrameTrail.getState('username'),
                            "creatorId":    FrameTrail.module('UserManagement').userID,
                            "created":      Date.now(),
                            "href":         protoData.href,
                            "start":        protoData.start,
                            "end":          protoData.end,
                            "attributes":   {}
                        };


            FrameTrail.module('Database').links.push(newData);
            newVideolink = FrameTrail.newObject('Videolink', newData)
            videolinks.push(newVideolink);

            newUnsavedChange('links');

            return newVideolink;

    };

    /**
     * I create a new {{#crossLink "CodeSnippet"}}code snippet{{/crossLink}}.
     *
     * I am called from {{#crossLink "CodeSnippetsController/makeTimelineDroppable:method"}}CodeSnippetsController{{/crossLink}}.
     *
     * @method newCodeSnippet
     * @param {} protoData
     * @return CodeSnippet
     */
    function newCodeSnippet(protoData) {

        var newCodeSnippet,

            newData = {
                            "name":         protoData.name,
                            "creator":      FrameTrail.getState('username'),
                            "creatorId":    FrameTrail.module('UserManagement').userID,
                            "created":      Date.now(),
                            "snippet":      protoData.snippet,
                            "start":        protoData.start,
                            "attributes":   {}
                        };


            FrameTrail.module('Database').codeSnippets.push(newData);
            newCodeSnippet = FrameTrail.newObject('CodeSnippet', newData)
            codeSnippets.push(newCodeSnippet);

            newUnsavedChange('codeSnippets');

            return newCodeSnippet;

    };


    /**
     * I create a new {{#crossLink "Annotation"}}annotation{{/crossLink}}.
     *
     * I am called from {{#crossLink "AnnotationsController/makeTimelineDroppable:method"}}AnnotationsController{{/crossLink}}.
     *
     * @method newAnnotation
     * @param {} protoData
     * @return Annotation
     */
    function newAnnotation(protoData) {

        var newAnnotation,
            database         = FrameTrail.module('Database'),
            resourceDatabase = database.resources,
            ownerId          = FrameTrail.module('UserManagement').userID,

            newData = {
                            "name":         resourceDatabase[protoData.resourceId].name,
                            "creator":      FrameTrail.getState('username'),
                            "creatorId":    FrameTrail.module('UserManagement').userID,
                            "created":      Date.now(),
                            "type":         resourceDatabase[protoData.resourceId].type,
                            "src":          resourceDatabase[protoData.resourceId].src,
                            "thumb":        resourceDatabase[protoData.resourceId].thumb,
                            "start":        protoData.start,
                            "end":          protoData.end,
                            "resourceId":   protoData.resourceId,
                            "attributes":   resourceDatabase[protoData.resourceId].attributes
                        };

            if (!database.annotations[ownerId]) {
                database.annotations[ownerId] = []
            }
            FrameTrail.module('Database').annotations[ownerId].push(newData);


            if (!annotationSets[ownerId]) {
                annotationSets[ownerId] = []
            }
            newAnnotation = FrameTrail.newObject('Annotation', newData);
            annotationSets[ownerId].push(newAnnotation);

            newUnsavedChange('annotations');

            return newAnnotation;

    };


    /**
     * When the {{#crossLinks "HypervideoModel/videolinks:attribute"}}attribute videolinks{{/crossLinks}} is accessed,
     * it needs to return the video link objects in an array, which is sorted by the start time. This is what I do.
     *
     * @method getVideolinks
     * @return Array of Videolinks
     * @private
     */
    function getVideolinks() {

        return videolinks.sort(function(a, b){

            if(a.data.start > b.data.start) {
                return 1;
            } else if(a.data.start < b.data.start) {
                return -1;
            } else {
                return 0;
            }

        });

    };


    /**
     * When the {{#crossLinks "HypervideoModel/codeSnippets:attribute"}}attribute codeSnippets{{/crossLinks}} is accessed,
     * it needs to return the code snippet objects in an array, which is sorted by the start time. This is what I do.
     *
     * @method getCodeSnippets
     * @return Array of CodeSnippets
     * @private
     */
    function getCodeSnippets() {

        return codeSnippets.sort(function(a, b){

            if(a.data.start > b.data.start) {
                return 1;
            } else if(a.data.start < b.data.start) {
                return -1;
            } else {
                return 0;
            }

        });

    };



    /**
     * Needed for the {{#crossLinks "HypervideoModel/annotationSets:attribute"}}annotationSets attribute{{/crossLinks}}.
     * This attribute' purpose is to tell, what users have an annotationfile for the current hypervideo.
     *
     * I return an array of maps in the format
     *
     *     [ { id: ownerid, name: ownerName }, ... ]
     *
     *
     * @method getAnnotationSets
     * @return Array of { id: ownerId, name: ownerName}
     * @private
     */
    function getAnnotationSets() {

        var database = FrameTrail.module('Database'),
            ids = [],
            ownerName,
            ownerColor,
            hypervideoIndexItem,
            annotationfileId;

        for (var ownerId in annotationSets) {

            annotationfileId    = database.annotationfileIDs[ownerId];
            hypervideoIndexItem = database.hypervideo.annotationfiles[annotationfileId];

            if (hypervideoIndexItem) {

                ownerName  = hypervideoIndexItem.owner;
                ownerColor = FrameTrail.module('Database').users[ownerId].color;

            } else if (ownerId === FrameTrail.module('UserManagement').userID) {

                ownerName  = FrameTrail.getState('username');
                ownerColor = FrameTrail.getState('userColor');

            } else {

                ownerName  = 'unknown';
                ownerColor = 'FFFFFF';

            }


            ids.push({
                id:      ownerId,
                name:    ownerName,
                color:   ownerColor
            });

        }

        return ids;

    };



    /**
     * When the {{#crossLinks "HypervideoModel/annotations:attribute"}}attribute annotations{{/crossLinks}} is accessed,
     * it needs to return an array of the currently selected annotation set (choosen by assigning the annotation's ownerId to {{#crossLinks "HypervideoModel/annotationSet:attribute"}}annotationSet{{/crossLinks}}).
     * The array needs to be sorted by the start time.
     *
     * @method getAnnotations
     * @return Array of Annotations
     * @private
     */
    function getAnnotations() {

        return annotationSets[selectedAnnotationSet].sort(function(a, b){

            if(a.data.start > b.data.start) {
                return 1;
            } else if(a.data.start < b.data.start) {
                return -1;
            } else {
                return 0;
            }

        });

    };



    /**
     * I am needed by the {{#crossLinks "HypervideoModel/annotationSet:attribute"}}annotationSet attribute{{/crossLinks}}.
     *
     * My parameter can be set in three ways:
     * * when the argument is null, I select the main annotation file (from the hypervideo's _index.json entry)
     * * when the special string '#myAnnotationSet' is given as argument, I select the logged-in user's ID
     * * an all other cases, I take the literal string as the ID to select.
     *
     * When my user changes the currently selected annotation sets, I have to assure, that both myself and the
     * {{#crossLinks "Database"}}Database{{/crossLinks}} have under the respective attribute name an [Array] present, for
     * manipulating annotation objects inside them.
     *
     * @method selectAnnotationSet
     * @param {String or null} anID
     * @return String
     * @private
     */
    function selectAnnotationSet(anID) {

        var database = FrameTrail.module('Database'),
            selectID;


        if (anID === null) {

            return selectedAnnotationSet = mainAnnotationSet;

        }


        if (anID === '#myAnnotationSet') {

            selectID = FrameTrail.module('UserManagement').userID;

        } else {

            selectID = anID;

        }


        if (!annotationSets.hasOwnProperty(selectID)) {

            annotationSets[selectID] = [];

        }

        if (!database.annotations.hasOwnProperty(selectID)) {

            database.annotations[selectID] = [];

        }

        return selectedAnnotationSet = selectID;

    };



    /**
     * When the {{#crossLinks "HypervideoModel/subtitles:attribute"}}attribute subtitles{{/crossLinks}} is accessed,
     * it needs to return an array of the currently selected language subtitles (choosen by assigning the selected language to {{#crossLinks "HypervideoModel/selectedLang:attribute"}}selectedLang{{/crossLinks}}).
     *
     * @method getSubtitles
     * @return Object containing the language label and an Array of Subtitles
     * @private
     */
    function getSubtitles() {

        return subtitles[selectedLang];

    };




    /**
     * I serve the purpose to set markers (both visually and in my data model),
     * in which categories (overlays, videolinks, annotations, codeSnippets) the user has unsaved changes.
     *
     * @method newUnsavedChange
     * @param {String} category
     */
    function newUnsavedChange(category) {

        if (category === 'overlays') {

            unsavedOverlays = true;

        } else if (category === 'links') {

            unsavedVideolinks = true;

        } else if (category === 'codeSnippets') {

            unsavedCodeSnippets = true;

        } else if (category === 'annotations') {

            unsavedAnnotations = true;

        }

        FrameTrail.module('Sidebar').newUnsavedChange(category);

        FrameTrail.changeState('unsavedChanges', true);

    }


    /**
     * I am the central function for saving changes back to the server.
     *
     * I save only, what is necessary (overlays, videolinks, annotations, codeSnippets).
     *
     * When all saving requests to the server have completed, I check all their responses.
     * If there where any errors I display them and abort. Otherwise I reset the
     * "unsavedChanges"-markers back to false and the
     * global state (FrameTrail.changeState('unsavedChanges', false)) and call the callback.
     *
     * Note: The second parameter is optional and should not be needed because the user
     * should already be logged in at this point (cancelCallback means, the user canceled the login).
     *
     * @method save
     * @param {Function} callback
     * @param {Function} callbackCancel
     */
    function save(callback, callbackCancel) {

        var saveRequests     = [],
            callbackReturns  = [],
            databaseCallback = function(result) {
                callbackReturns.push(result);
                if(callbackReturns.length === saveRequests.length){
                    saveFinished();
                }
            };


        FrameTrail.module('UserManagement').ensureAuthenticated(

            function(){

                FrameTrail.module('InterfaceModal').showStatusMessage('Saving...');

                if (unsavedOverlays) saveRequests.push(function(){
                    FrameTrail.module('Database').saveOverlays(databaseCallback);
                });

                if (unsavedVideolinks) saveRequests.push(function(){
                    FrameTrail.module('Database').saveLinks(databaseCallback);
                });

                if (unsavedCodeSnippets) saveRequests.push(function(){
                    FrameTrail.module('Database').saveCodeSnippets(databaseCallback);
                });

                if (unsavedAnnotations) saveRequests.push(function(){
                    FrameTrail.module('Database').saveAnnotations(databaseCallback);
                });
                
                for (var i in saveRequests) {
                    saveRequests[i].call();
                }

            },

            function(){
                if (callbackCancel) {
                    callbackCancel.call();
                }
            }

        );

        function saveFinished() {


            for (var result in callbackReturns) {

                if (result.failed) {
                    // to do: detailed error reporting to the user
                    FrameTrail.module('InterfaceModal').showErrorMessage('Error: Could not save data.');
                    return;
                }

            }

            FrameTrail.module('InterfaceModal').showSuccessMessage('Changes have been saved.');
            FrameTrail.module('InterfaceModal').hideMessage(2000);

            unsavedOverlays     = false;
            unsavedVideolinks   = false;
            unsavedCodeSnippets = false;
            unsavedAnnotations  = false;
            FrameTrail.changeState('unsavedChanges', false)

            if (callback) {
                callback.call();
            }

        };



    }


    /**
     * The global state "editMode" can be set to false, to trigger all modules to leave their edit mode.
     *
     * __However__, this global state should only be altered by me, because I check first if there were any unsaved changes,
     * and offer the user the possibility to save them.
     *
     * @method leaveEditMode
     * @param {Boolean} logoutAfterLeaving
     */
    function leaveEditMode(logoutAfterLeaving) {

        if (FrameTrail.getState('unsavedChanges')){

                var confirmDialog = $('<div id="ConfirmSaveChanges" title="Save changes?">'
                                    + '    <div class="message active">Your changes in the current video will be lost if you don\'t save them.</div>'
                                    + '    <p>Do you want to save your changes?</p>'
                                    + '</div>');

                confirmDialog.dialog({
                  resizable: false,
                  modal: true,
                  close: function() {
                    confirmDialog.remove();
                  },
                  buttons: {
                    'Yes': function() {

                        // TODO: Show saving indicator in dialog

                        save(function(){
                            FrameTrail.changeState('editMode', false);
                            confirmDialog.dialog('close');

                            if (logoutAfterLeaving) {
                                FrameTrail.module('UserManagement').logout();
                            }

                            window.location.reload();

                            if (logoutAfterLeaving) {
                                FrameTrail.module('UserManagement').logout();
                            }
                        });

                    },
                    'No, discard': function() {

                        FrameTrail.changeState('unsavedChanges', false);
                        confirmDialog.dialog('close');

                        if (logoutAfterLeaving) {
                            FrameTrail.module('UserManagement').logout();
                        }

                        window.location.reload();

                    },
                    Cancel: function() {
                      confirmDialog.dialog('close');
                    }
                  }
                });

        } else {

            FrameTrail.changeState('editMode', false);

            if (logoutAfterLeaving) {
                FrameTrail.module('UserManagement').logout();
            }

        }

    }



    /**
     * Reset & Update Hypervideo Data during runtime
     *
     * @method updateHypervideo
     * @param {String} newHypervideoID
     * @param {Boolean} restartEditMode
     * @param {Boolean} update
     */
    function updateHypervideo(newHypervideoID, restartEditMode, update) {

        FrameTrail.module('InterfaceModal').showStatusMessage('Loading ...');

        if ( FrameTrail.module('HypervideoController') ) {
            FrameTrail.module('HypervideoController').pause();
            FrameTrail.module('HypervideoController').clearIntervals();
        }
        
        //TODO: Implement proper destroy method
        $('#MainContainer #ViewVideo').remove();
        
        FrameTrail.module('RouteNavigation').hypervideoID = newHypervideoID;

        FrameTrail.module('Database').updateHypervideoData(function() {

            FrameTrail.initModule('ViewVideo');
            FrameTrail.initModule('HypervideoModel');
            FrameTrail.initModule('HypervideoController');

            FrameTrail.module('HypervideoModel').initModel(function(){


                FrameTrail.module('ViewVideo').create();

                FrameTrail.module('HypervideoController').initController(

                    function(){                                        
                        
                        FrameTrail.changeState('viewMode', 'video');
                        
                        if (restartEditMode) {
                            FrameTrail.changeState('editMode', 'preview');
                        }

                        FrameTrail.module('InterfaceModal').hideMessage(600);
                        
                    },

                    function(errorMsg){
                        FrameTrail.module('InterfaceModal').showErrorMessage(errorMsg);
                    },
                    update

                );

            }, function(errorMsg) {
                FrameTrail.module('InterfaceModal').showErrorMessage(errorMsg);
            });
            

        }, function() {
            console.log('FAIL');
        });

    }


    /**
     * YET TO IMPLEMENT
     *
     * Data exporting can be achieved in various ways.
     *
     * @method exportIt
     */
    function exportIt() {

        alert('The Export-Feature is currently being implemented. When finished, it will give you a handy ZIP file which includes a standalone version of your Hypervideo / entire Project.');

    }


    return {

        /**
         * Wether the current hypervideo has a playable html5 video source file,
         * or (otherwise) only has a duration (then we are in "Null Player" mode).
         * @attribute hasHTML5Video
         * @type Boolean
         * @readOnly
         */
        get hasHTML5Video()     { return hasHTML5Video   },


        /**
         * I contain a map to the .mp4 and .webm source's filenames.
         * @attribute sourceFiles
         * @readOnly
         * @type {}
         */
        get sourceFiles()       { return sourceFiles     },

        /**
         * The hypervideo's creator name
         * @type String
         * @attribute creator
         * @readOnly
         */
        get creator()           { return creator         },

        /**
         * The ID of the hypervideo's creator
         * @type String
         * @attribute creatorId
         * @readOnly
         */
        get creatorId()         { return creatorId       },

        /**
         * The hypervideo's creation date
         * @type Number
         * @attribute created
         * @readOnly
         */
        get created()           { return created         },

        /**
         * The hypervideo's date of latest change
         * @type Number
         * @attribute lastchanged
         * @readOnly
         */
        get lastchanged()       { return lastchanged     },

        /**
         * Whether the hypervideo is hidden in overview mode.
         * @type Boolean
         * @attribute hidden
         * @readOnly
         */
        get hidden()            { return hidden          },


        /**
         * Get or set the Array of subtitle files (if defined)
         * @attribute subtitleFiles
         * @param {Array} files
         */
        get subtitleFiles()         { return subtitleFiles          },
        set subtitleFiles(files)    { return subtitleFiles = files  },

        /**
         * The Array of subtitles (fetched via {{#crossLink "HypervideoModel/getSubtitles:method"}}getSubtitles(){{/crossLinks}}).
         * @attribute subtitles
         * @readOnly
         */
        get subtitles()         { return getSubtitles()       },

        /**
         * Get or set the subtitle language
         * @type String
         * @attribute lang
         * @param {String} lang
         */
        get selectedLang()          { return selectedLang        },
        set selectedLang(lang)      { return selectedLang = lang },

        /**
         * The overlays of the hypervideo
         * @type Array of Overlay
         * @attribute overlays
         * @readOnly
         */
        get overlays()          { return overlays        },

        /**
         * The videolinks of the hypervideo (fetched via {{#crossLink "HypervideoModel/getVideolinks:method"}}getVideolinks(){{/crossLinks}}).
         * @type Array of Videolink
         * @attribute videolinks
         * @readOnly
         */
        get videolinks()        { return getVideolinks() },

        /**
         * The codeSnippets of the hypervideo (fetched via {{#crossLink "HypervideoModel/getCodeSnippets:method"}}getCodeSnippets(){{/crossLinks}}).
         * @type Array of CodeSnippets
         * @attribute codeSnippets
         * @readOnly
         */
        get codeSnippets()        { return getCodeSnippets() },

        /**
         * The annotation sets of the hypervideo (fetched via {{#crossLink "HypervideoModel/getAnnotationSets:method"}}getAnnotationSets(){{/crossLinks}}).
         * @type Array of { id: String, name: String }
         * @attribute annotationSets
         * @readOnly
         */
        get annotationSets()    { return getAnnotationSets() },

        /**
         * The currently selected annotations of the hypervideo (fetched via {{#crossLink "HypervideoModel/getAnnotations:method"}}getAnnotations(){{/crossLinks}}).
         * @type Array of Annotation
         * @attribute annotations
         * @readOnly
         */
        get annotations()       { return getAnnotations() },

        /**
         * All annotations sets of the hypervideo in a map of userIDs to their respective annotation set.
         * @type Object of Array of Annotation
         * @attribute annotationAllSets
         */
        get annotationAllSets() { return annotationSets },

        /**
         * Get or set the hypervideo name
         * @type String
         * @attribute hypervideoName
         * @param {String} aString
         */
        get hypervideoName()         { return hypervideoName           },
        set hypervideoName(aString)  { return hypervideoName = aString },

        /**
         * Get or set the hypervideo descritption
         * @type String
         * @attribute description
         * @param {String} aString
         */
        get description()         { return description           },
        set description(aString)  { return description = aString },

        /**
         * The currently selected userID, to decide which annotations should be displayed (setting this attribute is done via {{#crossLink "HypervideoModel/selectAnnotationSet:method"}}selectAnnotationSet(){{/crossLinks}}).
         * @type Array of Annotation
         * @attribute annotationSet
         * @param {} anID
         */
        set annotationSet(anID) { return selectAnnotationSet(anID) },
        get annotationSet()     { return selectedAnnotationSet     },

        /**
         * The hypervideo's duration.
         *
         * This attribute must not be changed after the init process.
         * It is either set to the duration of the "null video" ({{#crossLink "HypervideoModel/initModel:method"}}HypervideoModel/initModel(){{/crossLinks}}) or
         * or after the video source file's meta data has loaded ({{#crossLink "HypervideoController/initController:method"}}HypervideoController/initController(){{/crossLinks}}).
         *
         * @attribute duration
         * @param {} aNumber
         */
        set duration(aNumber)   { return duration = aNumber },
        get duration()          { return duration           },



        initModel:             initModel,

        removeOverlay:         removeOverlay,
        newOverlay:            newOverlay,

        removeVideolink:       removeVideolink,
        newVideolink:          newVideolink,

        removeCodeSnippet:     removeCodeSnippet,
        newCodeSnippet:        newCodeSnippet,

        removeAnnotation:      removeAnnotation,
        newAnnotation:         newAnnotation,

        // Exception: this is exported to be able to update the subtitles on the fly
        initModelOfSubtitles:  initModelOfSubtitles,

        newUnsavedChange:      newUnsavedChange,

        save:                  save,
        leaveEditMode:         leaveEditMode,
        updateHypervideo:      updateHypervideo,
        exportIt:              exportIt

    }





});
