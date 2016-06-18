/**
 * @module Player
 */


/**
 * I am the Sidebar. I provide the basic navigation for the user interface.
 *
 * @class Sidebar
 * @static
 */



FrameTrail.defineModule('Sidebar', function(){


    

    var domElement  = $(      '<div id="Sidebar">'
                            + '    <div id="SidebarViewMode">'
                            + '        <button data-viewmode="overview">Overview</button>'
                            + '        <button data-viewmode="video">Player</button>'
                            + '    </div>'
                            + '    <div id="SidebarContainer">'
                            + '        <div data-viewmode="overview">'
                            + '            <div class="viewmodeInfo">'
                            + '                <span id="ProjectDescription"></span>'
                            + '            </div>'
                            + '            <div class="viewmodeControls">'
                            + '                <div class="viewModeActionButtonContainer">'
                            + '                    <button class="startEditButton" data-tooltip-left="Edit"></button>'
                            + '                    <button class="leaveEditModeButton" data-tooltip-left="Stop Editing"></button>'
                            + '                    <button class="exportButton" data-tooltip-left="Export Project"></button>'
                            + '                    <button class="userSettingsButton" data-tooltip-right="User Management"></button>'
                            + '                    <div style="clear: both;"></div>'
                            + '                </div>'
                            + '            </div>'
                            + '        </div>'
                            + '        <div data-viewmode="video">'
                            + '            <div class="viewmodeInfo">'
                            + '                <span id="VideoDescription"></span>'
                            + '            </div>'
                            + '            <div id="SelectAnnotationContainer" class="ui-front">'
                            + '                <div class="descriptionLabel">Annotations</div>'
                            + '                <select id="SelectAnnotation" name=""></select>'
                            + '                <div id="SelectAnnotationSingle"></div>'
                            + '            </div>'
                            + '            <div class="viewmodeControls">'
                            + '                <div class="viewModeActionButtonContainer">'
                            + '                    <button class="startEditButton" data-tooltip-left="Edit"></button>'
                            + '                    <button class="leaveEditModeButton" data-tooltip-left="Stop Editing"></button>'
                            + '                    <button class="saveButton" data-tooltip-left="Save changes"></button>'
                            + '                    <button class="exportButton" data-tooltip-left="Export Hypervideo"></button>'
                            + '                    <button class="userSettingsButton" data-tooltip-right="User Management"></button>'
                            + '                    <div style="clear: both;"></div>'
                            + '                </div>'
                            + '                <button class="editMode" data-editmode="preview">Preview</button>'
                            + '                <button class="editMode" data-editmode="links">Edit Video Links</button>'
                            + '                <button class="editMode" data-editmode="overlays">Edit Overlays</button>'
                            + '                <button class="editMode" data-editmode="codesnippets">Edit Custom Code</button>'
                            + '                <button class="editMode" data-editmode="annotations">My Annotations</button>'
                            + '            </div>'
                            + '        </div>'
                            + '    </div>'
                            + '    </div>'
                            + '</div>'
                        ),

        sidebarContainer       = domElement.find('#SidebarContainer'),
        overviewContainer      = sidebarContainer.children('[data-viewmode="overview"]'),
        videoContainer         = sidebarContainer.children('[data-viewmode="video"]'),
        videoContainerInfo     = videoContainer.children('.viewmodeInfo'),
        videoContainerControls = videoContainer.children('.viewmodeControls'),
        resourcesContainer     = sidebarContainer.children('[data-viewmode="resources"]'),

        SidebarViewMode        = domElement.find('#SidebarViewMode'),
        StartEditButton        = domElement.find('.startEditButton'),
        LeaveEditModeButton    = domElement.find('.leaveEditModeButton'),
        SaveButton             = domElement.find('.saveButton'),
        ExportButton           = domElement.find('.exportButton'),
        UserSettingsButton     = domElement.find('.userSettingsButton'),

        ProjectDescription     = sidebarContainer.find('#ProjectDescription'),
        VideoDescription       = sidebarContainer.find('#VideoDescription'),

        SelectAnnotationContainer       = domElement.find('#SelectAnnotationContainer');



    if (!FrameTrail.module('RouteNavigation').hypervideoID) {
        domElement.find('button[data-viewmode="video"]').hide();
    }

    SidebarViewMode.children().click(function(evt){
        FrameTrail.changeState('viewMode', ($(this).attr('data-viewmode')));
    });

    
    StartEditButton.click(function(){
        FrameTrail.module('UserManagement').ensureAuthenticated(
            function(){
                
                FrameTrail.changeState('editMode', 'preview');

            },
            function(){ /* Start edit mode canceled */ }
        );
    });

    LeaveEditModeButton.click(function(){
        FrameTrail.module('HypervideoModel').leaveEditMode();
    });

    SaveButton.click(function(){
        FrameTrail.module('HypervideoModel').save();
    });


    ExportButton.click(function(){
        FrameTrail.module('HypervideoModel').exportIt();
    });

    UserSettingsButton.click(function(){
        FrameTrail.module('UserManagement').showAdministrationBox();
    });
    
    /*
    CloneButton.click(function(){
        FrameTrail.module('HypervideoModel').clone();
    });
    */


    videoContainerControls.find('.editMode').click(function(evt){
        FrameTrail.changeState('editMode', ($(this).attr('data-editmode')));
    });

    
    

    /**
     * I am called from {{#crossLink "Interface/create:method"}}Interface/create(){{/crossLink}} and set up all my elements.
     * @method create
     */
    function create() {

        toggleSidebarOpen(FrameTrail.getState('sidebarOpen'));
        changeViewSize(FrameTrail.getState('viewSize'));
        toggleFullscreen(FrameTrail.getState('fullscreen'));
        toogleUnsavedChanges(FrameTrail.getState('unsavedChanges'));
        toggleViewMode(FrameTrail.getState('viewMode'));
        toggleEditMode(FrameTrail.getState('editMode'))

        $('body').append(domElement);

        // parse project description here in case we can't use the HypervideoController
        FrameTrail.module('Sidebar').ProjectDescription = FrameTrail.module('Database').project.description;


    };


    /**
     * I react to a change in the global state "sidebarOpen"
     * @method toggleSidebarOpen
     * @param {Boolean} opened
     */
    function toggleSidebarOpen(opened) {

        if (opened) {
            domElement.addClass('open');
        } else {
            domElement.removeClass('open');
        }

    };


    /**
     * I react to a change in the global state "viewSize"
     * @method changeViewSize
     * @param {Array} arrayWidthAndHeight
     */
    function changeViewSize(arrayWidthAndHeight) {

        var viewModeHeight          = SidebarViewMode.height(),
            controlsHeight          = domElement.find('#SidebarContainer > div.active > .viewmodeControls').height(),
            viewModeInfoHeight      = domElement.height() - FrameTrail.module('Titlebar').height - (viewModeHeight + controlsHeight),
            selectAnnotationsHeight = SelectAnnotationContainer.height();

        domElement.find('#SidebarContainer > div.active > .viewmodeInfo').css('max-height', viewModeInfoHeight - selectAnnotationsHeight - 40);

    };


    /**
     * I react to a change in the global state "fullscreen"
     * @method toggleFullscreen
     * @param {Boolean} aBoolean
     */
    function toggleFullscreen(aBoolean) {



    };


    /**
     * I react to a change in the global state "unsavedChanges"
     * @method toogleUnsavedChanges
     * @param {Boolean} aBoolean
     */
    function toogleUnsavedChanges(aBoolean) {

        if (aBoolean) {
            domElement.find('button[data-viewmode="video"]').addClass('unsavedChanges')
            SaveButton.addClass('unsavedChanges')
        } else {
            domElement.find('button[data-viewmode="video"]').removeClass('unsavedChanges')
            domElement.find('button.editMode').removeClass('unsavedChanges')
            SaveButton.removeClass('unsavedChanges')
        }
        
    };

    /**
     * I am called from the {{#crossLink "HypervideoModel/newUnsavedChange:method"}}HypervideoModel/newUnsavedChange(){{/crossLink}}.
     *
     * I mark the categories (overlays, videolinks, annotations, codeSnippets), which have unsaved changes inside them.
     *
     * @method newUnsavedChange
     * @param {String} category
     */
    function newUnsavedChange(category) {

        if (category == 'codeSnippets') {
            // camelCase not valid in attributes
            domElement.find('button[data-editmode="codesnippets"]').addClass('unsavedChanges');
        } else {
            domElement.find('button[data-editmode="'+category+'"]').addClass('unsavedChanges');
        }

    };



    /**
     * I react to a change in the global state "viewMode"
     * @method toggleViewMode
     * @param {String} viewMode
     */
    function toggleViewMode(viewMode) {

        if (FrameTrail.module('RouteNavigation').hypervideoID) {
            domElement.find('button[data-viewmode="video"]').show();
        }

        sidebarContainer.children().removeClass('active');

        SidebarViewMode.children().removeClass('active');

        domElement.find('[data-viewmode=' + viewMode + ']').addClass('active');

        changeViewSize();

    };

    /**
     * I react to a change in the global state "editMode"
     * @method toggleEditMode
     * @param {String} editMode
     * @param {String} oldEditMode
     */
    function toggleEditMode(editMode, oldEditMode){

        if (editMode) {

            domElement.addClass('editActive');

            if (oldEditMode === false) {

                StartEditButton.hide();
                ExportButton.hide();
                LeaveEditModeButton.show();
                SaveButton.show();

                videoContainerControls.find('.editMode').addClass('inEditMode');

            }

            videoContainerControls.find('.editMode').removeClass('active');

            videoContainerControls.find('[data-editmode="' + editMode + '"]').addClass('active');


        } else {

            domElement.removeClass('editActive');

            StartEditButton.show();

            // Hide Edit Button when not in a server environment
            if (!FrameTrail.module('RouteNavigation').environment.server) {
                StartEditButton.hide();
            }
            
            //ExportButton.show();
            LeaveEditModeButton.hide();
            SaveButton.hide();

            videoContainerControls.find('.editMode').removeClass('inEditMode');

        }

        changeViewSize();


    }


    /**
     * I react to a change in the global state "loggedIn"
     * @method changeUserLogin
     * @param {Boolean} loggedIn
     */
    function changeUserLogin(loggedIn) {

        if (loggedIn) {

            if ( FrameTrail.module('RouteNavigation').hypervideoID ) {
                if (FrameTrail.module('HypervideoModel').creatorId === FrameTrail.module('UserManagement').userID) {

                    videoContainerControls.find('.editMode').removeClass('disabled');

                } else {

                    videoContainerControls.find('.editMode[data-editmode="overlays"]').addClass('disabled');
                    videoContainerControls.find('.editMode[data-editmode="links"]').addClass('disabled');
                    videoContainerControls.find('.editMode[data-editmode="codesnippets"]').addClass('disabled');

                }
            }

            UserSettingsButton.show();

        } else {

            UserSettingsButton.hide();

        }

    }

    /**
     * I react to a change in the global state "userColor"
     * @method changeUserColor
     * @param {String} color
     */
    function changeUserColor(color) {

        if (color.length > 1) {

            /*
            // Too much color in the interface, keep default color for now
            UserSettingsButton.css({
                'border-color': '#' + FrameTrail.getState('userColor'),
                'background-color': '#' + FrameTrail.getState('userColor')
            });
            */

        }

    }




    return {

        create: create,

        onChange: {
            sidebarOpen:    toggleSidebarOpen,
            viewSize:       changeViewSize,
            fullscreen:     toggleFullscreen,
            unsavedChanges: toogleUnsavedChanges,
            viewMode:       toggleViewMode,
            editMode:       toggleEditMode,
            loggedIn:       changeUserLogin,
            userColor:      changeUserColor
        },

        SelectAnnotationContainer: SelectAnnotationContainer,
        newUnsavedChange: newUnsavedChange,

        /**
         * I am the width of the sidebar's DOM element.
         * @attribute width
         * @type Number
         * @readOnly
         */
        get width() { return domElement.width() },

        /**
         * I am the text which should be displayed in the "Overview" tab of the sidebar.
         * @attribute ProjectDescription
         * @type String
         * @writeOnly
         */
        set ProjectDescription(aString)   { return ProjectDescription.html(aString) },

        /**
         * I am the text which should be displayed in the "Video" tab of the sidebar.
         * @attribute VideoDescription
         * @type String
         * @writeOnly
         */
        set VideoDescription(aString)     { return VideoDescription.html(aString) }

    };

});