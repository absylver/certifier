document.addEventListener('DOMContentLoaded', () => {
    const templateUpload = document.getElementById('templateUpload');
    const spreadsheetUpload = document.getElementById('spreadsheetUpload');
    const fontUpload = document.getElementById('fontUpload');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const fontSelect = document.getElementById('fontSelect');
    const colorPicker = document.getElementById('colorPicker');
    const downloadButton = document.getElementById('downloadButton');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const positionXInput = document.getElementById('positionXInput');
    const positionYInput = document.getElementById('positionYInput');
    const widthInput = document.getElementById('widthInput');
    const nameContainer = document.getElementById('nameContainer');

    let templateImage = null;
    let names = [];

    fontUpload.addEventListener('change', handleFontUpload);
    templateUpload.addEventListener('change', handleTemplateUpload);
    spreadsheetUpload.addEventListener('change', handleSpreadsheetUpload);
    colorPicker.addEventListener('input', () => drawCertificate('Sample Name'));
    fontSizeInput.addEventListener('input', () => drawCertificate('Sample Name'));
    positionXInput.addEventListener('input', () => drawCertificate('Sample Name'));
    positionYInput.addEventListener('input', () => drawCertificate('Sample Name'));
    widthInput.addEventListener('input', () => drawCertificate('Sample Name'));
    fontSelect.addEventListener('change', () => drawCertificate('Sample Name'));
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
                drawCertificate('Sample Name');
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

    function drawCertificate(name = 'Sample Name') {
        if (!templateImage) return;
        const currentFontSize = parseInt(fontSizeInput.value, 10);
        const currentX = parseInt(positionXInput.value, 10);
        const currentY = parseInt(positionYInput.value, 10);
        const currentWidth = parseInt(widthInput.value, 10);
        const currentColor = colorPicker.value;
        const selectedFont = fontSelect.value || 'Arial';

        canvas.width = templateImage.width;
        canvas.height = templateImage.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImage, 0, 0);

        // Update name container styles and content
        nameContainer.style.fontSize = `${currentFontSize}px`;
        nameContainer.style.top = `${currentY}px`;
        nameContainer.style.left = `${currentX}px`;
        nameContainer.style.width = `${currentWidth}px`;
        nameContainer.style.fontFamily = selectedFont;
        nameContainer.style.color = currentColor;
        nameContainer.textContent = name;

        // Draw text on the canvas
        ctx.font = `${currentFontSize}px ${selectedFont}`;
        ctx.fillStyle = currentColor;
        ctx.textAlign = 'center';
        ctx.fillText(name, currentX + currentWidth / 2, currentY + currentFontSize / 2);
    }

    async function downloadPDF() {
        const { jsPDF } = window.jspdf;
        for (let name of names) {
            drawCertificate(name);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${name}.pdf`);
        }
    }
});
