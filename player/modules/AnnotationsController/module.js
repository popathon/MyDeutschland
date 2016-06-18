/**
 * @module Player
 */


/**
 * I am the AnnotationsController who mediates between the data model of 
 * all {{#crossLink "Annotation"}}annotations{{/crossLink}} (stored in {{#crossLink "HypervideoModel"}}HypervideoModel{{/crossLink}})
 * and their various User Interface elements (e.g. in {{#crossLink "ViewVideo"}}ViewVideo{{/crossLink}})
 *
 * @class AnnotationsController
 * @static
 */

 FrameTrail.defineModule('AnnotationsController', function(){


    var HypervideoModel   = FrameTrail.module('HypervideoModel'),
        ViewVideo         = FrameTrail.module('ViewVideo'),
        annotationInFocus = null,
        openedAnnotation  = null,

        annotations;




    /**
     * I initialize the AnnotationsController.
     * My init process has two tasks: connect the annotation menu in the Sidebar
     * with the data model (select current annotation set) and initialize
     * the annotations (instances of type {{#crossLink "Annotation"}}Annotation{{/crossLink}})
     *
     * @method initController
     */
    function initController() {
        
        annotations = HypervideoModel.annotations;

        initSidebarSelectmenu();
        if ( FrameTrail.getState('hv_config_annotationsVisible') ) {
            refreshSidebarSelectmenu(true);
        } else {
            refreshSidebarSelectmenu(false);
        }

        initAnnotations();
        
    }



    /**
     * I update the AnnotationsController during runtime.
     * My update process has two tasks: refresh the annotation menu in the Sidebar
     * with the data model (select current annotation set) and initialize
     * the annotations (instances of type {{#crossLink "Annotation"}}Annotation{{/crossLink}})
     *
     * @method updateController
     */
    function updateController() {

        // update references
        annotations = FrameTrail.module('HypervideoModel').annotations;
        ViewVideo = FrameTrail.module('ViewVideo');

        if ( FrameTrail.getState('hv_config_annotationsVisible') ) {
            refreshSidebarSelectmenu(true);
        } else {
            refreshSidebarSelectmenu(false);
        }
        
        initAnnotations();
        
    }



    /**
     * I connect the select menu (jquery-ui on select element)
     * with the data model.
     *
     * @method initSidebarSelectmenu
     * @private
     */
    function initSidebarSelectmenu() {

        var SelectAnnotationContainer = FrameTrail.module('Sidebar').SelectAnnotationContainer,
            SelectAnnotation = FrameTrail.module('Sidebar').SelectAnnotationContainer.find('#SelectAnnotation'),
            HypervideoModel = FrameTrail.module('HypervideoModel');


        $.widget( 'custom.stylableselectmenu', $.ui.selectmenu, {
            _renderItem: function( ul, item ) {
                var li = $( '<li>', { 
                    text: item.label,
                    style: 'color: ' + item.element.attr( 'data-color' )
                });
         
                if ( item.disabled ) {
                    li.addClass( 'ui-state-disabled' );
                }

                $( '<span>', {
                    style: 'background-color: ' + item.element.attr( 'data-color' ),
                    'class': 'color-square'
                })
                  .appendTo( li );
         
                return li.appendTo( ul );
            }
        });

        SelectAnnotation.stylableselectmenu();

        SelectAnnotation.on('stylableselectmenuchange', function(evt, ui) {
            
            FrameTrail.module('HypervideoModel').annotationSet = SelectAnnotation.val();
            annotations = FrameTrail.module('HypervideoModel').annotations;

            initAnnotations();

        });

        SelectAnnotation.on('stylableselectmenuselect', function(evt, ui) {

            /*
            // too much color in the interface, keep default color for now
            SelectAnnotation.stylableselectmenu('widget').css({
                'border-color': ui.item.element.attr( 'data-color' ),
                color: ui.item.element.attr( 'data-color' )
            });
            */

        });

    }




    /**
     * I refresh the view of the select menu in the sidebar.
     * When my parameter is false, I hide the select menu,
     * otherwise I show it an append all available annotation sets
     * as option to the select box.
     *
     * @method refreshSidebarSelectmenu
     * @param {Boolean} visible
     * @private
     */
    function refreshSidebarSelectmenu(visible) {

        var SelectAnnotationContainer = FrameTrail.module('Sidebar').SelectAnnotationContainer,
            HypervideoModel = FrameTrail.module('HypervideoModel'),
            SelectAnnotation,
            annotationSets;


        if (visible) {

            SelectAnnotation  = SelectAnnotationContainer.find('#SelectAnnotation'),
            SelectSingle      = SelectAnnotationContainer.find('#SelectAnnotationSingle'),
            annotationSets    = HypervideoModel.annotationSets;

            if ( annotationSets.length > 1 && !FrameTrail.getState('editMode') ) {
                
                SelectAnnotation.empty();
            
                for (var idx in annotationSets) {

                    SelectAnnotation.append(
                            '<option value="'
                        +   annotationSets[idx].id 
                        +   '" data-color="#'
                        +   annotationSets[idx].color
                        +   '">'
                        +   annotationSets[idx].name 
                        +   '</option>'
                    );

                }

                SelectAnnotation.stylableselectmenu('refresh');
                SelectAnnotation.val(HypervideoModel.annotationSet).stylableselectmenu('refresh');

                var uiObj = {
                    item: {
                        element: SelectAnnotationContainer.find('option').eq(0)
                    }
                }

                SelectAnnotation.trigger('stylableselectmenuselect', uiObj);
                
                SelectAnnotation.stylableselectmenu('widget').show();
                SelectSingle.text('').hide();

            } else if ( annotationSets.length == 1 && !FrameTrail.getState('editMode') ) {

                SelectAnnotation.stylableselectmenu('widget').hide();
                SelectSingle.text(annotationSets[0].name).show();

            } else if ( FrameTrail.getState('editMode') ) {
                
                SelectAnnotation.stylableselectmenu('widget').hide();
                SelectSingle.text(FrameTrail.getState('username')).show();

            }

            SelectAnnotationContainer.show();
            

        } else if ( !FrameTrail.getState('editMode') ) {

            SelectAnnotationContainer.hide();
            
        }


    }



    /**
     * I first empty all DOM elements, and then ask all 
     * annotations of the current data model, to append new DOM elements,
     * which I the arrange and prepare for view.
     *
     * @method initAnnotations
     * @private
     */
    function initAnnotations() {

        var annotationColor;

        if (!FrameTrail.module('Database').users[FrameTrail.module('HypervideoModel').annotationSet]) {
            annotationColor = '999999';
        } else {
            annotationColor = FrameTrail.module('Database').users[FrameTrail.module('HypervideoModel').annotationSet].color;
        }
        //console.log('current annotation color: ', annotationColor)

        // update references
        annotations = FrameTrail.module('HypervideoModel').annotations;
        ViewVideo = FrameTrail.module('ViewVideo');
        
        ViewVideo.AnnotationContainer.empty();
        ViewVideo.AnnotationTileSlider.empty();
        ViewVideo.AnnotationTimeline.empty();
        ViewVideo.AnnotationPreviewContainer.empty();


        for (var i = 0; i < annotations.length; i++) {

            annotations[i].renderInDOM();
            
        }

        distributeTiles();
        initAnnotationSlider();


    }



    /**
     * I distribute the tileElements in the tileContainer, so that they
     * match closely to the position of their related timelineElements.
     * When they would start to overlap, I arrange them in groups.
     * See also {{#crossLink "Annotation"}}Annotation{{/crossLink}}.
     *
     * @method distributeTiles
     * @private
     */
    function distributeTiles() {

        var annotations         = FrameTrail.module('HypervideoModel').annotations,
            videoDuration       = FrameTrail.module('HypervideoModel').duration,
            sliderParent        = ViewVideo.AnnotationTiles,
            containerElement    = ViewVideo.AnnotationTileSlider,
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
        for (var i = 0; i < annotations.length; i++) {

            thisTileElement = annotations[i].tileElement;



            if (i > 0) {
                previousElement         = annotations[i-1].tileElement;
                previousElementRightPos = previousElement.position().left + previousElement.width();
            }

            startTime   = annotations[i].data.start;
            endTime     = annotations[i].data.end;
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

            for (var i = 0; i < annotations.length; i++) {

                thisTileElement = annotations[i].tileElement;

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
     * I prepare the display of the annotationElement (which contains the content of an 
     * annotation), which are shown in the AnnotationContainer.
     * @method initAnnotationSlider
     * @private
     */
    function initAnnotationSlider() {

        var widthOfSlider   = 0,
            gap             = 10;

        for (var idx in annotations) {
            widthOfSlider += annotations[idx].annotationElement.width() + gap;
        }

        ViewVideo.AnnotationContainer.width(widthOfSlider);

    }




    /**
     * When the global state viewSize changes, I re-arrange 
     * the annotationElements and tiles, to fit the new
     * width of the browser.
     *
     * @method changeViewSize
     * @private
     */
    function changeViewSize() {

        updateAnnotationSlider();
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
     * When the state of the sidebar changes, I have to re-arrange 
     * the tileElements and the annotationElements, to fit the new
     * width of the #mainContainer.
     * @method toggleSidebarOpen
     * @private
     */
    function toggleSidebarOpen() {

        var maxSlideDuration = 280,
            interval;

        interval = window.setInterval(function(){
            distributeTiles();
            updateAnnotationSlider();
        }, 40);
        
        window.setTimeout(function(){

            window.clearInterval(interval);

        }, maxSlideDuration)


    }





    /**
     * When we are in the editMode annotations, the timeline should
     * show all timeline elements stacked, which is what I do.
     * @method stackTimelineView
     */
    function stackTimelineView() {
        
        ViewVideo.AnnotationTimeline.CollisionDetection({spacing:0, includeVerticalMargins:true});
        ViewVideo.adjustLayout();
        ViewVideo.adjustHypervideo();

    }


    /**
     * When we are in the editMode annotations, the timeline should
     * show all timeline elements stacked. After leaving this mode,
     * I have to reset the timelineElements and the timeline to their normal
     * layout.
     * @method resetTimelineView
     * @private
     */
    function resetTimelineView() {
        
        ViewVideo.AnnotationTimeline.css('height', '');
        ViewVideo.AnnotationTimeline.children('.timelineElement').css({
            top:    '',
            right:  '',
            bottom: '',
            height: ''
        });

    }






    /**
     * I am a central method of the AnnotationsController.
     * I am called from the update functions inside the HypervideoController
     * and I set the activeState of the annotations according to the current time.
     * @method updateStatesOfAnnotations
     * @param {Number} currentTime
     */
    function updateStatesOfAnnotations(currentTime) {

        var annotation;

        for (var idx in annotations) {

            annotation = annotations[idx];

            if (    annotation.data.start <= currentTime
                 && annotation.data.end   >= currentTime) {

                if (!annotation.activeState) {

                    annotation.setActive();

                }

            } else {

                if (annotation.activeState) {

                    annotation.setInactive();

                }

            }

        }

        if (annotationInFocus && !annotationInFocus.activeState) {
            annotationInFocus.setActive();
        }


    }



    /**
     * I open the annotationElement of an annotation in the annotationContainer.
     * if my parameter is null, I close the annotationContainer.
     * Also, I add CSS classes to the opened annotationElement, and to its left and right
     * neighbour.
     * @method setOpenedAnnotation
     * @param {Annotation or null} annotation
     * @private
     */
    function setOpenedAnnotation(annotation) {

        var itemPosition, leftOffset;


        openedAnnotation = annotation;


        for (var idx in annotations) {

            annotations[idx].annotationElement.removeClass('open previous next');
            annotations[idx].timelineElement.removeClass('open');
            annotations[idx].tileElement.removeClass('open');

        }

        if (annotation) {

            annotation.annotationElement.addClass('open');
            annotation.annotationElement.prev().addClass('previous');
            annotation.annotationElement.next().addClass('next');

            updateAnnotationSlider();

            ViewVideo.shownDetails = 'annotations';

            if ( annotation.data.type == 'location' && annotation.annotationElement.children('.resourceDetail').data('map') ) {
                annotation.annotationElement.children('.resourceDetail').data('map').updateSize();
            }

        } else {

            ViewVideo.shownDetails = null;

        }

    }



    /**
     * I find the annotation which is active. If there are more than one active annotations,
     * I return the last one which has been activated. If there is no active annotation, I return null.
     * @method findTopMostActiveAnnotation
     */
    function findTopMostActiveAnnotation() {

        var currentTime = FrameTrail.module('HypervideoController').currentTime,
            annotations = FrameTrail.module('HypervideoModel').annotations;
        
        return (function(){

            var allActiveAnnotations = [];

            for (var idx in annotations) {

                if (   annotations[idx].data.start <= currentTime
                    && annotations[idx].data.end >= currentTime ) {

                    allActiveAnnotations.push(annotations[idx]);

                }

            }
            

            if (allActiveAnnotations.length === 0) {
                if (annotations.length === 0) {
                    return null
                } else {
                    return annotations[0]
                }
            } else {

                return allActiveAnnotations.sort(function(a,b){
                    if (a.data.start > b.data.start) {
                        return -1
                    } else {
                        return 1
                    }
                })[0];

            }

        }).call();
    }


    /**
     * The annotationContainer is a slider element, which means that
     * its left position within its container element must be
     * updated according to the left position of the currently opened
     * annotationElement.
     * @method updateAnnotationSlider
     * @private
     */
    function updateAnnotationSlider() {

        if (openedAnnotation) {

            var itemPosition = openedAnnotation.annotationElement.position();
            
            var leftOffset = -1 * (     itemPosition.left 
                                      - 1 
                                      - ViewVideo.AnnotationContainer.parent().innerWidth() / 2
                                      + openedAnnotation.annotationElement.width() / 2
                            );

            ViewVideo.AnnotationContainer.css('left', leftOffset);

        }

    }



    /**
     * When an annotation is set into focus, I have to tell 
     * the old annotation in the var annotationInFocus, that it
     * is no longer in focus. Then I store the Annotation (or null)
     * from my parameter in the var annotationInFocus, and inform it 
     * about it.
     * @method setAnnotationInFocus
     * @param {Annotation or null} annotation
     * @return Annotation or null
     * @private
     */
    function setAnnotationInFocus(annotation) {


        if (annotationInFocus) {
            
            annotationInFocus.permanentFocusState = false;
            annotationInFocus.removedFromFocus();

        }

        annotationInFocus = annotation;
        
        if (annotationInFocus) {
            annotationInFocus.gotInFocus();
        }

        updateStatesOfAnnotations(FrameTrail.module('HypervideoController').currentTime);

        return annotation;


    }





    /**
     * Listens to global state 'editMode'.
     * The AnnotationsController has to react on a change of the 
     * editMode.
     * First it checks, wether we are entering or leaving the edit mode
     * in general (editMode is false, when not the editor is not active, otherwise
     * it is a String indicating the editMode).
     * If the editor is active, the user's own annotation set has to be selected
     * an the select menu for annotations has to be hidden.
     * Secondly it checks wether the editMode we enter or leave is 'annotations'.
     * If so, we activate or deactivate the editing options for annotations.
     *
     * @method toggleEditMode
     * @param {String or false} editMode
     * @param {String or false} oldEditMode
     */
    function toggleEditMode(editMode, oldEditMode) {        

        var HypervideoModel     = FrameTrail.module('HypervideoModel');
            


        if ( editMode === false && oldEditMode !== false && FrameTrail.getState('hv_config_annotationsVisible') ) {

            refreshSidebarSelectmenu(true);

        } else if ( editMode && oldEditMode === false ) {

            HypervideoModel.annotationSet = '#myAnnotationSet';
            
            refreshSidebarSelectmenu(true);

            initAnnotations();

        } else if ( editMode === false && FrameTrail.getState('hv_config_annotationsVisible') ) {

            refreshSidebarSelectmenu(true);
            
        } else {

            refreshSidebarSelectmenu(false);
            
        }


        if (editMode === 'annotations' && oldEditMode !== 'annotations') {

            annotations = HypervideoModel.annotations;

            for (var idx in annotations) {

                annotations[idx].startEditing();

            }

            stackTimelineView();
            initEditOptions();
            makeTimelineDroppable(true);
            


        } else if (oldEditMode === 'annotations' && editMode !== 'annotations') {


            for (var idx in annotations) {

                annotations[idx].stopEditing();

            }

            setAnnotationInFocus(null);
            resetTimelineView();
            makeTimelineDroppable(false);
            initAnnotations();

        }

    }




    /**
     * When the editMode 'annotations' was entered, the #EditingOptions area
     * should show two tabs: a ResourcePicker and a tab with the annotation timelines
     * of all other users, drag new items on the annotation timeline.
     * @method initEditOptions
     * @private
     */
    function initEditOptions() {

        ViewVideo.EditingOptions.empty();

        var annotationsEditingOptions = $('<div id="OverlayEditingTabs">'
                                  +   '    <ul>'
                                  +   '        <li><a href="#ResourceList">Choose Resource</a></li>'
                                  +   '        <li><a href="#OtherUsers">Choose Annotations of other Users</a></li>'
                                  +   '    </ul>'
                                  +   '    <div id="ResourceList"></div>'
                                  +   '    <div id="OtherUsers">'
                                  +   '        <div class="message active">Drag Annotations from the User Timelines to your Annotation Timeline</div>'
                                  +   '        <div id="TimelineList"></div>'
                                  +   '    </div>'
                                  +   '</div>')
                                  .tabs({
                                      heightStyle: "fill"
                                  }),

            timelineList        = annotationsEditingOptions.find('#TimelineList')
            annotationAllSets   = FrameTrail.module('HypervideoModel').annotationAllSets;


        ViewVideo.EditingOptions.append(annotationsEditingOptions);

        FrameTrail.module('ResourceManager').renderResourcePicker(
            annotationsEditingOptions.find('#ResourceList')
        );


        for (var id in annotationAllSets) {

            if (id === FrameTrail.module('UserManagement').userID) {
                continue;
            }

            var otherUsername =  '',
                otherUserColor = '';
            for (var key in HypervideoModel.annotationSets) {
                if (HypervideoModel.annotationSets[key].id === id) {
                    otherUsername  = HypervideoModel.annotationSets[key].name;
                    otherUserColor = HypervideoModel.annotationSets[key].color;
                }
            }

            var userTimelineWrapper = $(    '<div class="userTimelineWrapper">'
                                        +   '    <div class="userLabel" style="color: #'+ otherUserColor +'">'
                                        +   '        <span class="userIcon" style="background-color: #'+ otherUserColor +'"></span>'
                                        +   '        <span>'+ otherUsername + '</span>'
                                        +   '    </div>'
                                        +   '    <div class="userTimeline"></div>'
                                        +   '</div>'),
                userTimeline = userTimelineWrapper.find('.userTimeline');

            for (var idx in annotationAllSets[id]) {

                var compareTimelineItem = annotationAllSets[id][idx].renderCompareTimelineItem();
                    compareTimelineItem.css('background-color', '#' + otherUserColor);

                userTimeline.append(compareTimelineItem);

            }

            timelineList.append(userTimelineWrapper);

        }




    }



    /**
     * When the editMode 'annotations' has been entered, the 
     * annotation timeline should be droppable for new items
     * (from the ResourcePicker or from other users' timelines).
     * A drop event should trigger the process of creating a new annotation.
     * My parameter is true or false to activate or deactivate this behavior.
     * @method makeTimelineDroppable
     * @param {Boolean} droppable
     */
    function makeTimelineDroppable(droppable) {

        if (droppable) {

            ViewVideo.AnnotationTimeline.droppable({
                accept:         '.resourceThumb, .compareTimelineElement',
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

                    var resourceID      = ui.helper.attr('data-resourceID'),
                        videoDuration   = FrameTrail.module('HypervideoModel').duration,
                        startTime, 
                        endTime;

                        if (ui.helper.hasClass('compareTimelineElement')) {

                            startTime   = parseFloat(ui.helper.attr('data-start'));
                            endTime     = parseFloat(ui.helper.attr('data-end'));

                        } else {

                            startTime   = FrameTrail.module('HypervideoController').currentTime;
                            endTime     = (startTime + 4 > videoDuration) 
                                            ? videoDuration
                                            : startTime + 4;
                        }

                        

                        newAnnotation = FrameTrail.module('HypervideoModel').newAnnotation({
                            "start":        startTime,
                            "end":          endTime,
                            "resourceId":   resourceID
                        });

                    newAnnotation.renderInDOM();
                    newAnnotation.startEditing();
                    updateStatesOfAnnotations(FrameTrail.module('HypervideoController').currentTime);

                    stackTimelineView();
                    
                    
                    ViewVideo.PlayerProgress.find('.ui-slider-handle').removeClass('highlight');

                }


            });          

        } else {

            ViewVideo.AnnotationTimeline.droppable('destroy');

        }

    }


    /**
     * I am the starting point for the process of deleting 
     * an annotation.
     * @method deleteAnnotation
     * @param {Annotation} annotation
     */
    function deleteAnnotation(annotation) {

        setAnnotationInFocus(null);
        annotation.removeFromDOM();
        distributeTiles();
        FrameTrail.module('HypervideoModel').removeAnnotation(annotation);

        stackTimelineView();

    }


    /**
     * When we enter the viewMode 'video', we have to update the
     * distribution of tiles accoring to the current browser width.
     * @method toggleViewMode
     * @param {String} viewMode
     * @param {String} oldViewMode
     * @return 
     */
    function toggleViewMode(viewMode, oldViewMode){

        if (viewMode === 'video' && oldViewMode !== 'video') {
            distributeTiles();
        }

    }


    /**
     * I react to a change in the global state "userColor"
     * @method changeUserColor
     * @param {String} color
     */
    function changeUserColor(newColor) {

        var annotationSets = HypervideoModel.annotationSets,
            SelectAnnotation = FrameTrail.module('Sidebar').SelectAnnotationContainer.find('#SelectAnnotation');

        for (var idx in annotationSets) {

            if (annotationSets[idx].id == FrameTrail.module('UserManagement').userID && newColor.length > 1) {
                annotationSets[idx].color = newColor;
            }

        }

        if (newColor.length > 1 && SelectAnnotation.stylableselectmenu) {

            refreshSidebarSelectmenu(true);

        }

    }


    /**
     * I am called when the global state "hv_config_annotationsVisible" changes.
     *
     * This is a configuration option (saved in the hypervideo's index.json entry).
     *
     * @method toggleConfig_annotationsVisible
     * @param {Boolean} newState
     * @param {Boolean} oldState
     */
    function toggleConfig_annotationsVisible(newState, oldState) {
        if (newState == true) {
            refreshSidebarSelectmenu(true);
        } else {
            refreshSidebarSelectmenu(false);
        }
    }

        
    return {

        onChange: {
            editMode:        toggleEditMode,
            viewSize:        changeViewSize,
            viewSizeChanged: onViewSizeChanged,
            sidebarOpen:     toggleSidebarOpen,
            viewMode:        toggleViewMode,
            userColor:       changeUserColor,

            hv_config_annotationsVisible: toggleConfig_annotationsVisible,
        },

        initController:             initController,
        updateController:           updateController,
        updateStatesOfAnnotations:  updateStatesOfAnnotations,
        stackTimelineView:          stackTimelineView,
        deleteAnnotation:           deleteAnnotation,

        findTopMostActiveAnnotation: findTopMostActiveAnnotation,

        /**
         * An annotation can be selected to be
         * the annotationInFocus (either by clicking or dragging/resizing).
         * The annotation then displays additional controls in the #EditPropertiesControls
         * element of {{#crossLink "ViewVideo"}}ViewVideo{{/crossLink}}
         * @attribute annotationInFocus
         * @type Annotation or null
         */
        set annotationInFocus(annotation) { return setAnnotationInFocus(annotation) },
        get annotationInFocus()           { return annotationInFocus                },


        /**
         * An annotation can be opened.
         * This means it opens the AnnotationsConatiner, where it has
         * already rendered its content (the annotationElement) into.
         * @attribute openedAnnotation
         * @type Annotation or null
         */
        get openedAnnotation()           { return openedAnnotation                },
        set openedAnnotation(annotation) { return setOpenedAnnotation(annotation) }

    };

});