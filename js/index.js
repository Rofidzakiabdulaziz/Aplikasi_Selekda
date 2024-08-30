window.onload = function() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let zoomLevel = 100;
    const zoomPercent = document.getElementById('zoom-percent');
    let undoCounter = 0;
    let redoCounter = 0;

    // Initialize Canvas
    function initCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Export Canvas to Image
    function exportImage() {
        const dataURL = canvas.toDataURL('image/jpeg');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'drawing.jpg';
        link.click();
    }

    // Import Image to Canvas
    function importImage() {
        const input = document.getElementById('file-input');
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        input.click(); // Trigger file input dialog
    }

    // Zoom In
    function zoomIn() {
        zoomLevel = Math.min(zoomLevel + 10, 200);
        zoomPercent.textContent = zoomLevel + '%';
        canvas.style.transform = `scale(${zoomLevel / 100})`;
    }

    // Zoom Out
    function zoomOut() {
        zoomLevel = Math.max(zoomLevel - 10, 10);
        zoomPercent.textContent = zoomLevel + '%';
        canvas.style.transform = `scale(${zoomLevel / 100})`;
    }

    // Undo Action
    function undo() {
        if (undoCounter > 0) {
            undoCounter--;
            updateUndoRedoCounters();
            // Implement undo functionality here
        }
    }
    // Redo Action
    function redo() {
        if (redoCounter > 0) {
            redoCounter--;
            updateUndoRedoCounters();
            // Implement redo functionality here
        }
    }

    // Update Undo/Redo Counters
    function updateUndoRedoCounters() {
        const undoElement = document.getElementById('undo');
        const redoElement = document.getElementById('redo');
        
        if (undoElement && redoElement) {
            undoElement.textContent = `Undo (${undoCounter})`;
            redoElement.textContent = `Redo (${redoCounter})`;
        }
    }

    // Variables to keep track of the selected tool and its properties
    let activeTool = null;
    const tools = {
        brush: 'brush-tool',
        eraser: 'eraser-tool',
        move: 'move-tool',
        shape: 'shape-tool',
        colorPicker: 'color-picker',
        paintBucket: 'paint-bucket',
        text: 'text-tool',
        cloneStamp: 'clone-stamp',
        selection: 'selection-tool'
    };

    // Tool Selection Handlers
    function selectTool(tool) {
        setActiveTool(tool);
        console.log(`${tool} selected`);
    }

    // Utility function to set the active tool and update UI
    function setActiveTool(toolName) {
        // Remove active class from all tool buttons
        Object.values(tools).forEach(toolId => {
            document.getElementById(toolId).classList.remove('active');
        });

        // Add active class to the selected tool button
        const selectedTool = document.getElementById(toolName);
        if (selectedTool) {
            selectedTool.classList.add('active');
        }

        // Update the active tool variable
        activeTool = toolName;

        // Optionally: Update canvas or other UI elements based on the selected tool
        updateCanvasForActiveTool();
    }

    // Example function to update canvas based on the selected tool
    function updateCanvasForActiveTool() {
        if (activeTool === tools.brush) {
            // Set up canvas for brush tool
        } else if (activeTool === tools.eraser) {
            // Set up canvas for eraser tool
        }
        // Add additional tool setups as needed
    }

    // Event Listeners
    document.getElementById('export-image').onclick = exportImage;
    document.getElementById('import-image').onclick = importImage;
    document.getElementById('zoom-in').onclick = zoomIn;
    document.getElementById('zoom-out').onclick = zoomOut;
    document.getElementById('undo').onclick = undo;
    document.getElementById('redo').onclick = redo;

    // Assign event listeners to tool buttons
    Object.keys(tools).forEach(tool => {
        const toolElement = document.getElementById(tools[tool]);
        if (toolElement) {
            toolElement.onclick = () => selectTool(tools[tool]);
        }
    });

    initCanvas();
};

window.onload = function() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let zoomLevel = 100;
    let isDragging = false;
    let startX, startY;
    const zoomPercent = document.getElementById('zoom-percent');
    let undoCounter = 0;
    let redoCounter = 0;
    let activeTool = null;
    let isTextWriting = false;
    let textInput;

    const tools = {
        brush: 'brush-tool',
        eraser: 'eraser-tool',
        move: 'move-tool',
        shape: 'shape-tool',
        colorPicker: 'color-picker',
        paintBucket: 'paint-bucket',
        text: 'text-tool',
        cloneStamp: 'clone-stamp',
        selection: 'selection-tool'
    };

    // Initialize Canvas
    function initCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Create Text Input
    function createTextInput(x, y) {
        textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.style.position = 'absolute';
        textInput.style.left = `${x}px`;
        textInput.style.top = `${y}px`;
        textInput.style.fontSize = '16px';
        textInput.style.border = 'none';
        textInput.style.outline = 'none';
        textInput.style.background = 'transparent';
        textInput.style.color = 'black';
        document.body.appendChild(textInput);
        textInput.focus();

        textInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                drawTextOnCanvas(textInput.value, x, y);
                document.body.removeChild(textInput);
                textInput = null;
                isTextWriting = false;
            }
        });

        textInput.addEventListener('blur', function () {
            if (textInput) {
                drawTextOnCanvas(textInput.value, x, y);
                document.body.removeChild(textInput);
                textInput = null;
                isTextWriting = false;
            }
        });
    }

    // Draw Text on Canvas
    function drawTextOnCanvas(text, x, y) {
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(text, x - canvas.offsetLeft, y - canvas.offsetTop);
    }

    // Tool Selection
    function selectTool(tool) {
        setActiveTool(tool);
        console.log(`${tool} selected`);
    }

    // Set Active Tool
    function setActiveTool(toolName) {
        Object.values(tools).forEach(toolId => {
            document.getElementById(toolId).classList.remove('active');
        });

        const selectedTool = document.getElementById(toolName);
        if (selectedTool) {
            selectedTool.classList.add('active');
        }

        activeTool = toolName;
        updateCanvasForActiveTool();
    }

    // Update Canvas for Active Tool
    function updateCanvasForActiveTool() {
        if (activeTool === tools.text) {
            canvas.style.cursor = 'text';
        } else {
            canvas.style.cursor = 'grab';
        }
    }

    // Event Listeners
    canvas.addEventListener('mousedown', (e) => {
        if (activeTool === tools.text && !isTextWriting) {
            isTextWriting = true;
            createTextInput(e.clientX, e.clientY);
        }
    });

    document.getElementById('export-image').onclick = exportImage;
    document.getElementById('import-image').onclick = importImage;
    document.getElementById('zoom-in').onclick = zoomIn;
    document.getElementById('zoom-out').onclick = zoomOut;
    document.getElementById('undo').onclick = undo;
    document.getElementById('redo').onclick = redo;

    Object.keys(tools).forEach(tool => {
        const toolElement = document.getElementById(tools[tool]);
        if (toolElement) {
            toolElement.onclick = () => selectTool(tools[tool]);
        }
    });

    initCanvas();
};

