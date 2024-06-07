document.addEventListener('DOMContentLoaded', () => {
    const templateUpload = document.getElementById('templateUpload');
    const spreadsheetUpload = document.getElementById('spreadsheetUpload');
    const fontUpload = document.getElementById('fontUpload');
    const fontSelect = document.getElementById('fontSelect');
    const colorPicker = document.getElementById('colorPicker');
    const downloadButton = document.getElementById('downloadButton');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const positionXInput = document.getElementById('positionXInput');
    const positionYInput = document.getElementById('positionYInput');
    const widthInput = document.getElementById('widthInput');
    const nameContainer = document.getElementById('nameContainer');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let templateImage = null;
    let names = [];

    fontUpload.addEventListener('change', handleFontUpload);
    templateUpload.addEventListener('change', handleTemplateUpload);
    spreadsheetUpload.addEventListener('change', handleSpreadsheetUpload);
    colorPicker.addEventListener('input', () => drawName('Sample Name'));
    fontSizeInput.addEventListener('input', () => drawName('Sample Name'));
    positionXInput.addEventListener('input', () => drawName('Sample Name'));
    positionYInput.addEventListener('input', () => drawName('Sample Name'));
    widthInput.addEventListener('input', () => drawName('Sample Name'));
    fontSelect.addEventListener('change', () => drawName('Sample Name'));
    downloadButton.addEventListener('click', downloadPDF);

    function handleFontUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const font = new FontFace(file.name, reader.result);
            font.load().then((loadedFont) => {
                document.fonts.add(loadedFont);
                const option = document.createElement('option');
                option.text = file.name;
                option.value = file.name;
                fontSelect.add(option);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function handleTemplateUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                templateImage = img;
                drawName('Sample Name');
            };
        };
        reader.readAsDataURL(file);
    }

    function handleSpreadsheetUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const data = new Uint8Array(reader.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            names = XLSX.utils.sheet_to_json(sheet, {header: 1}).flat();
        };
        reader.readAsArrayBuffer(file);
    }

    function drawName(name = 'Sample Name') {
        if (!templateImage) return;
        const currentFontSize = parseInt(fontSizeInput.value, 10);
        const currentX = parseInt(positionXInput.value, 10);
        const currentY = parseInt(positionYInput.value, 10);
        const currentWidth = parseInt(widthInput.value, 10);
        const currentColor = colorPicker.value;
        const selectedFont = fontSelect.value;

        // Clear and redraw the canvas with the template image
        canvas.width = templateImage.width;
        canvas.height = templateImage.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImage, 0, 0);

        // Update the name container's style
        nameContainer.className = '';
        nameContainer.classList.add(selectedFont === 'PinyonScript' ? 'pinyon-script-regular' : selectedFont);
        nameContainer.style.left = `${currentX}px`;
        nameContainer.style.top = `${currentY}px`;
        nameContainer.style.width = `${currentWidth}px`;
        nameContainer.style.fontSize = `${currentFontSize}px`;
        nameContainer.style.color = currentColor;

        // Set the name text in the container
        nameContainer.textContent = name;
        nameContainer.style.display = 'block'; // Make it visible for text measurement

        // Draw the name text centered on the canvas
        ctx.font = `${currentFontSize}px ${selectedFont === 'PinyonScript' ? 'Pinyon Script' : selectedFont}`;
        ctx.fillStyle = currentColor;
        ctx.textAlign = 'center';
        ctx.fillText(name, currentX + currentWidth / 2, currentY + currentFontSize);

        nameContainer.style.display = 'none'; // Hide the container again
    }

    async function downloadPDF() {
        const { jsPDF } = window.jspdf;

        for (let i = 0; i < names.length; i++) {
            const name = names[i];

            drawName(name);

            // Introduce a delay using a promise
            await new Promise(resolve => setTimeout(resolve, 500));

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${name}.pdf`);
        }
    }

    // Draw initial sample name
    drawName('Sample Name');
});
