/**
 * @module ProjectManager
 */


/**
 * I am the ProjectCreator. I provide an interface where the user can input the settings for a new poject.
 * 
 * @class ProjectCreator
 * @static
 * @main
 */

 FrameTrail.defineModule('ProjectCreator', function(){


    /**
     * I am the sole method of my module. I bring up a jeryUI dialog where the settings for a new project can be entered.
     * 
     * @method newProject
     * @param {Function} success
     */
 	function newProject(success) {

	    var newDialog = $('<div id="NewProjectDialog" title="New Project">'
                        + '    <form id="NewProjectForm" method="post">'
                        + '        <div class="projectData">'
                        + '            <div>Project Settings:</div>'
                        + '            <input type="text" name="name" placeholder="Name of Project" value=""><br>'
                        + '            <textarea name="description" placeholder="Project Description"></textarea><br>'
                        + '            <div style="width: 280px;">Default user role:</div>'
                        + '            <input type="radio" name="defaultUserRole" id="user_role_admin" value="admin" '+((FrameTrail.module('ProjectsModel').defaultConfig.defaultUserRole == "admin") ? "checked" : "")+'>'
                        + '            <label for="user_role_admin">Admin</label>'
                        + '            <input type="radio" name="defaultUserRole" id="user_role_user" value="user" '+((FrameTrail.module('ProjectsModel').defaultConfig.defaultUserRole == "user") ? "checked" : "")+'>'
                        + '            <label for="user_role_user">User</label><br><br>'
                        + '            <div style="width: 280px;">Do registered users need to be confirmed by a project admin before they can login?</div>'
                        + '            <input type="checkbox" name="userNeedsConfirmation" id="user_confirmation" value="true" '+((FrameTrail.module('ProjectsModel').defaultConfig.userNeedsConfirmation.toString() == "true") ? "checked" : "")+'>'
                        + '            <label for="user_confirmation">only confirmed users</label><br><br>'
                        + '            <div style="width: 280px;">Should hypervideos in this project be hidden from other users by default?</div>'
                        + '            <input type="checkbox" name="defaultHypervideoHidden" id="hypervideo_hidden" value="true">'
                        + '            <label for="hypervideo_hidden">hidden</label>'
                        + '        </div>'
                        + '        <div class="hypervideoLayout">'
                        + '            <div>Default Player Layout:</div>'
                        + '            <div class="message active">Here you can set the default layout for hypervideos in this project. Users can override these settings when adding new hypervideos.<br> Click regions to activate / deactivate.</div>'
                        + '            <div class="settingsContainer">'
                        + '                <div class="layoutSettingsWrapper">'
                        + '                    <div data-config="videolinksVisible" class="">Videolinks'
                        + '                        <div data-config="annotationsPosition" class="active"></div>'
                        + '                    </div>'
                        + '                    <div class="playerWrapper">'
                        + '                        <div data-config="overlaysVisible" class="active">Overlays</div>'
                        + '                        <div data-config="annotationPreviewVisible" class="">Annotation-Preview</div>'
                        + '                    </div>'
                        + '                    <div data-config="annotationsVisible" class="active">Annotations'
                        + '                        <div data-config="annotationsPosition" class="active"></div>'
                        + '                    </div>'
                        + '                </div>'
                        + '                <div class="genericSettingsWrapper">Layout Mode'
                        + '                    <div data-config="slidingMode" class="">'
                        + '                        <div class="slidingMode" data-value="adjust">Adjust</div>'
                        + '                        <div class="slidingMode" data-value="overlay">Overlay</div>'
                        + '                    </div>'
                        + '                </div>'
                        + '            </div>'
                        + '        </div>'
                        + '        <div style="clear: both;"></div>'
                        + '        <div class="message error"></div>'
                        + '    </form>'
                        + '</div>');
        
        
        newDialog.find('.hypervideoLayout [data-config]').each(function() {
                    
            var tmpVal = '';

            if ( $(this).hasClass('active') ) {
                
                if ( $(this).attr('data-config') == 'slidingMode' ) {
                    tmpVal = 'overlay';
                } else if ( $(this).attr('data-config') == 'annotationsPosition' ) {
                    tmpVal = 'bottom'
                } else {
                    tmpVal = 'true';    
                }

            } else {
                
                if ( $(this).attr('data-config') == 'slidingMode' ) {
                    tmpVal = 'adjust';
                } else if ( $(this).attr('data-config') == 'annotationsPosition' ) {
                    tmpVal = 'top'
                } else {
                    tmpVal = 'false';    
                }

            }

            if ( !newDialog.find('.hypervideoLayout input[name="config['+$(this).attr('data-config')+']"]').length ) {
                newDialog.find('.hypervideoLayout').append('<input type="hidden" name="config['+$(this).attr('data-config')+']" value="'+tmpVal+'">');
            }

            if ( $(this).attr('data-config') == 'annotationsPosition' && !$(this).hasClass('active') ) {
                
                newDialog.find('.hypervideoLayout .playerWrapper')
                    .after(newDialog.find('div[data-config="videolinksVisible"]'))
                    .before(newDialog.find('div[data-config="annotationsVisible"]'));

            }

        }).click(function(evt) {


            var config      = $(evt.target).attr('data-config'),
                configState = $(evt.target).hasClass('active'),
                configValue = (configState ? 'false': 'true');

            if ( config != 'annotationsPosition' && config != 'slidingMode' ) {
            
                newDialog.find('[name="config['+config+']"]').val(configValue);
                $(evt.target).toggleClass('active');

            } else if ( config == 'slidingMode' ) {

                if ( configState ) {
                    
                    newDialog.find('[name="config['+config+']"]').val('adjust');

                } else {
                    
                    newDialog.find('[name="config['+config+']"]').val('overlay');

                }

                $(evt.target).toggleClass('active');

            } else if ( config == 'annotationsPosition' ) {

                if ( configState ) {
                    
                    newDialog.find('[name="config['+config+']"]').val('top');

                    newDialog.find('.hypervideoLayout .playerWrapper')
                        .after(newDialog.find('div[data-config="videolinksVisible"]'))
                        .before(newDialog.find('div[data-config="annotationsVisible"]'));

                } else {
                    
                    newDialog.find('[name="config['+config+']"]').val('bottom');

                    newDialog.find('.hypervideoLayout .playerWrapper')
                        .before(newDialog.find('div[data-config="videolinksVisible"]'))
                        .after(newDialog.find('div[data-config="annotationsVisible"]'));

                }

                newDialog.find('.hypervideoLayout [data-config="annotationsPosition"]').toggleClass('active');

            }

            evt.preventDefault();
            evt.stopPropagation();
        });

        
        
        
        newDialog.find('#NewProjectForm').ajaxForm({
            method:     'POST',
            url:        '../_server/ajaxServer.php',
            dataType:   'json',
            data: {'a': 'projectsNew'},
            success: function(response) {
                
                switch(response['code']) {
                    case 0:
                        newDialog.dialog('close');
                        success.call();
                        break;
                    default:
                        newDialog.dialog('widget').find('.message.error').addClass('active').html(response['string']);
                        break;
                }
            }
        });


        


        newDialog.dialog({
            modal: true,
            resizable: false,
            width:      725,
            height:     520,
            create: function() {
                newDialog.find('.message.error').appendTo($(this).dialog('widget').find('.ui-dialog-buttonpane'));
            },
            close: function() {
                $(this).dialog('close');
                $(this).remove();
            },
            buttons: [
                { text: 'Create Project',
                    click: function() {
                        $('#NewProjectForm').submit();
                    }
                },
                { text: 'Cancel',
                    click: function() {
                        $( this ).dialog( 'close' );
                    }
                }
            ]
        });

    }
    
    return {

    	newProject: newProject

    };

});