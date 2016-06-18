/**
 * @module Player
 */


/**
 * I am the Titlebar. I provide a place for a title text, and for two buttons (opening the 
 * {{#crossLink "Sidebar"}}Sidebar{{/crossLink}} and – YET TO IMPLEMENT – the social sharing widgets).
 *
 * @class Titlebar
 * @static
 */



FrameTrail.defineModule('Titlebar', function(){


    var domElement = $(   '<div id="Titlebar">'
                            + '  <div id="SidebarToggleWidget" class=""><button id="SidebarToggleButton">Sidebar</button></div>'
                            + '  <div id="TitlebarTitle"></div>'
                            + '  <div id="SharingWidget"><button id="SharingWidgetButton" data-tooltip-bottom-right="Share">Share</button></div>'
                            + '  <button id="LogoutButton" data-tooltip-bottom-right="Logout"></button>'
                            + '</div>'
                          );



    domElement.find('#SidebarToggleButton').click(function(){

        FrameTrail.changeState('sidebarOpen', ! FrameTrail.getState('sidebarOpen'));

    });



    domElement.find('#SharingWidgetButton').click(function(){

        alert('The Sharing-Feature is currently being implemented. When finished, it will show you an embed code, as well as a configurable link to this page. Just use the URL for now ;)');

    });

    domElement.find('#LogoutButton').click(function(){

        FrameTrail.module('HypervideoModel').leaveEditMode(true);
        
    });


    /**
     * I am called from {{#crossLink "Interface/create:method"}}Interface/create(){{/crossLink}}.
     *
     * I set up my interface elements.
     *
     * @method create
     */
    function create() {

        toggleSidebarOpen(FrameTrail.getState('sidebarOpen'));
        toogleUnsavedChanges(FrameTrail.getState('unsavedChanges'));
        
        if ( FrameTrail.getState('embed') ) {
            domElement.find('#SidebarToggleButton, #SharingWidgetButton').hide();
        }

        $('body').append(domElement)

    }


    
    /**
     * I make changes to my CSS, when the global state "sidebarOpen" changes.
     * @method toggleSidebarOpen
     * @param {Boolean} opened
     */
    function toggleSidebarOpen(opened) {

        if (opened) {

            domElement.addClass('sidebarOpen');
            domElement.find('#SidebarToggleWidget').addClass('sidebarActive');

        } else {

            domElement.removeClass('sidebarOpen');
            domElement.find('#SidebarToggleWidget').removeClass('sidebarActive');

        }

    }



    /**
     * I make changes to my CSS, when the global state "unsavedChanges" changes.
     * @method toogleUnsavedChanges
     * @param {Boolean} aBoolean
     */
    function toogleUnsavedChanges(aBoolean) {

        if(aBoolean){
            domElement.find('#SidebarToggleWidget').addClass('unsavedChanges');
        }else{
            domElement.find('#SidebarToggleWidget').removeClass('unsavedChanges');
        }
        
    }


    /**
     * I react to a change in the global state "editMode"
     * @method toggleEditMode
     * @param {String} editMode
     * @param {String} oldEditMode
     */
    function toggleEditMode(editMode, oldEditMode){

        if (editMode) {

            domElement.addClass('editActive');

        } else {

            domElement.removeClass('editActive');

        }

    }


    /**
     * I react to a change in the global state "loggedIn"
     * @method changeUserLogin
     * @param {Boolean} loggedIn
     */
    function changeUserLogin(loggedIn) {
        
        if (loggedIn) {
            
            domElement.find('#LogoutButton').show();

        } else {

            domElement.find('#LogoutButton').hide();

        }

    }


 

        
    return {

        onChange: {
            sidebarOpen:    toggleSidebarOpen,
            unsavedChanges: toogleUnsavedChanges,
            editMode:       toggleEditMode,
            loggedIn:       changeUserLogin
        },

        /**
         * I am the text, which should be shown in the title bar.
         * @attribute title
         * @type String
         * @writeOnly
         */
        set title(aString) {
            domElement.find('#TitlebarTitle').text(aString);
        },

        /**
         * I am the height of the title bar in pixel.
         * @attribute height
         * @type Number
         * @readOnly
         */
        get height() {
            return FrameTrail.getState('fullscreen') ? 0 : domElement.height();
        },

        create: create

    };


});