(function() {

    var tileSource = new OpenSeadragon.LegacyTileSource( [{
        url: 'data/dog_radiograph_2.jpg',
        width: 1909,
        height: 1331
    }] );

    var viewer = OpenSeadragon({
                     //debugMode: true,
                     id: "viewerDiv1",
                     prefixUrl: "images/",
                     showNavigationControl: true,
                     showNavigator: true,
                     visibilityRatio: 0.1,
                     minZoomLevel: 0.001,
                     maxZoomLevel: 10,
                     zoomPerClick: 1.4,
                     tileSources: "data/testpattern.dzi"//tileSource "data/tall.dzi" "data/wide.dzi" *TODO Add UI to let user switch images
                 }),
        imagingHelper = viewer.activateImagingHelper({viewChangedHandler: onImageViewChanged}),
        viewerInputHook = viewer.addViewerInputHook({dragHandler: onOSDCanvasDrag, 
                                                     moveHandler: onOSDCanvasMove,
                                                     scrollHandler: onOSDCanvasScroll,
                                                     clickHandler: onOSDCanvasClick}),
        $osdCanvas = $(viewer.canvas),
        $outputContainer = $('#outputcontainer1'),
        $svgOverlay = $('#imgvwrSVG');

    // Example SVG annotation overlay
    var annoGroupTranslateX = ko.observable(0.0),
        annoGroupTranslateY = ko.observable(0.0),
        annoGroupScale = ko.observable(1.0),
        annoGroupTransform = ko.computed(function () {
            return 'translate(' + annoGroupTranslateX() + ',' + annoGroupTranslateY() + ') scale(' + annoGroupScale() + ')';
        }, this);

    viewer.addHandler('open', function (event) {
        setMinMaxZoom();
        vm.haveImage(true);
        $osdCanvas.on('mouseenter.osdimaginghelper', onOSDCanvasMouseEnter);
        $osdCanvas.on('mousemove.osdimaginghelper', onOSDCanvasMouseMove);
        $osdCanvas.on('mouseleave.osdimaginghelper', onOSDCanvasMouseLeave);
        updateImageVM();
        updateImgViewerViewVM();
        updateImgViewerDataCoordinatesVM();
        $svgOverlay.css( "visibility", "visible");

        //// Example OpenSeadragon overlay
        //var olDiv = document.createElement('div');
        //olDiv.style.background = 'rgba(255,0,0,0.25)';
        //var olRect = new OpenSeadragon.Rect(-0.1, -0.1, 1.2, 1.0 / event.viewer.source.aspectRatio + 0.2);
        ////var olRect = new OpenSeadragon.Rect(-0.5, -0.5, 2.0, 1.0 / event.viewer.source.aspectRatio + 1.0);
        //_this._osd.drawer.addOverlay({
        //    element: olDiv,
        //    location: olRect,
        //    placement: OpenSeadragon.OverlayPlacement.TOP_LEFT
        //    //onDraw: function (position, size, element) {
        //    //    position = position || null;
        //    //}
        //});
    });

    viewer.addHandler('close', function (event) {
        $svgOverlay.css( "visibility", "hidden");
        vm.haveImage(false);
        $osdCanvas.off('mouseenter.osdimaginghelper', onOSDCanvasMouseEnter);
        $osdCanvas.off('mousemove.osdimaginghelper', onOSDCanvasMouseMove);
        $osdCanvas.off('mouseleave.osdimaginghelper', onOSDCanvasMouseLeave);
        $osdCanvas = null;
    });

    viewer.addHandler('fullpage', function (event) {
        if (event.fullpage) {
            ko.cleanNode($outputContainer[0]);
            ko.cleanNode($svgOverlay[0]);
            $svgOverlay.css( "visibility", "hidden");
        }
        else {
            ko.applyBindings(vm, $outputContainer[0]);
            ko.applyBindings(vm, $svgOverlay[0]);
            updateImageVM();
            updateImgViewerViewVM();
            updateImgViewerDataCoordinatesVM();
            $svgOverlay.css( "visibility", "visible");
        }
    });

    function setMinMaxZoom() {
        var minzoomX = 50.0 / imagingHelper.imgWidth;
        var minzoomY = 50.0 / imagingHelper.imgHeight;
        var minZoom = Math.min(minzoomX, minzoomY);
        var maxZoom = 10.0;
        imagingHelper.setMinZoom(minZoom);
        imagingHelper.setMaxZoom(maxZoom);
        imagingHelper.setZoomStepPercent(35);
    }

    function onImageViewChanged(event) {
        // event.viewportWidth == width of viewer viewport in logical coordinates relative to image native size
        // event.viewportHeight == height of viewer viewport in logical coordinates relative to image native size
        // event.viewportCenter == OpenSeadragon.Point, center of the viewer viewport in logical coordinates relative to image
        updateImgViewerViewVM();
        updateImgViewerScreenCoordinatesVM();
        updateImgViewerDataCoordinatesVM();

        // Example SVG annotation overlay
        //var p = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(0, 0), true);
        var p = imagingHelper.logicalToPhysicalPoint(new OpenSeadragon.Point(0, 0));
        annoGroupTranslateX(p.x);
        annoGroupTranslateY(p.y);
        annoGroupScale(imagingHelper.getZoomFactor());
    }

    function onOSDCanvasDrag(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        //event.stopHandlers = true;
        event.stopBubbling = true;
    }

    function onOSDCanvasMove(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        vm.OSDMouseRelativeX(event.position.x);
        vm.OSDMouseRelativeY(event.position.y);
        event.stopHandlers = true;
        event.stopBubbling = true;
    }

    function onOSDCanvasScroll(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        var logPoint = imagingHelper.physicalToLogicalPoint(event.position);
        if (event.scroll > 0) {
            imagingHelper.zoomInAboutLogicalPoint(logPoint);
        }
        else {
            imagingHelper.zoomOutAboutLogicalPoint(logPoint);
        }
        event.stopHandlers = true;
        event.stopBubbling = true;
    }

    function onOSDCanvasClick(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        if (event.quick) {
            var logPoint = imagingHelper.physicalToLogicalPoint(event.position);
            if (event.shift) {
                imagingHelper.zoomOutAboutLogicalPoint(logPoint);
            }
            else {
                imagingHelper.zoomInAboutLogicalPoint(logPoint);
            }
        }
        event.stopHandlers = true;
        event.stopBubbling = true;
    }

    function onOSDCanvasMouseEnter(event) {
        vm.haveMouse(true);
        updateImgViewerScreenCoordinatesVM();
    }

    function onOSDCanvasMouseMove(event) {
        var osdmouse = OpenSeadragon.getMousePosition(event),
            osdoffset = OpenSeadragon.getElementOffset(viewer.canvas);
        vm.OSDMousePositionX(osdmouse.x);
        vm.OSDMousePositionY(osdmouse.y);
        vm.OSDElementOffsetX(osdoffset.x);
        vm.OSDElementOffsetY(osdoffset.y);

        var offset = $osdCanvas.offset();
        vm.mousePositionX(event.pageX);
        vm.mousePositionY(event.pageY);
        vm.elementOffsetX(offset.left);
        vm.elementOffsetY(offset.top);
        vm.mouseRelativeX(event.pageX - offset.left);
        vm.mouseRelativeY(event.pageY - offset.top);
        updateImgViewerScreenCoordinatesVM();
    }

    function onOSDCanvasMouseLeave(event) {
        vm.haveMouse(false);
    }

    function updateImageVM() {
        if (vm.haveImage()) {
            vm.imgWidth(imagingHelper.imgWidth);
            vm.imgHeight(imagingHelper.imgHeight);
            vm.imgAspectRatio(imagingHelper.imgAspectRatio);
            vm.minZoom(imagingHelper.getMinZoom());
            vm.maxZoom(imagingHelper.getMaxZoom());
        }
    }

    function updateImgViewerViewVM() {
        if (vm.haveImage()) {
            var containerSize = viewer.viewport.getContainerSize();
            vm.OSDContainerWidth(containerSize.x);
            vm.OSDContainerHeight(containerSize.y);
            vm.OSDZoom(viewer.viewport.getZoom(true));
            var boundsRect = viewer.viewport.getBounds(true);
            vm.OSDBoundsX(boundsRect.x),
            vm.OSDBoundsY(boundsRect.y),
            vm.OSDBoundsWidth(boundsRect.width),
            vm.OSDBoundsHeight(boundsRect.height),

            vm.zoomFactor(imagingHelper.getZoomFactor());
            vm.viewportWidth(imagingHelper._viewportWidth);
            vm.viewportHeight(imagingHelper._viewportHeight);
            vm.viewportOriginX(imagingHelper._viewportOrigin.x);
            vm.viewportOriginY(imagingHelper._viewportOrigin.y);
            vm.viewportCenterX(imagingHelper._viewportCenter.x);
            vm.viewportCenterY(imagingHelper._viewportCenter.y);
        }
    }

    function updateImgViewerScreenCoordinatesVM() {
        if (vm.haveImage() && vm.haveMouse()) {
            var logX = imagingHelper.physicalToLogicalX(vm.mouseRelativeX());
            var logY = imagingHelper.physicalToLogicalY(vm.mouseRelativeY());
            vm.physicalToLogicalX(logX);
            vm.physicalToLogicalY(logY);
            vm.logicalToPhysicalX(imagingHelper.logicalToPhysicalX(logX));
            vm.logicalToPhysicalY(imagingHelper.logicalToPhysicalY(logY));
            var dataX = imagingHelper.physicalToDataX( vm.mouseRelativeX());
            var dataY = imagingHelper.physicalToDataY( vm.mouseRelativeY());
            vm.physicalToDataX(dataX);
            vm.physicalToDataY(dataY);
            vm.dataToPhysicalX(imagingHelper.dataToPhysicalX(dataX));
            vm.dataToPhysicalY(imagingHelper.dataToPhysicalY(dataY));
        }
    }

    function updateImgViewerDataCoordinatesVM() {
        if (vm.haveImage()) {
            vm.logicalToDataTLX(imagingHelper.logicalToDataX(0.0));
            vm.logicalToDataTLY(imagingHelper.logicalToDataY(0.0));
            vm.logicalToDataBRX(imagingHelper.logicalToDataX(1.0));
            vm.logicalToDataBRY(imagingHelper.logicalToDataY(1.0));
            vm.dataToLogicalTLX(imagingHelper.dataToLogicalX(0));
            vm.dataToLogicalTLY(imagingHelper.dataToLogicalY(0));
            vm.dataToLogicalBRX(imagingHelper.dataToLogicalX(imagingHelper.imgWidth));
            vm.dataToLogicalBRY(imagingHelper.dataToLogicalY(imagingHelper.imgHeight));
        }
    }

    var vm = {
        haveImage: ko.observable(false),
        haveMouse: ko.observable(false),
        imgWidth: ko.observable(0),
        imgHeight: ko.observable(0),
        imgAspectRatio: ko.observable(0),
        minZoom: ko.observable(0),
        maxZoom: ko.observable(0),
        OSDContainerWidth: ko.observable(0),
        OSDContainerHeight: ko.observable(0),
        OSDZoom: ko.observable(0),
        OSDBoundsX: ko.observable(0),
        OSDBoundsY: ko.observable(0),
        OSDBoundsWidth: ko.observable(0),
        OSDBoundsHeight: ko.observable(0),
        OSDMousePositionX: ko.observable(0),
        OSDMousePositionY: ko.observable(0),
        OSDElementOffsetX: ko.observable(0),
        OSDElementOffsetY: ko.observable(0),
        OSDMouseRelativeX: ko.observable(0),
        OSDMouseRelativeY: ko.observable(0),
        zoomFactor: ko.observable(0),
        viewportWidth: ko.observable(0),
        viewportHeight: ko.observable(0),
        viewportOriginX: ko.observable(0),
        viewportOriginY: ko.observable(0),
        viewportCenterX: ko.observable(0),
        viewportCenterY: ko.observable(0),
        mousePositionX: ko.observable(0),
        mousePositionY: ko.observable(0),
        elementOffsetX: ko.observable(0),
        elementOffsetY: ko.observable(0),
        mouseRelativeX: ko.observable(0),
        mouseRelativeY: ko.observable(0),
        physicalToLogicalX: ko.observable(0),
        physicalToLogicalY: ko.observable(0),
        logicalToPhysicalX: ko.observable(0),
        logicalToPhysicalY: ko.observable(0),
        physicalToDataX: ko.observable(0),
        physicalToDataY: ko.observable(0),
        dataToPhysicalX: ko.observable(0),
        dataToPhysicalY: ko.observable(0),
        logicalToDataTLX: ko.observable(0),
        logicalToDataTLY: ko.observable(0),
        logicalToDataBRX: ko.observable(0),
        logicalToDataBRY: ko.observable(0),
        dataToLogicalTLX: ko.observable(0),
        dataToLogicalTLY: ko.observable(0),
        dataToLogicalBRX: ko.observable(0),
        dataToLogicalBRY: ko.observable(0),
        annoGroupTransform: annoGroupTransform
    };
    ko.applyBindings(vm);

}());
