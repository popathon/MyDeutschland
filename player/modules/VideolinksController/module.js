/**
 * @module Player
 */


/**
 * I am the VideolinksController. I am responsible for managing all the {{#crossLink "Videolink"}}videolinks{{/crossLink}}
 * in the current {{#crossLink "HypervideoModel"}}HypervideoModel{{/crossLink}}, and for displaying them for viewing and editing.
 *
 * @class VideolinksController
 * @static
 */



FrameTrail.defineModule('VideolinksController', function(){


    var videolinks        = FrameTrail.module('HypervideoModel').videolinks, // can be shadowed be function local vars
        ViewVideo         = FrameTrail.module('ViewVideo'),
        videolinkInFocus  = null,
        openedLink        = null;



    /**
     * I tell all videolinks in the 
     * {{#crossLink "HypervideoModel/videolinks:attribute"}}HypervideoModel/videolinks attribute{{/crossLink}}
     * to render their elements into the DOM.
     * @method initController
     */
    function initController() {

        var videolinks = FrameTrail.module('HypervideoModel').videolinks;
        

        for (var i = 0; i < videolinks.length; i++) {

            videolinks[i].renderTimelineInDOM();
            videolinks[i].renderTilesAndContentInDOM();

        }

        distributeTiles();


    };



    /**
     * I remove all tileElements and videolinkElements from the DOM and then
     * re-append them again.
     *
     * This has the purpose that the DOM elements must appear in a sorted order by their start time. So this method has to called
     * after the user has finished editing.
     *
     * @method rearrangeTilesAndContent
     */
    function rearrangeTilesAndContent() {

        var videolinks = FrameTrail.module('HypervideoModel').videolinks;
        
        ViewVideo.VideolinkTiles.empty();
        ViewVideo.VideolinkContainer.empty();

        for (var i = 0; i < videolinks.length; i++) {

            videolinks[i].renderTilesAndContentInDOM();

        }

        distributeTiles();


    };


    /**
     * I am a central method of the VideolinksController.
     * I am called from the update functions inside the HypervideoController
     * and I set the activeState of the videolinks according to the current time.
     *
     * @method updateStatesOfVideolinks
     * @param {Number} currentTime
     */
    function updateStatesOfVideolinks(currentTime) {

        var videolink;

        for (var idx in videolinks) {

            videolink = videolinks[idx];

            if (    videolink.data.start <= currentTime
                 && videolink.data.end   >= currentTime) {

                if (!videolink.activeState) {

                    videolink.setActive();

                }

            } else {

                if (videolink.activeState) {

                    videolink.setInactive();

                }

            }

        }

        if (videolinkInFocus && !videolinkInFocus.activeState) {
            videolinkInFocus.setActive();
        }


    };


    /**
     * I distribute the tileElements in the tileContainer, so that they
     * match closely to the position of their related timelineElements.
     * When they would start to overlap, I arrange them in groups.
     *
     * See also {{#crossLink "Videolink"}}Videolink{{/crossLink}}.
     *
     * @method distributeTiles
     */
    function distributeTiles() {

        var videolinks          = FrameTrail.module('HypervideoModel').videolinks,
            videoDuration       = FrameTrail.module('HypervideoModel').duration,
            sliderParent        = ViewVideo.VideolinkTiles,
            containerElement    = ViewVideo.VideolinkTileSlider,
            groupCnt            = 0,
            gap                 = 3,
            thisTileElement,
            previousElement,
            previousElementRightPos,
            startTime,
            endTime,
            middleTime,
            desiredPosition,
            finalPosition;


        containerElement.children().removeAttr('data-group-id');
        containerElement.children().css({
            position: '',
            left:     ''
        });

        function getTotalWidth(collection, addition){

            var totalWidth = 0;
            collection.each(function() {
                totalWidth += $(this).width()+addition;
            });
            return totalWidth;

        }

        function getNegativeOffsetRightCorrection(leftPosition, collectionWidth) {
            
            var offsetCorrection,
                mostRightPos = leftPosition + collectionWidth + (gap*2);

            if ( mostRightPos >= sliderParent.width() ) {
                
                offsetCorrection = mostRightPos - sliderParent.width();

                return offsetCorrection;
                
            }

            return 0;
        }

        // Cancel if total width > container width
        if ( getTotalWidth(containerElement.children(), 3) > sliderParent.width() ) {
            containerElement.width( getTotalWidth(containerElement.children(), 3) );
            return;
        } else {
            containerElement.width('');
        }
        
        // Distribute Items
        for (var i = 0; i < videolinks.length; i++) {

            thisTileElement = videolinks[i].tileElement;



            if (i > 0) {
                previousElement         = videolinks[i-1].tileElement;
                previousElementRightPos = previousElement.position().left + previousElement.width();
            }

            startTime   = videolinks[i].data.start;
            endTime     = videolinks[i].data.end;
            middleTime  = startTime + ( (endTime-startTime)/2 );
            
            desiredPosition = ( (sliderParent.width() / videoDuration) * middleTime ) - ( thisTileElement.width()/2 );

            
            thisTileElement.attr({
                'data-in':  startTime,
                'data-out': endTime
            });

            if (desiredPosition <= 0) {
                finalPosition = 0;
                thisTileElement.removeAttr('data-group-id');
                groupCnt++;

            } else if (desiredPosition < previousElementRightPos + gap) {

                finalPosition = previousElementRightPos + gap;
                
                if (previousElement.attr('data-group-id')) {

                    containerElement.children('[data-group-id="'+ previousElement.attr('data-group-id') +'"]').attr('data-group-id', groupCnt);

                } else {

                    previousElement.attr('data-group-id', groupCnt);

                }

                thisTileElement.attr('data-group-id', groupCnt);
                groupCnt++;

            } else {

                finalPosition = desiredPosition;
                thisTileElement.removeAttr('data-group-id');
                groupCnt++;

            }

            thisTileElement.css({
                position: "absolute",
                left: finalPosition + "px"
            });

        }

        // Re-Arrange Groups

        var groupCollection,
            p,
            previousGroupCollection,
            previousGroupCollectionRightPos,
            totalWidth,
            groupStartTime,
            groupEndTime,
            groupMiddleTime,
            desiredGroupPosition,
            correction,
            negativeOffsetRightCorrection,
            groupIDs;
        
        function arrangeGroups() {

            groupIDs = [];

            containerElement.children('[data-group-id]').each(function() {
                if ( groupIDs.indexOf( $(this).attr('data-group-id') ) == -1 ) {
                    groupIDs.push($(this).attr('data-group-id'));
                }
            });
            
            for (var i=0; i < groupIDs.length; i++) {
                
                var g = groupIDs[i];

                groupCollection = containerElement.children('[data-group-id="'+ g +'"]');

                if (groupCollection.length < 1) {
                    continue;
                }

                if ( groupIDs[i-1] ) {
                    p = groupIDs[i-1];
                    previousGroupCollection         = containerElement.children('[data-group-id="'+ p +'"]');
                    previousGroupCollectionRightPos = previousGroupCollection.eq(0).position().left + getTotalWidth( previousGroupCollection, 3 );
                }

                totalWidth      = getTotalWidth( groupCollection, 3 );

                groupStartTime  = parseInt(groupCollection.eq(0).attr('data-in'));
                groupEndTime    = parseInt(groupCollection.eq(groupCollection.length-1).attr('data-out'));
                groupMiddleTime = groupStartTime + ( (groupEndTime-groupStartTime)/2 );

                desiredGroupPosition = ( (sliderParent.width() / videoDuration) * groupMiddleTime ) - ( totalWidth/2 );

                correction = groupCollection.eq(0).position().left - desiredGroupPosition;

                if ( groupCollection.eq(0).position().left - correction >= 0 && desiredGroupPosition > previousGroupCollectionRightPos + gap ) {
                    
                    groupCollection.each(function() {
                        $(this).css('left', '-='+ correction +'');
                    });

                } else if ( groupCollection.eq(0).position().left - correction >= 0 && desiredGroupPosition < previousGroupCollectionRightPos + gap ) {
                    
                    var  attachCorrection = groupCollection.eq(0).position().left - previousGroupCollectionRightPos;
                    groupCollection.each(function() {
                        
                        $(this).css('left', '-='+ attachCorrection +'');

                    });

                    if ( groupCollection.eq(0).prev().length ) {
                        
                        var prevElem = groupCollection.eq(0).prev();

                        if ( prevElem.attr('data-group-id') ) {

                            previousGroupCollection.attr('data-group-id', g);

                        } else {

                            prevElem.attr('data-group-id', g);
                            
                        }
                        
                    }

                }

            }

        }

        arrangeGroups();
        


        // Deal with edge case > tiles outside container on right side
        
        var repeatIteration;

        function solveRightEdgeOverlap() {

            repeatIteration = false;

            for (var i = 0; i < videolinks.length; i++) {

                thisTileElement = videolinks[i].tileElement;

                var g = undefined;
                
                if ( thisTileElement.attr('data-group-id') ) {
                    g = thisTileElement.attr('data-group-id');
                    groupCollection = containerElement.children('[data-group-id="'+ g +'"]');
                } else {
                    groupCollection = thisTileElement;
                }

                if (groupCollection.eq(0).prev().length) {
                    
                    previousElement = groupCollection.eq(0).prev();

                    if ( previousElement.attr('data-group-id') ) {

                        previousGroupCollection         = containerElement.children('[data-group-id="'+ previousElement.attr('data-group-id') +'"]');
                        previousGroupCollectionRightPos = previousGroupCollection.eq(0).position().left + getTotalWidth( previousGroupCollection, 3 );

                    } else {

                        previousGroupCollection         = previousElement;
                        previousGroupCollectionRightPos = previousElement.position().left + previousElement.width() + gap;
                        
                    }

                    
                } else {
                    previousGroupCollectionRightPos = 0;
                }

                totalWidth = getTotalWidth( groupCollection, 3 );

                currentGroupCollectionLeft = groupCollection.eq(0).position().left;
                currentGroupCollectionRightPos = groupCollection.eq(0).position().left + totalWidth;

                negativeOffsetRightCorrection = getNegativeOffsetRightCorrection(currentGroupCollectionLeft, totalWidth);

                if ( currentGroupCollectionLeft - negativeOffsetRightCorrection >= 0  && negativeOffsetRightCorrection > 1 ) {
                    
                    if ( currentGroupCollectionLeft - negativeOffsetRightCorrection > previousGroupCollectionRightPos + gap ) {
                        
                        groupCollection.each(function() {
                            $(this).css('left', '-='+ negativeOffsetRightCorrection +'');
                        });

                    } else if ( currentGroupCollectionLeft - negativeOffsetRightCorrection < previousGroupCollectionRightPos + gap ) {

                        var attachCorrection = currentGroupCollectionLeft - previousGroupCollectionRightPos;
                        groupCollection.each(function() {
                            $(this).css('left', '-='+ attachCorrection +'');
                        });

                        if ( !g && previousElement.length && previousElement.attr('data-group-id') ) {
                            
                            thisTileElement.attr('data-group-id', previousElement.attr('data-group-id'));

                        }

                        if ( previousElement.attr('data-group-id') ) {

                            containerElement.children('[data-group-id="'+ previousElement.attr('data-group-id') +'"]').attr('data-group-id', g);
                            
                        } else {

                            previousElement.attr('data-group-id', g);

                        }                        
                        
                        
                        repeatIteration = false;                            

                    }

                }

            }

            if ( repeatIteration ) {
                solveRightEdgeOverlap();
            }

        }

        solveRightEdgeOverlap();
        

    }


    /**
     * When we are in the editMode annotations, the timeline should
     * show all timeline elements stacked, which is what I do.
     * @method stackTimelineView
     */
    function stackTimelineView() {
        
        ViewVideo.VideolinkTimeline.CollisionDetection({spacing:0, includeVerticalMargins:true});
        ViewVideo.adjustLayout();
        ViewVideo.adjustHypervideo();

    };


    /**
     * When we are in the editMode annotations, the timeline should
     * show all timeline elements stacked. After leaving this mode,
     * I have to reset the timelineElements and the timeline to their normal
     * layout.
     * @method resetTimelineView
     * @private
     */
    function resetTimelineView() {
        
        ViewVideo.VideolinkTimeline.css('height', '');
        ViewVideo.VideolinkTimeline.children('.timelineElement').css({
            top:    '',
            right:  '',
            bottom: '',
            height: ''
        });

    };



    /**
     * When the editMode 'links' was entered, the #EditingOptions area
     * should show two tabs: 
     * * a list of (draggable) thumbnails with available hypervideos
     * * a text form, where the user can manually input a link URL
     *
     * @method initEditOptions
     * @private
     */
    function initEditOptions() {

        ViewVideo.EditingOptions.empty();


        var hypervideos = FrameTrail.module('Database').hypervideos,
            thumb,

            videolinkEditingOptions = $('<div id="VideolinkEditingTabs">'
                                    +   '    <ul>'
                                    +   '        <li>'
                                    +   '            <a href="#Videolist">Choose Hypervideo</a>'
                                    +   '        </li>'
                                    +   '        <li>'
                                    +   '            <a href="#EnterVideolink">Enter Link</a>'
                                    +   '        </li>'
                                    +   '    </ul>'
                                    +   '    <div id="Videolist">'
                                    +   '    </div>'
                                    +   '    <div id="EnterVideolink">'
                                    +   '        <label for="VideolinkHref">URL or relative path</label>'
                                    +   '        <input  id="VideolinkHref" type="text" placeholder="http://myhypervideo/">'
                                    +   '        <label for="VideolinkName">Name of Link</label>'
                                    +   '        <input  id="VideolinkName" type="text" placeholder="My Video">'
                                    +   '        <button id="CreateVideolink">Create Link</button>'
                                    +   '    </div>'
                                    +   '</div>')
                                    .tabs({
                                        heightStyle: "fill"
                                    }),

            videolist = videolinkEditingOptions.find('#Videolist');


        for (var id in hypervideos) {
            thumb = FrameTrail.newObject('Hypervideo', hypervideos[id]).renderThumb();
            thumb.draggable({
                containment:    '#MainContainer',
                helper:         'clone',
                appendTo:       'body',
                distance:       10,
                zIndex:         1000,

                start: function( event, ui ) {
                    ui.helper.css({
                        top: $(event.currentTarget).offset().top + "px",
                        left: $(event.currentTarget).offset().left + "px",
                        width: $(event.currentTarget).width() + "px",
                        height: $(event.currentTarget).height() + "px"
                    });
                    $(event.currentTarget).addClass('dragPlaceholder');
                },
                
                stop: function( event, ui ) {
                    $(event.target).removeClass('dragPlaceholder');
                }

            });

            videolist.append(thumb);
        }
        

        videolinkEditingOptions.find('#CreateVideolink').click(function(){

            var startTime       = FrameTrail.module('HypervideoController').currentTime,
                videoDuration   = FrameTrail.module('HypervideoModel').duration,
                endTime         = (startTime + 4 > videoDuration) 
                                    ? videoDuration
                                    : startTime + 4,
                

                newVideolink = FrameTrail.module('HypervideoModel').newVideolink({
                    "start":        startTime,
                    "end":          endTime,
                    "name":         videolinkEditingOptions.find('#VideolinkName').val(),
                    "href":         videolinkEditingOptions.find('#VideolinkHref').val()
                });

            
            newVideolink.renderTimelineInDOM();
            rearrangeTilesAndContent();

            newVideolink.startEditing();
            updateStatesOfVideolinks(FrameTrail.module('HypervideoController').currentTime);
            setVideolinkInFocus(newVideolink);

            stackTimelineView();

        });

        
        ViewVideo.EditingOptions.append(videolinkEditingOptions);

        


    };


    /**
     * When the editMode 'link' has been entered, the 
     * videolink timeline should be droppable for new items
     * (from the tab of available hypervideos, see {{#crossLink "VideolinksController/initEditOptions:method"}}VideolinksController/initEditOptions{{/crossLink}}).
     * A drop event should trigger the process of creating a new videolink.
     * My parameter is true or false to activate or deactivate this behavior.
     * @method makeTimelineDroppable
     * @param {Boolean} active
     */
    function makeTimelineDroppable(active) {

        if (active) {

            ViewVideo.VideolinkTimeline.droppable({
                accept:         '.hypervideoThumb',
                activeClass:    'droppableActive',
                hoverClass:     'droppableHover',
                tolerance:      'touch',

                over: function( event, ui ) {
                    ViewVideo.PlayerProgress.find('.ui-slider-handle').addClass('highlight');
                },

                out: function( event, ui ) {
                    ViewVideo.PlayerProgress.find('.ui-slider-handle').removeClass('highlight');
                },

                drop: function( event, ui ) {

                    var projectID       = FrameTrail.module('RouteNavigation').projectID,
                        hypervideoID    = ui.helper.attr('data-hypervideoID'),
                        hypervideoName  = ui.helper.attr('data-name'),
                        videoDuration   = FrameTrail.module('HypervideoModel').duration,
                        startTime       = FrameTrail.module('HypervideoController').currentTime,
                        endTime         = (startTime + 4 > videoDuration) 
                                            ? videoDuration
                                            : startTime + 4,

                        
                        newVideolink = FrameTrail.module('HypervideoModel').newVideolink({
                            "start":  startTime,
                            "end":    endTime,
                            "name":   hypervideoName,
                            "href":   '?project=' + projectID + '&hypervideo=' + hypervideoID
                        });

                    
                    newVideolink.renderTimelineInDOM();
                    rearrangeTilesAndContent();

                    newVideolink.startEditing();
                    updateStatesOfVideolinks(FrameTrail.module('HypervideoController').currentTime);
                    setVideolinkInFocus(newVideolink);

                    stackTimelineView();
                    
                    ViewVideo.PlayerProgress.find('.ui-slider-handle').removeClass('highlight');


                }

            });


        } else {


            ViewVideo.VideolinkTimeline.droppable('destroy');

        }

    }



    /**
     * When a videolink is set into focus, I have to tell 
     * the old videolink in the var videolinkInFocus, that it
     * is no longer in focus. Then I store the videolink (or null)
     * from my parameter in the var videolinkInFocus, and inform it 
     * about it.
     * @method setVideolinkInFocus
     * @param {Videolink} videolink
     * @private
     */
    function setVideolinkInFocus(videolink) {


        if (videolinkInFocus) {
            
            videolinkInFocus.permanentFocusState = false;
            videolinkInFocus.removedFromFocus();

        }

        videolinkInFocus = videolink;
        
        if (videolinkInFocus) {
            videolinkInFocus.gotInFocus();
        }

        updateStatesOfVideolinks(FrameTrail.module('HypervideoController').currentTime);

        return videolink;


    };

    


    /**
     * I listens to the global state 'editMode'.
     *
     * If we enter the editMode "links" I prepare all videolinks for editing, prepare the timeline
     * and the "editOptions" interface.
     *
     * When leaving I reset them.
     *
     * @method toggleEditMode
     * @param {String} editMode
     * @param {String} oldEditMode
     */
    function toggleEditMode(editMode, oldEditMode) {

        var videolinks = FrameTrail.module('HypervideoModel').videolinks;


        if(editMode === 'links' && oldEditMode !== 'links') {

            for (var idx in videolinks) {

                videolinks[idx].startEditing();

            }

            stackTimelineView();
            initEditOptions();
            makeTimelineDroppable(true);
            


        } else if (oldEditMode === 'links' && editMode !== 'links') {

            for (var idx in videolinks) {

                videolinks[idx].stopEditing();

            }

            setVideolinkInFocus(null);
            resetTimelineView();
            rearrangeTilesAndContent();
            makeTimelineDroppable(false);       

        }

    }


    /**
     * I react to changes in the global state "viewSize" (which is triggerd by a resize event of the window).
     * @method changeViewSize
     */
    function changeViewSize() {

        distributeTiles();

    }


    /**
     * I react to changes in the global state viewSizeChanged.
     * The state changes after a window resize event 
     * and is meant to be used for performance-heavy operations.
     *
     * @method onViewSizeChanged
     * @private
     */
    function onViewSizeChanged() {

        

    }


    /**
     * I react to changes in the global state "sidebarOpen".
     * @method toggleSidebarOpen
     */
    function toggleSidebarOpen() {

        var maxSlideDuration = 280,
            interval;

        interval = window.setInterval(distributeTiles, 40);
        
        window.setTimeout(function(){

            window.clearInterval(interval);

        }, maxSlideDuration)


    }


    /**
     * I open the videolinkElement of a videolink in the videolinkContainer.
     *
     * If my parameter is null, I close the videolinkContainer.
     *
     * @method setOpenedLink
     * @param {Videolink} videolink
     */
    function setOpenedLink(videolink) {

        openedLink = videolink

        for (var idx in videolinks) {

            videolinks[idx].videolinkElement.removeClass('open');
            videolinks[idx].tileElement.removeClass('open');

            videolinks[idx].videolinkElement.children('iframe').attr('src', '');

        }

        if (videolink) {

            // randomVersion allows to use the same iFrame src several times
            var randomVersion  = Math.round(Math.random() * (100 - 1) + 1),
                fragmentSplit  = videolink.data.href.split('#'),
                randomizedLink = fragmentSplit[0] + '&v=' + randomVersion + '#' + fragmentSplit[1];
            
            videolink.videolinkElement.children('iframe').attr('src', randomizedLink);

            videolink.videolinkElement.addClass('open');
            videolink.tileElement.addClass('open');
            ViewVideo.shownDetails = 'videolinks';

        } else {

            ViewVideo.shownDetails = null;

        }

    }

    /**
     * I am the starting point for the process of deleting 
     * a videolink. I call other necessary methods for it.
     * @method deleteVideolink
     * @param {Videolink} videolink
     */
    function deleteVideolink(videolink) {

        setVideolinkInFocus(null);
        videolink.removeFromDOM();
        distributeTiles();
        FrameTrail.module('HypervideoModel').removeVideolink(videolink);
        stackTimelineView();

    }

        
    /**
     * I react to changes in the global state "viewMode".
     *
     * @method toggleViewMode
     * @param {String} viewMode
     * @param {String} oldViewMode
     */
    function toggleViewMode(viewMode, oldViewMode){

        if (viewMode === 'video' && oldViewMode !== 'video') {
            distributeTiles();
        }

    }


    return {

        onChange: {
            editMode:        toggleEditMode,
            viewSize:        changeViewSize,
            viewSizeChanged: onViewSizeChanged,
            sidebarOpen:     toggleSidebarOpen,
            viewMode:        toggleViewMode
        },

        initController:             initController,
        updateStatesOfVideolinks:   updateStatesOfVideolinks,
        stackTimelineView:          stackTimelineView,
        deleteVideolink:            deleteVideolink,

        /**
         * I hold the currently opened videolink (or null, when there is no opened link).
         * I use the {{#crossLink "VideolinksController/setOpenedLink:method"}}VideolinksController/setOpenedLink(){{/crossLink}}.
         * @attribute openedLink
         * @type Videolink
         */
        get openedLink()            { return openedLink               },
        set openedLink(videolink)   { return setOpenedLink(videolink) },

        /**
         * I hold the videolink which is "in focus" (or null, when there is no link in focus).
         * I use the {{#crossLink "VideolinksController/setVideolinkInFocus:method"}}VideolinksController/setVideolinkInFocus(){{/crossLink}}.
         * @attribute videolinkInFocus
         * @type Videolink
         */
        set videolinkInFocus(videolink) { return setVideolinkInFocus(videolink) },
        get videolinkInFocus()          { return videolinkInFocus               }


    };

});