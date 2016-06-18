/**
 * @module Shared
 */


/**
 * I am the type definition of a Resource.
 *
 * I am an abstract type, I should not be instantiated directly but rather my sub-types:
 * * {{#crossLink "ResourceImage"}}ResourceImage{{/crossLink}}
 * * {{#crossLink "ResourceLocation"}}ResourceImage{{/crossLink}}
 * * {{#crossLink "ResourceVideo"}}ResourceVideo{{/crossLink}}
 * * {{#crossLink "ResourceVimeo"}}ResourceVimeo{{/crossLink}}
 * * {{#crossLink "ResourceWebpage"}}ResourceWebpage{{/crossLink}}
 * * {{#crossLink "ResourceWikipedia"}}ResourceWikipedia{{/crossLink}}
 * * {{#crossLink "ResourceYoutube"}}ResourceYoutube{{/crossLink}}
 *
 * @class Resource
 * @category TypeDefinition
 * @abstract
 */



FrameTrail.defineType(

    'Resource',

    function(resourceData){



    },

    {
        
        /**
         * I create a preview dialog, call the .renderContent method of a given resource
         * (e.g. {{#crossLink "ResourceImage/renderContent:method"}}ResourceImage/renderContent{{/crossLink}})
         * and append the returned element to the dialog.
         *
         * @method openPreview
         * @param {HTMLElement} elementOrigin
         */
        openPreview: function(elementOrigin) {

            var animationDiv = elementOrigin.clone(),
                originOffset = elementOrigin.offset(),
                finalTop = ($(window).height()/2) - 200,
                finalLeft = ($(window).width()/2) - 320,
                self = this;

            animationDiv.addClass('resourceAnimationDiv').css({
                position: 'absolute',
                top: originOffset.top + 'px',
                left: originOffset.left + 'px',
                width: elementOrigin.width(),
                height: elementOrigin.height(),
                zIndex: 99
            }).appendTo('body');

            animationDiv.animate({
                top: finalTop + 'px',
                left: finalLeft + 'px',
                width: 640 + 'px',
                height: 400 + 'px'
            }, 300, function() {
                var previewDialog   = $('<div class="resourcePreviewDialog" title="'+ self.resourceData.name +'"></div>')
                    .append(self.renderContent());

                previewDialog.dialog({
                    resizable: true,
                    width: 640,
                    height: 400,
                    modal: true,
                    close: function() {
                        $(this).dialog('close');
                        $(this).remove();
                        animationDiv.animate({
                            top: originOffset.top + 'px',
                            left: originOffset.left + 'px',
                            width: elementOrigin.width(),
                            height: elementOrigin.height()
                        }, 300, function() {
                            $('.resourceAnimationDiv').remove();
                        });
                    },
                    closeOnEscape: true,
                    open: function( event, ui ) {
                        if ($(this).find('.resourceDetail').data().map) {
                            $(this).find('.resourceDetail').data().map.updateSize();
                        }
                        $('.ui-widget-overlay').click(function() {
                            previewDialog.dialog('close');
                        });

                    }
                });
            });

        },


        /**
         * When an {{#crossLink "Overlay/gotInFocus:method"}}Overlay got into Focus{{/crossLink}}, its properties and some additional controls to edit the overlay's attributes 
         * should be shown in the right window of the player.
         *
         * I provide a basic method, which can be extended by my sub-types.
         *
         * I render properities controls for the UI for the overlay's following attributes:
         *
         * * overlay.data.start
         * * overlay.data.end
         * * overlay.data.position.top
         * * overlay.data.position.left
         * * overlay.data.position.width
         * * overlay.data.position.height
         * 
         * __Why__ is this function a method of Resource and not Overlay? --> Because there is only one type of Overlay, but this can hold in its resourceData attribute different types of Resources.
         * And because the properties controls can depend on resourceData, the method is placed here and in the sub-types of Resource.
         * 
         * @method renderBasicPropertiesControls
         * @param {Overlay} overlay
         * @return &#123; controlsContainer: HTMLElement, changeStart: Function, changeEnd: Function, changeDimensions: Function &#125;
         */
        renderBasicPropertiesControls: function(overlay) {

            var controlsContainer = $('<div></div>'),
                manualInputMode   = true,
                defaultControls   = $('<div id="TimeControls">'
                					+ '    <div class="propertiesTypeIcon" data-type="' + overlay.data.type + '"></div>'
                                    + '    <label for="TimeStart">Start</label>'
                                    + '    <input id="TimeStart" value="' + overlay.data.start + '">'
                                    + '    <label for="TimeEnd">End</label>'
                                    + '    <input id="TimeEnd" value="' + overlay.data.end + '">'
                                    + '</div>'
                                    + '<div id="PositionControls">'
                                    + '    <input id="PositionTop" value="' + overlay.data.position.top + '">'
                                    + '    <input id="PositionLeft" value="' + overlay.data.position.left + '">'
                                    + '    <input id="PositionWidth" value="' + overlay.data.position.width + '">'
                                    + '    <input id="PositionHeight" value="' + overlay.data.position.height + '">'
                                    + '</div>'
                                    + '<div style="clear: both;">Opacity</div>'
                                    + '<div id="OpacitySlider"></div>'
                                    //+ '<div>Arrange</div>'
                                    //+ '<button id="ArrangeTop">Move to top</button>'
                                    //+ '<button id="ArrangeBottom">Move to bottom</button>'
                                    + '<button id="DeleteOverlay">Delete</button>'
                                    + '<hr>');
                

            controlsContainer.append(defaultControls);

            controlsContainer.find('#TimeStart').spinner({
                step: 0.1,
                min: 0,
                max: FrameTrail.module('HypervideoModel').duration,
                numberFormat: 'n',
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.start = ui.value;
                        overlay.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.start;
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                    

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.start = $(evt.target).val();
                        overlay.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.start;
                        FrameTrail.module('OverlaysController').stackTimelineView();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#TimeEnd').spinner({
                step: 0.1,
                min: 0,
                max: FrameTrail.module('HypervideoModel').duration,
                numberFormat: 'n',
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.end = ui.value;
                        overlay.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.end; 
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.end = $(evt.target).val();
                        overlay.updateTimelineElement();  
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.end;
                        FrameTrail.module('OverlaysController').stackTimelineView();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionTop').spinner({
                step: 0.1,
                numberFormat: 'n',
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.top = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.top = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionLeft').spinner({
                step: 0.1,
                numberFormat: 'n',
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.left = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.left = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionWidth').spinner({
                step: 0.1,
                numberFormat: 'n',
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.width = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.width = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionHeight').spinner({
                step: 0.1,
                numberFormat: 'n',
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.height = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.height = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#OpacitySlider').slider({
                value: (overlay.data.attributes.opacity || 1),
                step: 0.01,
                orientation: "horizontal",
                range: "min",
                min: 0,
                max: 1,
                animate: false,
                create: function() {
                    if ($.isArray(overlay.data.attributes) && overlay.data.attributes.length < 1) {
                        overlay.data.attributes = {};
                    }
                },
                slide:  function(evt, ui) {

                    overlay.data.attributes.opacity = ui.value;

                    overlay.updateOverlayElement();

                    FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');

                }
            });

            controlsContainer.find('#ArrangeTop').click( function() {
                // Move to top
                FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
            });

            controlsContainer.find('#ArrangeBottom').click( function() {
                // Move to bottom
                FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
            });
            
            controlsContainer.find('#DeleteOverlay').click(function(){

                FrameTrail.module('OverlaysController').deleteOverlay(overlay);

            })

            var PropertiesControlsInterface = {

                controlsContainer: controlsContainer,
                
                changeStart:  function(val) { 
                    manualInputMode = false;
                    controlsContainer.find('#TimeStart').spinner('value', val);
                    manualInputMode = true;
                },

                changeEnd: function(val) { 
                    manualInputMode = false;
                    controlsContainer.find('#TimeEnd').spinner('value', val);
                    manualInputMode = true;
                },

                changeDimensions: function(val) {
                    manualInputMode = false;
                    controlsContainer.find('#PositionTop').spinner('value', val.top);
                    controlsContainer.find('#PositionLeft').spinner('value', val.left);
                    controlsContainer.find('#PositionWidth').spinner('value', val.width);
                    controlsContainer.find('#PositionHeight').spinner('value', val.height);
                    manualInputMode = true;
                }

            }




            return PropertiesControlsInterface;

        }

        



    }

);
