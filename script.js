const downloadButton=document.getElementById('download')


// Load Monaco Editor using AMD loader
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.32.1/min/vs' } });

require(['vs/editor/editor.main'], function () {

    const htmlEditor = monaco.editor.create(document.getElementById('html-editor'), {
        value: '<!-- Your HTML code here -->',
        language: 'html',
        theme: 'vs-dark'
    });

    const cssEditor = monaco.editor.create(document.getElementById('css-editor'), {
        value: '/* Your CSS code here */',
        language: 'css',
        theme: 'vs-dark'
    });

    const jsEditor = monaco.editor.create(document.getElementById('js-editor'), {
        value: '// Your JavaScript code here',
        language: 'javascript',
        theme: 'vs-dark'
    });

    function updatePreview() {
        const htmlContent = htmlEditor.getValue();
        const cssContent = cssEditor.getValue();
        const jsContent = jsEditor.getValue();

        const iframe = document.getElementById('preview');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssContent}</style>
            </head>
            <body>
                ${htmlContent}
                <script>${jsContent}<\/script>
            </body>
            </html>
        `);
        iframeDoc.close();
    }

    // Update preview when content changes
    htmlEditor.onDidChangeModelContent(updatePreview);
    cssEditor.onDidChangeModelContent(updatePreview);
    jsEditor.onDidChangeModelContent(updatePreview);

    // Initial update of preview
    updatePreview();

    // Auto-closing tag implementation for HTML editor
    htmlEditor.onDidChangeModelContent((event) => {
        const model = htmlEditor.getModel();
        const changes = event.changes;

        // Check the last change if it involved a closing angle bracket
        const lastChange = changes[0];
        const text = lastChange.text;
        const position = lastChange.rangeOffset + text.length - 1;

        if (text === '>') {
            const fullText = model.getValue();
            const autoCloseText = autoClosing(fullText, position);

            if (autoCloseText) {
                const insertPosition = model.getPositionAt(position + 1);
                htmlEditor.executeEdits('', [{
                    range: new monaco.Range(insertPosition.lineNumber, insertPosition.column, insertPosition.lineNumber, insertPosition.column),
                    text: autoCloseText
                }]);
                htmlEditor.setPosition({
                    lineNumber: insertPosition.lineNumber,
                    column: insertPosition.column
                });
            }
        }
    });
    downloadButton.addEventListener('click',()=>{
        const htmlContent = htmlEditor.getValue();
        const cssContent = cssEditor.getValue();
        const jsContent = jsEditor.getValue();
        const fileName=prompt('Enter Filename:(default:index.html)')
        downloadFile(`${(fileName!==""?fileName:'index')}.html`,`
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="${fileName+'_style'}.css">
            </head>
            <body>
                ${htmlContent}
                <script src="${fileName+'_script'}.js"><\/script>
            </body>
            </html>
        `)
        downloadFile(`${fileName+'_style'}.css`,cssContent)
        downloadFile(`${fileName+'_script'}.js`,jsContent)
    })
    function downloadFile(file,content) {
        const blob=new Blob([content],{type:'text/plain'})
        const link=document.createElement('a')
        link.href=URL.createObjectURL(blob)
        link.download=file
        link.click()
    }
});

// Function for auto-closing tags
function autoClosing(text, pos) {
    if (text[pos] !== '>') return "";
    let i = pos - 1;
    while (i >= 0) {
        if (text[i] === '/') return "";
        if (text[i] === '<') {
            const newText = `</${text.substring(i + 1, pos)}>`;
            return newText;
        }
        i--;
    }
    return "";
}
