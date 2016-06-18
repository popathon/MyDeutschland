/**
 * @module Player
 */


/**
 * I am the type definition of an Annotation. An annotation is a user-generated content
 * which is associated with start and end time of the main video.
 * 
 * An annotation can hold any type of {{#crossLink "Resource"}}Resource{{/crossLink}}.
 *
 * Annotations are grouped in annotation sets, which are assigned to a user. Each user can have 0 or 1 annotation set.
 *
 * Annotations are managed by the {{#crossLink "AnnotationsController"}}AnnotationsController{{/crossLink}}.
 *
 * @class Annotation
 * @category TypeDefinition
 */



FrameTrail.defineType(

    'Annotation',


    function(data){

        this.data = data;

        this.resourceItem = FrameTrail.newObject(
            ('Resource' + data.type.charAt(0).toUpperCase() + data.type.slice(1)),
            data
        )

        this.timelineElement   = $('<div class="timelineElement"></div>');
        this.tileElement       = $('<div class="tileElement" data-type="'+data.type+'"></div>');
        this.annotationElement = $('<div class="annotationElement"></div>');
        this.previewElement    = $('<div class="previewElement"></div>');


    },

    {
        /** I hold the data object of an Annotation, which is stored in the {{#crossLink "Database"}}Database{{/crossLink}} and saved in one of the hypervideos's annotations files.
         * @attribute data
         * @type {}
         */
        data:                   {},

        /**
         * I hold the Resource object of the annotation.
         * @attribute resourceItem
         * @type Resource
         */
        resourceItem:           {},

        /**
         * I hold the timelineElement (a jquery-enabled HTMLElement), which indicates my start and end time.
         * @attribute timelineElement
         * @type HTMLElement
         */
        timelineElement:        null,


        /**
         * I hold the tileElement (a jquery-enabled HTMLElement), which shows a icon for me close to my position in the timeline.
         * @attribute tileElement
         * @type HTMLElement
         */
        tileElement:            null,

        /**
         * I hold the annotationElement (a jquery-enabled HTMLElement), which contains the actual conent of my {{#crossLink "Annotation/resourceItem:attribute"}}resourceItem{{/crossLink}}.
         * @attribute annotationElement
         * @type HTMLElement
         */
        annotationElement:      null,

        /**
         * I hold the previewElement (a jquery-enabled HTMLElement), which shows the actual conent of my {{#crossLink "Annotation/resourceItem:attribute"}}resourceItem{{/crossLink}} in a special preview area besides the video.
         * @attribute previewElement
         * @type HTMLElement
         */
        previewElement:         null,

        /**
         * I store my state, wether I am "active" (this is, when my timelineElement is highlighted) or not.
         * @attribute activeState
         * @type Boolean
         */
        activeState:            false,

        /**
         * I store my state, wether I am "in focus" or not. See also:
         * * {{#crossLink "Annotation/gotInFocus:method"}}Annotation/gotInFocus(){{/crossLink}}
         * * {{#crossLink "Annotation/removedFromFocus:method"}}Annotation/removedFromFocus(){{/crossLink}}
         * * {{#crossLink "AnnotationsController/overlayInFocus:attribute"}}AnnotationsController/overlayInFocus{{/crossLink}}
         * @attribute permanentFocusState
         * @type Boolean
         */
        permanentFocusState:    false,



        /**
         * I render my DOM elements into the DOM.
         *
         * I am called, when the Annotation is initialized. My counterpart ist {{#crossLink "Annotation/removeFromDOM:method"}}Annotation/removeFromDOM{{/crossLink}}.
         *
         * @method renderInDOM
         */
        renderInDOM: function () {

            var ViewVideo = FrameTrail.module('ViewVideo');

            ViewVideo.AnnotationTimeline.append(this.timelineElement);
            this.updateTimelineElement();            
        
            this.annotationElement.empty();
            this.annotationElement.append( this.resourceItem.renderContent() );
            ViewVideo.AnnotationContainer.append(this.annotationElement);

            this.previewElement.empty();
            this.previewElement.append( this.resourceItem.renderContent() );
            ViewVideo.AnnotationPreviewContainer.append(this.previewElement);


            ViewVideo.AnnotationTileSlider.append(this.tileElement);
            
            this.timelineElement.unbind('hover');
            this.tileElement.unbind('hover');
            this.tileElement.unbind('click')
            this.timelineElement.hover(this.brushIn.bind(this), this.brushOut.bind(this));
            this.tileElement.hover(this.brushIn.bind(this), this.brushOut.bind(this));
            
            // self = this necessary as self can not be kept in anonymous handler function 
            var self = this;
            this.tileElement.click(function() {
                if ( FrameTrail.module('AnnotationsController').openedAnnotation == self ) {
                    self.closeAnnotation();
                } else {
                    self.openAnnotation();
                }
            });

        },


        /**
         * I update the CSS of the {{#crossLink "Annotation/timelineElement:attribute"}}timelineElement{{/crossLink}}
         * to its correct position within the timeline.
         *
         * @method updateTimelineElement
         */
        updateTimelineElement: function () {

            var videoDuration   = FrameTrail.module('HypervideoModel').duration,
                positionLeft    = 100 * (this.data.start / videoDuration),
                width           = 100 * ((this.data.end - this.data.start) / videoDuration);

            this.timelineElement.css({
                top: '',
                left:  positionLeft + '%',
                right: '',
                width: width + '%'
            });

        },


        /**
         * I remove my elements from the DOM.
         *
         * I am called when the Annotation is to be deleted.
         *
         * @method removeFromDOM
         * @return 
         */
        removeFromDOM: function () {

            this.timelineElement.remove();
            this.tileElement.remove();
            this.annotationElement.remove();
            this.previewElement.remove();

        },



        /**
         * I am called when the mouse pointer is hovering over one of my two DOM elements.
         *
         * I use the Raphael.js library to draw connecting lines betweem my tileElement and my timelineElement.
         *
         * @method brushIn
         */
        brushIn: function () {

            this.timelineElement.addClass('brushed');
            this.tileElement.addClass('brushed');

            if ( FrameTrail.getState('editMode') == false || FrameTrail.getState('editMode') == 'preview' ) {
                clearRaphael();
                drawConnections( this.tileElement, this.timelineElement, 10, {stroke: "#6B7884"} );
            }

        },

        /**
         * I am called when the mouse pointer is leaving the hovering area over my two DOM elements.
         * @method brushOut
         */
        brushOut: function () {

            this.timelineElement.removeClass('brushed');
            this.tileElement.removeClass('brushed');

            if ( (FrameTrail.getState('editMode') ==  false || FrameTrail.getState('editMode') ==  'preview') ) {
                clearRaphael();
            }

        },





        /**
         * When I am scheduled to be displayed, this is the method to be called.
         * @method setActive
         */
        setActive: function () {

            this.activeState = true;

            this.timelineElement.addClass('active');
            this.tileElement.addClass('active');

            this.previewElement.addClass('active');
            
            if ( this.data.type == 'location' && this.previewElement.children('.resourceDetail').data('map') ) {
                this.previewElement.children('.resourceDetail').data('map').updateSize();
            }

        },


        /**
         * When I am scheduled to disappear, this is the method to be called.
         * @method setInactive
         */
        setInactive: function () {

            this.activeState = false;

            this.timelineElement.removeClass('active');
            this.tileElement.removeClass('active');

            this.previewElement.removeClass('active');

        },


        /**
         * An annotation can be "opened" and "closed".
         *
         * When I am called, I open the annotation, which means:
         * * I set the current play position to my data.start value
         * * I tell the {{#crossLink "AnnotationsController/openedAnnotation:attribute"}}AnnotationsController{{/crossLink}} to set me as the "openedAnnotation"
         *
         * @method openAnnotation
         * @return 
         */
        openAnnotation: function () {

            var ViewVideo = FrameTrail.module('ViewVideo');

            //FrameTrail.module('HypervideoController').currentTime = this.data.start;

            FrameTrail.module('AnnotationsController').openedAnnotation = this;
            
            this.timelineElement.addClass('open');
            this.tileElement.addClass('open');

            ViewVideo.ExpandButton.one('click', this.closeAnnotation.bind(this));


        },

        /**
         * I tell the {{#crossLink "AnnotationsController/openedAnnotation:attribute"}}AnnotationsController{{/crossLink}} to set "openedAnnotation" to null.
         * @method closeAnnotation
         */
        closeAnnotation: function () {

            FrameTrail.module('AnnotationsController').openedAnnotation = null;

        },


        /**
         * I am called when the app switches to the editMode "annotations".
         *
         * I make sure
         * * that my {{#crossLink "Annotation/timelineElement:attribute"}}timelineElement{{/crossLink}} is resizable and draggable
         * * that my elements have click handlers for putting myself into focus.
         *
         * @method startEditing
         */
        startEditing: function () {


            var self = this,
                AnnotationsController = FrameTrail.module('AnnotationsController');

            this.makeTimelineElementDraggable();
            this.makeTimelineElementResizeable();

            this.timelineElement.on('click', function(){

                if (AnnotationsController.annotationInFocus === self){
                    return AnnotationsController.annotationInFocus = null;
                }

                self.permanentFocusState = true;
                AnnotationsController.annotationInFocus = self;

                FrameTrail.module('HypervideoController').currentTime = self.data.start;

            });
            

        },

        /**
         * When the global editMode leaves the state "annotations", I am called to 
         * stop the editing features of the annotations.
         *
         * @method stopEditing
         */
        stopEditing: function () {

            this.timelineElement.draggable('destroy');
            this.timelineElement.resizable('destroy');

            this.timelineElement.unbind('click');


        },


        /**
         * I make my {{#crossLink "Overlay/timelineElement:attribute"}}timelineElement{{/crossLink}} draggable.
         * 
         * The event handling changes my this.data.start and this.data.end attributes
         * accordingly.
         *
         * @method makeTimelineElementDraggable
         */
        makeTimelineElementDraggable: function () {

            var self = this;


            this.timelineElement.draggable({
                
                axis:        'x',
                containment: 'parent',
                snapTolerance: 10,

                drag: function(event, ui) {
                    
                    var closestGridline = FrameTrail.module('ViewVideo').closestToOffset($('.gridline'), {
                            left: ui.position.left,
                            top: ui.position.top
                        }),
                        snapTolerance = $(this).draggable('option', 'snapTolerance');

                    if (closestGridline) {
                        
                        $('.gridline').css('background-color', '#ff9900');

                        if ( ui.position.left - snapTolerance < closestGridline.position().left &&
                             ui.position.left + snapTolerance > closestGridline.position().left ) {

                            ui.position.left = closestGridline.position().left;

                            closestGridline.css('background-color', '#00ff00');

                        }
                    }

                    var videoDuration = FrameTrail.module('HypervideoModel').duration,
                        leftPercent   = 100 * (ui.helper.position().left / ui.helper.parent().width()),
                        newStartValue = leftPercent * (videoDuration / 100);

                    FrameTrail.module('HypervideoController').currentTime = newStartValue;    
                    
                },

                start: function(event, ui) {

                    if (!self.permanentFocusState) {
                        FrameTrail.module('AnnotationsController').annotationInFocus = self;
                    }
                    
                },

                stop: function(event, ui) {

                    if (!self.permanentFocusState) {
                        FrameTrail.module('AnnotationsController').annotationInFocus = null;
                    }
                    

                    var videoDuration = FrameTrail.module('HypervideoModel').duration,
                        leftPercent   = 100 * (ui.helper.position().left / ui.helper.parent().width()),
                        widthPercent  = 100 * (ui.helper.width() / ui.helper.parent().width());
                    
                    self.data.start = leftPercent * (videoDuration / 100);
                    self.data.end   = (leftPercent + widthPercent) * (videoDuration / 100);

                    self.updateTimelineElement();

                    FrameTrail.module('AnnotationsController').stackTimelineView();

                    FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');
                    
                }
            });

        },

        /**
         * I make my {{#crossLink "Annotation/timelineElement:attribute"}}timelineElement{{/crossLink}} resizable.
         * 
         * The event handling changes my this.data.start and this.data.end attributes
         * accordingly.
         *
         * @method makeTimelineElementResizeable
         * @return 
         */
        makeTimelineElementResizeable: function () {

            var self = this,
                endHandleGrabbed;


            this.timelineElement.resizable({
                
                containment: 'parent',
                handles:     'e, w',

                resize: function(event, ui) {
                    
                    var closestGridline = FrameTrail.module('ViewVideo').closestToOffset($('.gridline'), {
                            left: (endHandleGrabbed ? (ui.position.left + ui.helper.width()) : ui.position.left),
                            top: ui.position.top
                        }),
                        snapTolerance = $(this).draggable('option', 'snapTolerance');

                    if (closestGridline) {
                        
                        $('.gridline').css('background-color', '#ff9900');

                        if ( !endHandleGrabbed && 
                             ui.position.left - snapTolerance < closestGridline.position().left &&
                             ui.position.left + snapTolerance > closestGridline.position().left ) {

                            ui.position.left = closestGridline.position().left;
                            ui.size.width = ( ui.helper.width() + ( ui.helper.position().left - ui.position.left ) );

                            closestGridline.css('background-color', '#00ff00');

                        } else if ( endHandleGrabbed &&
                                    ui.position.left + ui.helper.width() - snapTolerance < closestGridline.position().left &&
                                    ui.position.left + ui.helper.width() + snapTolerance > closestGridline.position().left ) {
                        
                            ui.helper.width(closestGridline.position().left - ui.position.left);

                            closestGridline.css('background-color', '#00ff00');

                        }
                    }


                    var videoDuration = FrameTrail.module('HypervideoModel').duration,
                        leftPercent   = 100 * (ui.position.left / ui.helper.parent().width()),
                        widthPercent  = 100 * (ui.helper.width() / ui.helper.parent().width()),
                        newValue;

                    if ( endHandleGrabbed ) {

                        newValue = (leftPercent + widthPercent) * (videoDuration / 100);
                        FrameTrail.module('HypervideoController').currentTime = newValue;

                    } else {

                        newValue = leftPercent * (videoDuration / 100);
                        FrameTrail.module('HypervideoController').currentTime = newValue;

                    }
                    
                },

                start: function(event, ui) {

                    if (!self.permanentFocusState) {
                        FrameTrail.module('AnnotationsController').annotationInFocus = self;
                    }

                    endHandleGrabbed = $(event.originalEvent.target).hasClass('ui-resizable-e')
                    
                },

                stop: function(event, ui) {
                    
                    if (!self.permanentFocusState) {
                        FrameTrail.module('AnnotationsController').annotationInFocus = null;
                    }


                    var videoDuration = FrameTrail.module('HypervideoModel').duration,
                        leftPercent  = 100 * (ui.helper.position().left / ui.helper.parent().width()),
                        widthPercent = 100 * (ui.helper.width() / ui.helper.parent().width());

                    
                    self.data.start = leftPercent * (videoDuration / 100);
                    self.data.end   = (leftPercent + widthPercent) * (videoDuration / 100);

                    FrameTrail.module('AnnotationsController').stackTimelineView();

                    FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');
                    
                }
            });

        },


        /**
         * When I "got into focus" (which happens, when I become the referenced object in the AnnotationsController's
         * {{#crossLink "AnnotationsController/annotationInFocus:attribute"}}annotationInFocus attribute{{/crossLink}}),
         * then this method will be called.
         * 
         * @method gotInFocus
         */
        gotInFocus: function () {

            var EditPropertiesContainer = FrameTrail.module('ViewVideo').EditPropertiesContainer,
                self = this;

            EditPropertiesContainer.empty();

            var propertiesControls = $('<div>'
                                     + '    <div id="PreviewThumbContainer"></div>'
                                     + '    <button id="DeleteAnnotation">Delete</button>'
                                     + '</div>');

                propertiesControls.find('#DeleteAnnotation').click(function() {

                    FrameTrail.module('AnnotationsController').deleteAnnotation(self);

                });

                propertiesControls.find('#PreviewThumbContainer').append(this.resourceItem.renderThumb());
                
            EditPropertiesContainer.addClass('active').append(propertiesControls);

            this.timelineElement.addClass('highlighted');


        },


        /**
         * See also: {{#crossLink "Annotation/gotIntoFocus:method"}}this.gotIntoFocus(){{/crossLink}}
         *
         * When I was "removed from focus" (which happens, when the AnnotationsController's
         * {{#crossLink "AnnotationsController/annotationInFocus:attribute"}}annotationInFocus attribute{{/crossLink}}),
         * is set either to null or to an other annotation than myself),
         * then this method will be called.
         *
         * @method removedFromFocus
         */
        removedFromFocus: function () {

            FrameTrail.module('ViewVideo').EditPropertiesContainer.removeClass('active').empty();

            this.timelineElement.removeClass('highlighted');


        },


        /**
         * When the global state editMode is "annotations", the user can also choose to create
         * new annotations from other user's annotations (which makes a copy of that data and
         * places a new annotation in the user's collection of his/her own annotations).
         *
         * These annotation timelines from other users are called "compare timelines" (in contrast to the user's own timeline),.
         *
         * For this purpose, I create a special, jquery-enabled HTMLElement, which carries
         * all the necessary information to create a new annotation in its data attributes. The
         * returned element is draggable, and ready to be 
         * {{#crossLink "AnnotationsController:makeTimelineDroppable:method"}}dropped onto the annotation timeline{{/crossLink}}.
         *
         * @method renderCompareTimelineItem
         * @return HTMLElement
         */
        renderCompareTimelineItem: function() {

            var compareTimelineElement = $(
                    '<div class="compareTimelineElement" '
                +   ' data-start="'
                +   this.data.start
                +   '" data-end="'
                +   this.data.end
                +   '" data-resourceId="'
                +   this.data.resourceId
                +   '">'
                +   '    <div class="previewWrapper">'
                +   '    </div>'
                +   '</div>'
            ),

                videoDuration   = FrameTrail.module('HypervideoModel').duration,
                positionLeft    = 100 * (this.data.start / videoDuration),
                width           = 100 * ((this.data.end - this.data.start) / videoDuration);

            compareTimelineElement.css({
                left:  positionLeft + '%',
                width: width + '%'
            });

            compareTimelineElement.find('.previewWrapper').append(
                this.resourceItem.renderThumb()
            );

            compareTimelineElement.draggable({
                containment:    '#MainContainer',
                axis:           'y',
                helper:         'clone',
                appendTo:       'body',
                zIndex:         1000,

                start: function( event, ui ) {
                    ui.helper.css({
                        left: $(event.currentTarget).offset().left + "px",
                        width: $(event.currentTarget).width() + "px",
                        height: $(event.currentTarget).height() + "px",
                        backgroundColor: $(event.currentTarget).css('background-color')
                    });
                },
                
                drag: function( event, ui ) {
                    ui.helper.css({
                        top: ui.position.top + ($('#SlideArea').css('margin-top')*2) + "px"
                    });
                }

            });


            return compareTimelineElement;

        }





    }

);
