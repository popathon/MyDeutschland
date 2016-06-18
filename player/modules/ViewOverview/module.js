/**
 * @module Player
 */


/**
 * I am the ViewOverview
 *
 * @class ViewOverview
 * @static
 */


FrameTrail.defineModule('ViewOverview', function(){

    var domElement = $(    '<div id="ViewOverview">'
                        +  '    <div id="OverviewControls"></div>'
                        +  '    <div id="OverviewList"></div>'
                        +  '</div>'),

        OverviewControls = domElement.find('#OverviewControls'),
        OverviewList     = domElement.find('#OverviewList'),
        listWidthState;




    /**
     * Description
     * @method create
     * @return 
     */
    function create() {

        $('#MainContainer').append(domElement);

        toggleViewMode(FrameTrail.getState('viewMode'));
        toggleEditMode(FrameTrail.getState('editMode'));

        OverviewList.perfectScrollbar({
            wheelSpeed: 4,
            suppressScrollX: true,
            wheelPropagation: true
        });

    };

    
    /**
     * Description
     * @method showControls
     * @return 
     */
    function showControls() {

        OverviewControls.empty();

        var projectID = FrameTrail.module('RouteNavigation').projectID,
            newButton = $('<button id="NewHypervideoButton" data-tooltip-left-left="New Hypervideo"></button>')
                .click(function(evt) {

                    var newDialog = $('<div id="NewHypervideoDialog" title="New Hypervideo">'
                                    + '    <form id="NewHypervideoForm" method="post">'
                                    + '        <div class="hypervideoData">'
                                    + '            <div>Hypervideo Settings:</div>'
                                    + '            <input type="text" name="name" placeholder="Name of Hypervideo" value=""><br>'
                                    + '            <textarea name="description" placeholder="Description for Hypervideo"></textarea><br>'
                                    + '            <input type="checkbox" name="hidden" id="hypervideo_hidden" value="hidden" '+((FrameTrail.module('Database').project.defaultHypervideoHidden.toString() == "true") ? "checked" : "")+'>'
                                    + '            <label for="hypervideo_hidden">Hidden from other users?</label>'
                                    + '        </div>'
                                    + '        <div class="hypervideoLayout">'
                                    + '            <div>Player Layout:</div>'
                                    + '            <div class="settingsContainer">'
                                    + '                <div class="layoutSettingsWrapper">'
                                    + '                    <div data-config="videolinksVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['videolinksVisible'].toString() == 'true') ? 'active' : '') +'">Videolinks'
                                    + '                        <div data-config="annotationsPosition" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['annotationsPosition'].toString() == 'bottom') ? 'active' : '') +'"></div>'
                                    + '                    </div>'
                                    + '                    <div class="playerWrapper">'
                                    + '                        <div data-config="overlaysVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['overlaysVisible'].toString() == 'true') ? 'active' : '') +'">Overlays</div>'
                                    + '                        <div data-config="annotationPreviewVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['annotationPreviewVisible'].toString() == 'true') ? 'active' : '') +'">Annotation-Preview</div>'
                                    + '                    </div>'
                                    + '                    <div data-config="annotationsVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['annotationsVisible'].toString() == 'true') ? 'active' : '') +'">Annotations'
                                    + '                        <div data-config="annotationsPosition" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['annotationsPosition'].toString() == 'bottom') ? 'active' : '') +'"></div>'
                                    + '                    </div>'
                                    + '                </div>'
                                    + '                <div class="genericSettingsWrapper">Layout Mode'
                                    + '                    <div data-config="slidingMode" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['slidingMode'].toString() == 'overlay') ? 'active' : '') +'">'
                                    + '                        <div class="slidingMode" data-value="adjust">Adjust</div>'
                                    + '                        <div class="slidingMode" data-value="overlay">Overlay</div>'
                                    + '                    </div>'
                                    + '                </div>'
                                    + '            </div>'
                                    + '            <div class="subtitlesSettingsWrapper">'
                                    + '                <span>Subtitles</span>'
                                    + '                <button id="SubtitlesPlus" type="button">Add +</button>'
                                    + '                <div id="NewSubtitlesContainer"></div>'
                                    + '            </div>'
                                    + '        </div>'
                                    + '        <div style="clear: both;"></div>'
                                    + '        <div id="NewHypervideoTabs">'
                                    + '            <ul>'
                                    + '                <li><a href="#ChooseVideo">Choose Video</a></li>'
                                    + '                <li><a href="#EmptyVideo">Empty Video</a></li>'
                                    + '            </ul>'
                                    + '            <div id="ChooseVideo">'
                                    + '                <button type="button" id="UploadNewVideoResource">Upload new video</button>'
                                    + '                <div id="NewHypervideoDialogResources"></div>'
                                    + '                <input type="hidden" name="resourcesID">'
                                    + '            </div>'
                                    + '            <div id="EmptyVideo">'
                                    + '                <div class="message active">Please set a duration in seconds</div>'
                                    + '                <input type="text" name="duration" placeholder="duration">'
                                    + '            </div>'
                                    + '        </div>'
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

                    
                    // Manage Subtitles
                    newDialog.find('#SubtitlesPlus').on('click', function() {
                        var langOptions, languageSelect;

                        for (var lang in FrameTrail.module('Database').subtitlesLangMapping) {
                            langOptions += '<option value="'+ lang +'">'+ FrameTrail.module('Database').subtitlesLangMapping[lang] +'</option>';
                        }
                        
                        languageSelect =  '<select class="subtitlesTmpKeySetter">'
                                        + '    <option value="" disabled selected style="display:none;">Language</option>'
                                        + langOptions
                                        + '</select>';
                                        
                        newDialog.find('#NewSubtitlesContainer').append('<span class="subtitlesItem">'+ languageSelect +'<input type="file" name="subtitles[]"><button class="subtitlesRemove" type="button">x</button><br></span>');
                    });

                    newDialog.find('#NewSubtitlesContainer').on('click', '.subtitlesRemove', function(evt) {
                        $(this).parent().remove();
                    });

                    newDialog.find('#NewSubtitlesContainer').on('change', '.subtitlesTmpKeySetter', function() {
                        $(this).parent().find('input[type="file"]').attr('name', 'subtitles['+$(this).val()+']');
                    });



                    FrameTrail.module('ResourceManager').renderList(newDialog.find('#NewHypervideoDialogResources'), true,
                        FrameTrail.module('RouteNavigation').projectID,
                        'type',
                        'contains',
                        'video'
                    );

                    $('body').on('click.hypervideoAddResourcesItem', '.resourceThumb', function() {

                        newDialog.find('.resourceThumb').removeClass('selected');
                        $(this).addClass('selected');
                        newDialog.find('input[name="resourcesID"]').val($(this).data('resourceid'));

                    });

                    newDialog.find('#NewHypervideoTabs').tabs({
                        activate: function(event, ui) {
                            if ( ui.newPanel.attr('id') == 'EmptyVideo' ) {
                                newDialog.find('input[name="resourcesID"]').prop('disabled',true);
                                newDialog.find('input[name="duration"]').prop('disabled',false);
                                newDialog.find('.resourceThumb').removeClass('selected');
                            } else {
                                newDialog.find('input[name="resourcesID"]').prop('disabled',false);
                                newDialog.find('input[name="duration"]').prop('disabled',true);
                            }
                        }
                    });
                    
                    newDialog.find('#NewHypervideoForm').ajaxForm({
                        method:     'POST',
                        url:        '../_server/ajaxServer.php',
                        beforeSerialize: function() {
                            
                            // Subtitles Validation
                            newDialog.dialog('widget').find('.message.error').removeClass('active').html('');

                            var err = 0;
                            newDialog.find('.subtitlesItem').each(function() {
                                $(this).css({'outline': ''});

                                if (($(this).find('input[type="file"]:first').attr('name') == 'subtitles[]') || ($(this).find('.subtitlesTmpKeySetter').first().val() == '') || ($(this).find('input[type="file"]:first').val().length == 0)) {
                                    $(this).css({'outline': '1px solid #cd0a0a'});
                                    newDialog.dialog('widget').find('.message.error').addClass('active').html('Subtitles Error: Please fill in all fields.');
                                    err++;
                                } else if ( !(new RegExp('(' + ['.vtt'].join('|').replace(/\./g, '\\.') + ')$')).test($(this).find('input[type="file"]:first').val()) ) {
                                    $(this).css({'outline': '1px solid #cd0a0a'});
                                    newDialog.dialog('widget').find('.message.error').addClass('active').html('Subtitles Error: Wrong format. Please add only .vtt files.');
                                    err++;
                                }

                                if (newDialog.find('.subtitlesItem input[type="file"][name="subtitles['+ $(this).find('.subtitlesTmpKeySetter:first').val() +']"]').length > 1 ) {
                                    newDialog.dialog('widget').find('.message.error').addClass('active').html('Subtitles Error: Please make sure you assign languages only once.');
                                    return false;
                                }

                            });
                            if (err > 0) {
                                return false;
                            }

                        },
                        dataType:   'json',
                        data: {'a': 'hypervideoAdd', 'projectID':projectID},
                        success: function(response) {
                            switch(response['code']) {
                                case 0:
                                    newDialog.dialog('close');
                                    FrameTrail.module('Database').loadHypervideoData(
                                        function(){
                                            initList();
                                        },
                                        function(){}
                                    );
                                    break;
                                default:
                                    newDialog.dialog('widget').find('.message.error').addClass('active').html(response['string']);
                                    break;
                            }
                        }
                    });


                    newDialog.find('#UploadNewVideoResource').click(function(){

                        FrameTrail.module('ResourceManager').uploadResource(function(){
                            
                            var NewHypervideoDialogResources = newDialog.find('#NewHypervideoDialogResources');
                            NewHypervideoDialogResources.empty();

                            FrameTrail.module('ResourceManager').renderList(NewHypervideoDialogResources, true,
                                FrameTrail.module('RouteNavigation').projectID,
                                'type',
                                'contains',
                                'video'
                            );

                        }, true);

                    })


                    newDialog.dialog({
                        modal: true,
                        resizable: false,
                        width:      725,
                        height:     500,
                        create: function() {
                            newDialog.find('.message.error').appendTo($(this).dialog('widget').find('.ui-dialog-buttonpane'));
                        },
                        close: function() {
                            $('body').off('click.hypervideoAddResourcesItem');
                            $(this).dialog('close');
                            $(this).remove();
                        },
                        buttons: [
                            { text: 'Add Hypervideo',
                                click: function() {
                                    $('#NewHypervideoForm').submit();
                                }
                            },
                            { text: 'Cancel',
                                click: function() {
                                    $( this ).dialog( 'close' );
                                }
                            }
                        ]
                    });

                }),
            
            manageResourcesButton = $('<button id="ManageResourcesButton" class="resourceManagerIcon" data-tooltip-left-left="Manage Resources"></button>')
                    .click(function() {
                        FrameTrail.module('ViewResources').open();
                    });


        OverviewControls.append(newButton, manageResourcesButton);

        OverviewControls.show();

    };


    /**
     * Description
     * @method initList
     * @return 
     */
    function initList() {

        var hypervideos = FrameTrail.module('Database').hypervideos,
            hypervideo,
            thumb,
            owner,
            admin = FrameTrail.module('UserManagement').userRole === 'admin',
            projectID = FrameTrail.module('RouteNavigation').projectID,
            editMode = FrameTrail.getState('editMode');
            userColor = FrameTrail.getState('userColor');

        OverviewList.find('.hypervideoThumb').remove();

        for (var id in hypervideos) {

            owner = hypervideos[id].creatorId === FrameTrail.module('UserManagement').userID;

            
            if ( !hypervideos[id].hidden || owner || admin ) {

                hypervideo = FrameTrail.newObject('Hypervideo', hypervideos[id])

                thumb = hypervideo.renderThumb();

                
                if ( (admin || owner) && editMode ) {

                    var hypervideoOptions = $('<div class="hypervideoOptions"></div>');

                    // Delete Hypervideo

                    var deleteButton = $('<button class="deleteButton" data-tooltip-bottom-right="Delete Hypervideo"></button>')
                        .click(function(evt) {
                            
                            evt.preventDefault();
                            evt.stopPropagation();

                            thisID = $(evt.target).parents('.hypervideoThumb').data('hypervideoid');

                            var deleteDialog = $('<div id="DeleteHypervideoDialog" title="Delete Hypervideo">'
                                               + '<div>Do you really want to delete the this Hypervideo?</div>'
                                               + '    <input id="thisHypervideoName" type="text" value="'+ hypervideos[thisID]['name'] +'" readonly>'
                                               + '    <div class="message active">Please paste / re-enter the name:</div>'
                                               + '    <form method="POST" id="DeleteHypervideoForm">'
                                               + '        <input type="text" name="hypervideoName" placeholder="Name of Hypervideo"><br>'
                                               + '        <div class="message error"></div>'
                                               + '    </form>'
                                               + '</div>');

                            
                            deleteDialog.find('#DeleteHypervideoForm').ajaxForm({
                                method:     'POST',
                                url:        '../_server/ajaxServer.php',
                                dataType:   'json',
                                thisID: thisID,
                                data: {a: 'hypervideoDelete', projectID: projectID, hypervideoID: thisID},
                                success: function(response) {
                                    switch(response['code']) {
                                        case 0:
                                            // TODO: find a nice way to remove Element of deleted Hypervideo from Overview List
                                            deleteDialog.dialog('close');
                                            $('#OverviewList div[data-hypervideoid="'+thisID+'"]').remove();
                                            
                                            // Redirect to Overview when current Hypervideo has been deleted
                                            if ( thisID == FrameTrail.module('RouteNavigation').hypervideoID ) {
                                                alert('You deleted the current Hypervideo and will be redirected to the Overview.')
                                                window.location.search = '?project=' + projectID;
                                            }

                                        break;
                                        case 1:
                                            deleteDialog.find('.message.error').addClass('active').html('Not logged in');
                                        break;
                                        case 2:
                                            deleteDialog.find('.message.error').addClass('active').html('User not active');
                                        break;
                                        case 3:
                                            deleteDialog.find('.message.error').addClass('active').html('Could not find the projects hypervideosID folder');
                                        break;
                                        case 4:
                                            deleteDialog.find('.message.error').addClass('active').html('hypervideoID could not be found in database.');
                                        break;
                                        case 5:
                                            deleteDialog.find('.message.error').addClass('active').html('hypervideoName is not correct.');
                                        break;
                                        case 6:
                                            //TODO push nice texts into error box.
                                            deleteDialog.find('.message.error').addClass('active').html('permission denied! The User is not an admin, nor is it his own hypervideo.');
                                        break;
                                    }
                                }
                            });
                            
                            deleteDialog.dialog({
                                    modal: true,
                                    resizable: false,
                                    open: function() {
                                        deleteDialog.find('#thisHypervideoName').focus().select();
                                    },
                                    close: function() {
                                        $(this).dialog('close');
                                        $(this).remove();
                                    },
                                    buttons: [
                                        { text: 'Delete Hypervideo',
                                            click: function() {
                                                $('#DeleteHypervideoForm').submit();
                                            }
                                        },
                                        { text: 'Cancel',
                                            click: function() {
                                                $( this ).dialog( 'close' );
                                            }
                                        }
                                    ]
                                });

                        });

                    deleteButton.appendTo(hypervideoOptions);

                    // Show Options Hypervideo

                    var optionButton = $('<button class="optionButton" data-tooltip-bottom-right="Hypervideo Options"></button>')
                        .click(function(evt) {
                            
                            evt.preventDefault();
                            evt.stopPropagation();

                            thisID = $(evt.target).parents('.hypervideoThumb').data('hypervideoid');

                            var optionDialog = $('<div id="EditHypervideoDialog" title="Hypervideo Options">'
                                             + '    <form method="POST" id="EditHypervideoForm">'
                                             + '        <div class="hypervideoData">'
                                             + '            <div>Hypervideo Settings:</div>'
                                             + '            <input type="text" name="name" placeholder="Name of Hypervideo" value="'+hypervideos[thisID]["name"]+'"><br>'
                                             + '            <textarea name="description" placeholder="Description for Hypervideo">'+hypervideos[thisID]["description"]+'</textarea><br>'
                                             + '            <input type="checkbox" name="hidden" id="hypervideo_hidden" value="hidden" '+((hypervideos[thisID]["hidden"].toString() == "true") ? "checked" : "")+'>'
                                             + '            <label for="hypervideo_hidden">Hidden from other users?</label>'
                                             + '        </div>'
                                             + '        <div class="hypervideoLayout">'
                                             + '            <div>Player Layout:</div>'
                                             + '            <div class="settingsContainer">'
                                             + '                <div class="layoutSettingsWrapper">'
                                             + '                    <div data-config="videolinksVisible" class="'+ ((hypervideos[thisID]['config']['videolinksVisible'].toString() == 'true') ? 'active' : '') +'">Videolinks'
                                             + '                        <div data-config="annotationsPosition" class="'+ ((hypervideos[thisID]['config']['annotationsPosition'].toString() == 'bottom') ? 'active' : '') +'"></div>'
                                             + '                    </div>'
                                             + '                    <div class="playerWrapper">'
                                             + '                        <div data-config="overlaysVisible" class="'+ ((hypervideos[thisID]['config']['overlaysVisible'].toString() == 'true') ? 'active' : '') +'">Overlays</div>'
                                             + '                        <div data-config="annotationPreviewVisible" class="'+ ((hypervideos[thisID]['config']['annotationPreviewVisible'].toString() == 'true') ? 'active' : '') +'">Annotation-Preview</div>'
                                             + '                    </div>'
                                             + '                    <div data-config="annotationsVisible" class="'+ ((hypervideos[thisID]['config']['annotationsVisible'].toString() == 'true') ? 'active' : '') +'">Annotations'
                                             + '                        <div data-config="annotationsPosition" class="'+ ((hypervideos[thisID]['config']['annotationsPosition'].toString() == 'bottom') ? 'active' : '') +'"></div>'
                                             + '                    </div>'
                                             + '                </div>'
                                             + '                <div class="genericSettingsWrapper">Layout Mode'
                                             + '                    <div data-config="slidingMode" class="'+ ((hypervideos[thisID]['config']['slidingMode'].toString() == 'overlay') ? 'active' : '') +'">'
                                             + '                        <div class="slidingMode" data-value="adjust">Adjust</div>'
                                             + '                        <div class="slidingMode" data-value="overlay">Overlay</div>'
                                             + '                    </div>'
                                             + '                </div>'
                                             + '            </div>'
                                             + '            <div class="subtitlesSettingsWrapper">'
                                             + '                <span>Subtitles</span>'
                                             + '                <button id="SubtitlesPlus" type="button">Add +</button>'
                                             + '                <div id="ExistingSubtitlesContainer"></div>'
                                             + '                <div id="NewSubtitlesContainer"></div>'
                                             + '            </div>'
                                             + '        </div>'
                                             + '        <div style="clear: both;"></div>'
                                             + '        <div class="message error"></div>'
                                             + '    </form>'
                                             + '</div>');
                            
                            
                            if ( hypervideos[thisID].subtitles ) {
                                
                                var langMapping = FrameTrail.module('Database').subtitlesLangMapping;

                                for (var i=0; i < hypervideos[thisID].subtitles.length; i++) {
                                    var currentSubtitles = hypervideos[thisID].subtitles[i],
                                        existingSubtitlesItem = $('<div class="existingSubtitlesItem"><span>'+ langMapping[hypervideos[thisID].subtitles[i].srclang] +'</span></div>'),
                                        existingSubtitlesDelete = $('<button class="subtitlesDelete" type="button" data-lang="'+ hypervideos[thisID].subtitles[i].srclang +'">Delete</button>');

                                    existingSubtitlesDelete.click(function(evt) {
                                        $(this).parent().remove();
                                        optionDialog.find('.subtitlesSettingsWrapper').append('<input type="hidden" name="SubtitlesToDelete[]" value="'+ $(this).attr('data-lang') +'">');
                                    }).appendTo(existingSubtitlesItem);
                                    
                                    optionDialog.find('#ExistingSubtitlesContainer').append(existingSubtitlesItem);
                                }
                            }

                            optionDialog.find('.hypervideoLayout [data-config]').each(function() {
                                
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

                                if ( !optionDialog.find('.hypervideoLayout input[name="config['+$(this).attr('data-config')+']"]').length ) {
                                    optionDialog.find('.hypervideoLayout').append('<input type="hidden" name="config['+$(this).attr('data-config')+']" data-configkey="'+ $(this).attr('data-config') +'" value="'+tmpVal+'">');
                                }

                                if ( $(this).attr('data-config') == 'annotationsPosition' && !$(this).hasClass('active') ) {
                                    
                                    optionDialog.find('.hypervideoLayout .playerWrapper')
                                        .after(optionDialog.find('div[data-config="videolinksVisible"]'))
                                        .before(optionDialog.find('div[data-config="annotationsVisible"]'));

                                }

                            }).click(function(evt) {


                                var config      = $(evt.target).attr('data-config'),
                                    configState = $(evt.target).hasClass('active'),
                                    configValue = (configState ? 'false': 'true');

                                if ( config != 'annotationsPosition' && config != 'slidingMode' ) {
                                
                                    optionDialog.find('[name="config['+config+']"]').val(configValue);
                                    $(evt.target).toggleClass('active');
                                    
                                } else if ( config == 'slidingMode' ) {

                                    if ( configState ) {
                                        
                                        optionDialog.find('[name="config['+config+']"]').val('adjust');
                                        
                                    } else {
                                        
                                        optionDialog.find('[name="config['+config+']"]').val('overlay');
                                        
                                    }

                                    $(evt.target).toggleClass('active');

                                } else if ( config == 'annotationsPosition' ) {

                                    if ( configState ) {
                                        
                                        optionDialog.find('[name="config['+config+']"]').val('top');

                                        optionDialog.find('.hypervideoLayout .playerWrapper')
                                            .after(optionDialog.find('div[data-config="videolinksVisible"]'))
                                            .before(optionDialog.find('div[data-config="annotationsVisible"]'));

                                    } else {
                                        
                                        optionDialog.find('[name="config['+config+']"]').val('bottom');

                                        optionDialog.find('.hypervideoLayout .playerWrapper')
                                            .before(optionDialog.find('div[data-config="videolinksVisible"]'))
                                            .after(optionDialog.find('div[data-config="annotationsVisible"]'));

                                    }

                                    optionDialog.find('.hypervideoLayout [data-config="annotationsPosition"]').toggleClass('active');

                                }

                                evt.preventDefault();
                                evt.stopPropagation();
                            });

                            // Manage Subtitles
                            optionDialog.find('#SubtitlesPlus').on('click', function() {
                                var langOptions, languageSelect;

                                for (var lang in FrameTrail.module('Database').subtitlesLangMapping) {
                                    langOptions += '<option value="'+ lang +'">'+ FrameTrail.module('Database').subtitlesLangMapping[lang] +'</option>';
                                }
                                
                                languageSelect =  '<select class="subtitlesTmpKeySetter">'
                                                + '    <option value="" disabled selected style="display:none;">Language</option>'
                                                + langOptions
                                                + '</select>';

                                optionDialog.find('#NewSubtitlesContainer').append('<span class="subtitlesItem">'+ languageSelect +'<input type="file" name="subtitles[]"><button class="subtitlesRemove" type="button">x</button><br></span>');
                            });

                            optionDialog.find('#NewSubtitlesContainer').on('click', '.subtitlesRemove', function(evt) {
                                $(this).parent().remove();
                            });

                            optionDialog.find('#NewSubtitlesContainer').on('change', '.subtitlesTmpKeySetter', function() {
                                $(this).parent().find('input[type="file"]').attr('name', 'subtitles['+$(this).val()+']');
                            });


                            optionDialog.find('#EditHypervideoForm').ajaxForm({
                                method:     'POST',
                                url:        '../_server/ajaxServer.php',
                                /*
                                beforeSubmit: function(data) {
                                    console.log(data);
                                    return false;
                                },
                                */
                                beforeSerialize: function(form, options) {
                                    
                                    // Subtitles Validation

                                    optionDialog.find('.message.error').removeClass('active').html('');

                                    var err = 0;
                                    optionDialog.find('.subtitlesItem').each(function() {
                                        $(this).css({'outline': ''});

                                        if (($(this).find('input[type="file"]:first').attr('name') == 'subtitles[]') || ($(this).find('.subtitlesTmpKeySetter').first().val() == '') 
                                                || ($(this).find('input[type="file"]:first').val().length == 0)) {
                                            $(this).css({'outline': '1px solid #cd0a0a'});
                                            optionDialog.find('.message.error').addClass('active').html('Subtitles Error: Please fill in all fields.');
                                            err++;
                                        } else if ( !(new RegExp('(' + ['.vtt'].join('|').replace(/\./g, '\\.') + ')$')).test($(this).find('input[type="file"]:first').val()) ) {
                                            $(this).css({'outline': '1px solid #cd0a0a'});
                                            optionDialog.find('.message.error').addClass('active').html('Subtitles Error: Wrong format. Please add only .vtt files.');
                                            err++;
                                        }

                                        if (optionDialog.find('.subtitlesItem input[type="file"][name="subtitles['+ $(this).find('.subtitlesTmpKeySetter:first').val() +']"]').length > 1 
                                                || (optionDialog.find('.existingSubtitlesItem .subtitlesDelete[data-lang="'+ $(this).find('.subtitlesTmpKeySetter:first').val() +'"]').length > 0 ) ) {
                                            optionDialog.find('.message.error').addClass('active').html('Subtitles Error: Please make sure you assign languages only once.');
                                            return false;
                                        }
                                    });
                                    if (err > 0) {
                                        return false;
                                    }

                                },
                                dataType:   'json',
                                thisID: thisID,
                                data: {'a': 'hypervideoChange', 'projectID':projectID, 'hypervideoID': thisID},
                                success: function(response) {
                                    
                                    switch(response['code']) {
                                        case 0:
                                            
                                            //TODO: Put in separate method
                                            FrameTrail.module('Database').loadHypervideoData(
                                                function(){

                                                    if ( thisID == FrameTrail.module('RouteNavigation').hypervideoID ) {
                                                        
                                                        FrameTrail.module('Database').hypervideo = FrameTrail.module('Database').hypervideos[thisID];

                                                        // if current hypervideo is edited, adjust states
                                                        optionDialog.find('.hypervideoLayout input').each(function() {
                                                            
                                                            var state = 'hv_config_'+ $(this).attr('data-configkey'),
                                                                val   = $(this).val();
                                                            
                                                            if ( val == 'true' ) {
                                                                val = true;
                                                            } else if ( val == 'false' ) {
                                                                val = false;
                                                            }

                                                            FrameTrail.changeState(state, val);

                                                        });

                                                        var name = optionDialog.find('input[name="name"]').val(),
                                                            description = optionDialog.find('textarea[name="description"]').val();

                                                        FrameTrail.module('HypervideoModel').hypervideoName = name;
                                                        FrameTrail.module('HypervideoModel').description = description;

                                                        FrameTrail.module('HypervideoController').updateDescriptions();

                                                        // re-init subtitles
                                                        FrameTrail.module('Database').loadSubtitleData(
                                                            function() {
                                                                
                                                                initList();

                                                                FrameTrail.module('HypervideoModel').subtitleFiles = FrameTrail.module('Database').hypervideo.subtitles;
                                                                FrameTrail.module('HypervideoModel').initModelOfSubtitles(FrameTrail.module('Database'));
                                                                FrameTrail.module('SubtitlesController').initController();
                                                                FrameTrail.changeState('hv_config_captionsVisible', false);

                                                                optionDialog.dialog('close');


                                                            },
                                                            function() {}
                                                        );

                                                    } else {
                                                        initList();
                                                        optionDialog.dialog('close');
                                                    }
                                                    
                                                },
                                                function(){
                                                    optionDialog.find('.message.error').addClass('active').html('Error while updating hypervideo data');
                                                }
                                            );
                                            
                                            break;
                                        default:
                                            optionDialog.find('.message.error').addClass('active').html('Error: '+ response['string']);
                                            break;
                                    }
                                }
                            });

                            optionDialog.dialog({
                                modal: true,
                                resizable: false,
                                width: 550,
                                close: function() {
                                    $(this).dialog('close');
                                    $(this).remove();
                                },
                                buttons: [
                                    { text: 'Save changes',
                                        click: function() {
                                            $('#EditHypervideoForm').submit();
                                        }
                                    },
                                    { text: 'Cancel',
                                        click: function() {
                                            $( this ).dialog( 'close' );
                                        }
                                    }
                                ]
                            });

                        });

                    optionButton.appendTo(hypervideoOptions);


                    // Edit Hypervideo

                    var editButton = $('<button class="editButton" data-tooltip-bottom-right="Edit Hypervideo"></button>')
                        .click(function(evt) {
                            
                            thumb.click();

                        });

                    editButton.appendTo(hypervideoOptions);


                    // Fork Hypervideo

                    var forkButton = $('<button class="forkButton" data-tooltip-bottom-right="Fork Hypervideo"></button>')
                        .click(function(evt) {
                            
                            evt.preventDefault();
                            evt.stopPropagation();

                            thisID = $(evt.target).parents('.hypervideoThumb').data('hypervideoid');

                            var forkDialog = $('<div id="ForkHypervideoDialog" title="Fork Hypervideo">'
                                             + '    <div class="message active">By forking a hypervideo, you create a copy for yourself that you are able to edit.</div>'
                                             + '    <form method="POST" id="ForkHypervideoForm">'
                                             + '        <input type="text" name="name" placeholder="Name of new Hypervideo" value="'+hypervideos[thisID]["name"]+'"><br>'
                                             + '        <textarea name="description" placeholder="Description for new Hypervideo">'+hypervideos[thisID]["description"]+'</textarea><br>'
                                             + '        <div class="message error"></div>'
                                             + '    </form>'
                                             + '</div>');

                            forkDialog.find('#ForkHypervideoForm').ajaxForm({
                                method:     'POST',
                                url:        '../_server/ajaxServer.php',
                                dataType:   'json',
                                thisID: thisID,
                                data: {'a': 'hypervideoClone', 'projectID':projectID, 'hypervideoID': thisID},
                                success: function(response) {
                                    switch(response['code']) {
                                        case 0:
                                            // TODO: UPDATE LIST / HYPERVIDEO OBJECT IN CLIENT! @Michi
                                            forkDialog.dialog('close');
                                            FrameTrail.module('Database').loadHypervideoData(
                                                function(){
                                                    initList();
                                                    //$('#OverviewList div[data-hypervideoid='"+thisID+"']').highlight();
                                                },
                                                function(){}
                                            );
                                            
                                            break;
                                        default:
                                            //TODO: push nice error texts into error box.
                                            forkDialog.find('.message.error').addClass('active').html('Fatal error!');
                                            break;
                                    }
                                }
                            });

                            forkDialog.dialog({
                                modal: true,
                                resizable: false,
                                close: function() {
                                    $(this).dialog('close');
                                    $(this).remove();
                                },
                                buttons: [
                                    { text: 'Fork Hypervideo',
                                        click: function() {
                                            $('#ForkHypervideoForm').submit();
                                        }
                                    },
                                    { text: 'Cancel',
                                        click: function() {
                                            $( this ).dialog( 'close' );
                                        }
                                    }
                                ]
                            });

                        });


                    forkButton.appendTo(hypervideoOptions);

                    thumb.append(hypervideoOptions);

                }
                
                /*
                if (owner && editMode ) {
                    
                    thumb.addClass('owner').css('border-color', '#' + userColor);

                }
                */

                if ( thumb.attr('data-hypervideoid') == FrameTrail.module('RouteNavigation').hypervideoID ) {
                    thumb.addClass('activeHypervideo');
                }
                
                thumb.css('transition-duration', '0ms');

                // open hypervideo without reloading the page
                thumb.click(function(evt) {

                    // prevent opening href location
                    evt.preventDefault();
                    evt.stopPropagation();

                    var newHypervideoID = $(this).attr('data-hypervideoid'),
                        update = (FrameTrail.module('RouteNavigation').hypervideoID == undefined) ? false : true;


                    //TODO: PUT IN SEPARATE FUNCTION 

                    if ( FrameTrail.module('RouteNavigation').hypervideoID == newHypervideoID ) {

                        FrameTrail.changeState('viewMode', 'video');

                    } else {

                        if ( FrameTrail.getState('editMode') && FrameTrail.getState('unsavedChanges') ) {

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

                                    FrameTrail.module('HypervideoModel').save(function(){
                                        
                                        history.pushState({
                                            editMode: FrameTrail.getState('editMode')
                                        }, "", "?project=" + FrameTrail.module('RouteNavigation').projectID + "&hypervideo=" + newHypervideoID);
                                        
                                        FrameTrail.changeState('editMode', false);

                                        confirmDialog.dialog('close');

                                        OverviewList.find('.hypervideoThumb.activeHypervideo').removeClass('activeHypervideo');
                                        OverviewList.find('.hypervideoThumb[data-hypervideoid="'+ newHypervideoID +'"]').addClass('activeHypervideo');

                                        FrameTrail.module('HypervideoModel').updateHypervideo(newHypervideoID, true, update);

                                    });

                                },
                                'No, discard': function() {

                                    FrameTrail.changeState('unsavedChanges', false);
                                    
                                    confirmDialog.dialog('close');

                                    // TODO: Reload new hypervideo
                                    window.location.reload();

                                },
                                Cancel: function() {
                                  confirmDialog.dialog('close');
                                }
                              }
                            });



                        } else {

                            OverviewList.find('.hypervideoThumb.activeHypervideo').removeClass('activeHypervideo');
                            OverviewList.find('.hypervideoThumb[data-hypervideoid="'+ newHypervideoID +'"]').addClass('activeHypervideo');

                            history.pushState({
                                editMode: FrameTrail.getState('editMode')
                            }, "", "?project=" + FrameTrail.module('RouteNavigation').projectID + "&hypervideo=" + newHypervideoID);
                            
                            if ( FrameTrail.getState('editMode') ) {
                                
                                FrameTrail.changeState('editMode', false);
                                
                                FrameTrail.module('HypervideoModel').updateHypervideo(newHypervideoID, true, update);

                            } else {
                                
                                FrameTrail.module('HypervideoModel').updateHypervideo(newHypervideoID, false, update);
                                
                            }

                        }

                        

                    }

                    
                    //TODO END


                    

                });

                OverviewList.append(thumb);

            }


        }

        listWidthState = false;
        changeViewSize();
        OverviewList.find('.hypervideoThumb').css('transition-duration', '');

    }
    

    /**
     * Description
     * @method toggleSidebarOpen
     * @param {} opened
     * @return 
     */
    function toggleSidebarOpen(opened) {

        if ( FrameTrail.getState('viewMode') === 'overview' ) {
            changeViewSize();
        }

    };


    /**
     * Description
     * @method changeViewSize
     * @param {} arrayWidthAndHeight
     * @return 
     */
    function changeViewSize(arrayWidthAndHeight) {

        if ( FrameTrail.getState('viewMode') != 'overview' ) return;

        var overviewListHeight = $('#MainContainer').outerHeight()
                                    - (FrameTrail.getState('editMode') ? OverviewControls.height()+24 : 0),
            overviewListWidth = $(window).width()
                                    - (FrameTrail.getState('sidebarOpen') ? $('#Sidebar').width() : 0);

        OverviewList.height( overviewListHeight );

        if ( overviewListWidth >= 1400 && listWidthState != 1400 ) {
            
            listWidthState = 1400;

            OverviewList.find('.hypervideoThumb').css({
                height: 220 + 'px',
                margin: 0.8 + '%',
                width: 23 + '%'
            });

        } else if ( overviewListWidth >= 1220 && overviewListWidth < 1400 && listWidthState != 1220 ) {
            
            listWidthState = 1220;

            OverviewList.find('.hypervideoThumb').css({
                height: 190 + 'px',
                margin: 0.8 + '%',
                width: 23 + '%'
            });

        } else if ( overviewListWidth >= 1010 && overviewListWidth < 1220 && listWidthState != 1010 ) {

            listWidthState = 1010;

            OverviewList.find('.hypervideoThumb').css({
                height: 160 + 'px',
                margin: 0.7 + '%',
                width: 23 + '%'
            });

        } else if ( overviewListWidth >= 900 && overviewListWidth < 1010 && listWidthState != 900 ) {
            
            listWidthState = 900;

            OverviewList.find('.hypervideoThumb').css({
                height: 180 + 'px',
                margin: 1 + '%',
                width: 30.6 + '%'
            });

        } else if ( overviewListWidth >= 720 && overviewListWidth < 900 && listWidthState != 720 ) {
            
            listWidthState = 720;

            OverviewList.find('.hypervideoThumb').css({
                height: 160 + 'px',
                margin: 1 + '%',
                width: 30.6 + '%'
            });

        } else if ( overviewListWidth >= 620 && overviewListWidth < 720 && listWidthState != 620 ) {
            
            listWidthState = 620;

            OverviewList.find('.hypervideoThumb').css({
                height: 140 + 'px',
                margin: 1 + '%',
                width: 30.6 + '%'
            });

        } else if ( overviewListWidth <= 620 && listWidthState != 400 ) {
            
            listWidthState = 400;

            OverviewList.find('.hypervideoThumb').css({
                height: 120 + 'px',
                margin: 1.2 + '%',
                width: 46.4 + '%'
            });

        }

        OverviewList.perfectScrollbar('update');

    };


    /**
     * Description
     * @method toggleFullscreen
     * @param {} aBoolean
     * @return 
     */
    function toggleFullscreen(aBoolean) {


    };


    /**
     * Description
     * @method toogleUnsavedChanges
     * @param {} aBoolean
     * @return 
     */
    function toogleUnsavedChanges(aBoolean) {

        
    };


    /**
     * Description
     * @method toggleViewMode
     * @param {} viewMode
     * @return 
     */
    function toggleViewMode(viewMode) {

        if (viewMode === 'overview') {
            listWidthState = false;
            changeViewSize();
            domElement.addClass('active');
            FrameTrail.module('Titlebar').title = 'Project: ' + FrameTrail.module('Database').project.name;
        } else if (viewMode != 'resources') {
            domElement.removeClass('active');
        }

    };


    /**
     * Description
     * @method toggleEditMode
     * @param {} editMode
     * @return 
     */
    function toggleEditMode(editMode) {

        if (editMode) {
            showControls();
        } else {
            OverviewControls.empty().hide();
        }

        initList();

    };


    /**
     * Description
     * @method updateUserLogin
     * @return 
     */
    function updateUserLogin(){

        initList();

    }

        
    return {

        onChange: {
            sidebarOpen:    toggleSidebarOpen,
            viewSize:       changeViewSize,
            fullscreen:     toggleFullscreen,
            viewMode:       toggleViewMode,
            editMode:       toggleEditMode,

            loggedIn:       updateUserLogin
        },

        create: create

    };

});