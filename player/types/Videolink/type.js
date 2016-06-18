/**
 * @module Player
 */


/**
 * I am the type definition of a Videolink. 
 *
 * A video link is classical hyperlink (to either another video or any other resource locatable bei an URL)
 * and which has a start and a end time related to the time base of the main video.
 *
 * Videolinks are managed by the {{#crossLink "VideolinksController"}}VideolinksController{{/crossLink}}.
 *
 * @class Videolink
 * @category TypeDefinition
 */



FrameTrail.defineType(

    'Videolink',

    function(data){

        this.data = data;

        this.timelineElement  = $('<div class="timelineElement"></div>');
        this.tileElement      = $('<div class="tileElement"></div>');
        this.videolinkElement = $('<div class="videolinkElement"></div>');


    },

    {
        
        /**
         * I hold the data object of a Videolink, which is stored in the {{#crossLink "Database"}}Database{{/crossLink}} and saved in the hypervideos's links.json file.
         * @attribute data
         * @type {}
         */
        data:                   {},

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
         * I hold the videolinkElement (a jquery-enabled HTMLElement), which shows the linked content in an iframe.
         * @attribute videolinkElement
         * @type HTMLElement
         */
        videolinkElement:       null,

        /**
         * I store my state, wether I am "active" (this is, when my timelineElement and tileElements are highlighted) or not.
         * @attribute activeState
         * @type Boolean
         */
        activeState:            false,
        

        /**
         * I store my state, wether I am "in focus" or not. See also:
         * * {{#crossLink "Videolink/gotInFocus:method"}}Videolink/gotInFocus(){{/crossLink}}
         * * {{#crossLink "Videolink/removedFromFocus:method"}}Videolink/removedFromFocus(){{/crossLink}}
         * * {{#crossLink "VideolinksController/videolinkInFocus:attribute"}}VideolinksController/videolinkInFocus{{/crossLink}}
         * @attribute permanentFocusState
         * @type Boolean
         */
        permanentFocusState:    false,
        

        /**
         * I render my ({{#crossLink "Videolink/timelineElement:attribute"}}this.timelineElement{{/crossLink}}
         * into the DOM.
         *
         * I am called, when the Videolink is initialized.
         *
         * The tileElement and videolinkElement however are rendere separately into the DOM (see 
         * {{#crossLink "Videolink/renderTilesAndContentInDOM:method"}}this.renderTilesAndContentInDOM{{/crossLink}}),
         * because their order in the DOM tree has to be sorted by this.data.start after each change.
         *
         * @method renderTimelineInDOM
         */
        renderTimelineInDOM: function () {

            var ViewVideo = FrameTrail.module('ViewVideo');

            this.timelineElement.unbind('hover');
            this.timelineElement.hover(this.brushIn.bind(this), this.brushOut.bind(this));

            ViewVideo.VideolinkTimeline.append(this.timelineElement);
            this.updateTimelineElement();
            
            
        },

        /**
         * I render my ({{#crossLink "Videolink/tileElement:attribute"}}this.tileElement{{/crossLink}}
         * and my {{#crossLink "Videolink/videolinkElement:attribute"}}this.videolinkElement{{/crossLink}} into the DOM.
         *
         * I am called, when the Videolink is initialized, and also every time, when the global state "editMode" leaves the state 
         * "links". This is the case, when the user has finished his/her changes to the Videolinks. All tiles and content
         * containers have to be re-rendered into the DOM, because they need to sorted by ascending value of this.data.start.
         *
         * @method renderTilesAndContentInDOM
         */
        renderTilesAndContentInDOM: function () {

            var ViewVideo = FrameTrail.module('ViewVideo'),
                iFrame    = $('<iframe frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'),
                linkElem  = $('<a class="videolinkAnchor" href="'+ this.data.href +'">Go to Hypervideo</a>');

            this.videolinkElement.empty();
            this.videolinkElement.append(iFrame, linkElem);

            ViewVideo.VideolinkTileSlider.append(this.tileElement);
            ViewVideo.VideolinkContainer.append(this.videolinkElement);

            this.tileElement.unbind('hover');
            this.tileElement.unbind('click')
            this.tileElement.hover(this.brushIn.bind(this), this.brushOut.bind(this));
            
            // self = this necessary as self can not be kept in anonymous handler function 
            var self = this;
            this.tileElement.click(function() {
                if ( FrameTrail.module('VideolinksController').openedLink == self ) {
                    self.closeVideolink();
                } else {
                    self.openVideolink();
                }
            });
            
        },


        /**
         * I remove all my elements from the DOM. I am called when a Videolink is to be deleted.
         * @method removeFromDOM
         */
        removeFromDOM: function () {

            this.timelineElement.remove();
            this.tileElement.remove();
            this.videolinkElement.remove();

        },

        /**
         * I update the CSS of the {{#crossLink "Videolink/timelineElement:attribute"}}timelineElement{{/crossLink}}
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
         * When I am scheduled to be displayed, this is the method to be called.
         * @method setActive
         */
        setActive: function () {

            this.activeState = true;

            this.timelineElement.addClass('active');
            this.tileElement.addClass('active');

        },

        /**
         * When I am scheduled to disappear, this is the method to be called.
         * @method setInactive
         */
        setInactive: function () {

            this.activeState = false;

            this.timelineElement.removeClass('active');
            this.tileElement.removeClass('active');

        },


        /**
         * I am called when the mouse pointer is hovering over one of my tile or my timeline element
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
         * I am called when the mouse pointer is leaving the hovering area over my tile or my timeline element.
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
         * A video link can be "opened" and "closed".
         *
         * When I am called, I open the video link, which means:
         * * I set the current play position to my data.start value
         * * I tell the {{#crossLink "VideolinksController/openedLink:attribute"}}VideolinksController{{/crossLink}} to set me as the "openedLink".
         *
         * @method openVideolink
         */
        openVideolink: function () {

            var ViewVideo = FrameTrail.module('ViewVideo');


            FrameTrail.module('HypervideoController').currentTime = this.data.start;

            FrameTrail.module('VideolinksController').openedLink = this;

            //ViewVideo.ExpandButton.one('click', this.closeVideolink.bind(this));


        },

        /**
         * I tell the {{#crossLink "VideolinksController/openedLink:attribute"}}VideolinksController{{/crossLink}} to set "openedLink" to null.
         * @method closeVideolink
         * @return 
         */
        closeVideolink: function () {

            FrameTrail.module('VideolinksController').openedLink = null;

        },



        /**
         * I am called when the app switches to the editMode "links".
         *
         * I make sure
         * * that my {{#crossLink "Videolink/timelineElement:attribute"}}timelineElement{{/crossLink}} is resizable and draggable
         * * and that it has a click handler for putting myself into focus.
         *
         * @method startEditing
         */
        startEditing: function () {


            var self = this,
                VideolinksController = FrameTrail.module('VideolinksController');

            this.makeTimelineElementDraggable();
            this.makeTimelineElementResizeable();

            this.timelineElement.on('click', function(){

                if (VideolinksController.videolinkInFocus === self){
                    return VideolinksController.videolinkInFocus = null;
                }

                self.permanentFocusState = true;
                VideolinksController.videolinkInFocus = self;

                FrameTrail.module('HypervideoController').currentTime = self.data.start;

            });
            

        },

        /**
         * When the global editMode leaves the state "links", I am called to 
         * stop the editing features of the video link.
         *
         * @method stopEditing
         */
        stopEditing: function () {

            this.timelineElement.draggable('destroy');
            this.timelineElement.resizable('destroy');

            this.timelineElement.unbind('click');


        },


        /**
         * I make my {{#crossLink "Videolink/timelineElement:attribute"}}timelineElement{{/crossLink}} draggable.
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
                        FrameTrail.module('VideolinksController').videolinkInFocus = self;
                    }
                    
                },

                stop: function(event, ui) {

                    if (!self.permanentFocusState) {
                        FrameTrail.module('VideolinksController').videolinkInFocus = null;
                    }
                    

                    var videoDuration = FrameTrail.module('HypervideoModel').duration,
                        leftPercent   = 100 * (ui.helper.position().left / ui.helper.parent().width()),
                        widthPercent  = 100 * (ui.helper.width() / ui.helper.parent().width());
                    
                    self.data.start = leftPercent * (videoDuration / 100);
                    self.data.end   = (leftPercent + widthPercent) * (videoDuration / 100);

                    self.updateTimelineElement();

                    FrameTrail.module('VideolinksController').stackTimelineView();

                    FrameTrail.module('HypervideoModel').newUnsavedChange('links');
                    
                }
            });

        },

        /**
         * I make my {{#crossLink "Videolink/timelineElement:attribute"}}timelineElement{{/crossLink}} resizable.
         * 
         * The event handling changes my this.data.start and this.data.end attributes
         * accordingly.
         *
         * @method makeTimelineElementResizeable
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
                        FrameTrail.module('VideolinksController').videolinkInFocus = self;
                    }

                    endHandleGrabbed = $(event.originalEvent.target).hasClass('ui-resizable-e')
                    
                },

                stop: function(event, ui) {
                    
                    if (!self.permanentFocusState) {
                        FrameTrail.module('VideolinksController').videolinkInFocus = null;
                    }


                    var videoDuration = FrameTrail.module('HypervideoModel').duration,
                        leftPercent  = 100 * (ui.helper.position().left / ui.helper.parent().width()),
                        widthPercent = 100 * (ui.helper.width() / ui.helper.parent().width());

                    
                    self.data.start = leftPercent * (videoDuration / 100);
                    self.data.end   = (leftPercent + widthPercent) * (videoDuration / 100);

                    FrameTrail.module('VideolinksController').stackTimelineView();

                    FrameTrail.module('HypervideoModel').newUnsavedChange('links');
                    
                }
            });

        },


        /**
         * When I "got into focus" (which happens, when I become the referenced object in the VideolinksController's
         * {{#crossLink "VideolinksController/videolinkInFocus:attribute"}}videolinkInFocus attribute{{/crossLink}}),
         * then this method will be called.
         * 
         * @method gotInFocus
         */
        gotInFocus: function () {

            var EditPropertiesContainer = FrameTrail.module('ViewVideo').EditPropertiesContainer,
                self = this;

            EditPropertiesContainer.empty();
            
            var propertiesControls = $('<div>'
                                     + '    <div class="propertiesTypeIcon" data-type="videolink"></div>'
                                     + '    <div>Title:</div>'
                                     + '    <div>' + this.data.name + '</div><br>'
                                     + '    <div>Link:</div>'
                                     + '    <div><input id="VideolinkHref" type="text" value="'+ this.data.href +'"></div><br>'
                                     + '    <button id="DeleteVideolink">Delete</button>'
                                     + '</div>');

                propertiesControls.find('#VideolinkHref').change(function() {

                    self.data.href = $(this).val();
                    
                    FrameTrail.module('HypervideoModel').newUnsavedChange('links');

                });

                propertiesControls.find('#DeleteVideolink').click(function() {

                    FrameTrail.module('VideolinksController').deleteVideolink(self);

                });

            EditPropertiesContainer.addClass('active').append(propertiesControls);

            this.timelineElement.addClass('highlighted');


        },


        /**
         * See also: {{#crossLink "Videolink/gotIntoFocus:method"}}this.gotIntoFocus(){{/crossLink}}
         *
         * When I was "removed from focus" (which happens, when the VideolinksController's
         * {{#crossLink "VideolinksController/videolinkInFocus:attribute"}}videolinkInFocus attribute{{/crossLink}}),
         * is set either to null or to an other Videolink than myself),
         * then this method will be called.
         *
         * @method removedFromFocus
         */
        removedFromFocus: function () {

            FrameTrail.module('ViewVideo').EditPropertiesContainer.removeClass('active').empty();

            this.timelineElement.removeClass('highlighted');


        }



    }

);
