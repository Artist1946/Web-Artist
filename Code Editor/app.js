require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' } });

let editor, models = {},
    current = 'html';

const defaults = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Creative Designer Button</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <a href="https://example.com" target="_blank" class="fancy-button">
        <svg class="icon" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L14 7M19 12L14 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="text">Server Designer</span>
    </a>

</body>
</html>
`,
    css: `/* CSS (style.css)@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap');

body {
    margin: 0;
    padding: 0;
    background: linear-gradient(145deg, #1a1a1a, #262626);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Montserrat', sans-serif;
}

.fancy-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 28px;
    background: linear-gradient(135deg, #6a0dad, #9b59b6);
    color: white;
    text-decoration: none;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(155, 89, 182, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
}

.fancy-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: skewX(-30deg);
    transition: left 0.6s ease;
}

.fancy-button:hover::before {
    left: 100%;
}

.fancy-button:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(155, 89, 182, 0.6);
}

.fancy-button .icon {
    width: 24px;
    height: 24px;
    stroke: white;
    flex-shrink: 0;
}

.fancy-button .text {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 1px;
}
`,
      javascript: `// JS (script.js) لا يوجد شيء يخص هذا المود `
};

function registerProviders() {
    monaco.languages.registerCompletionItemProvider('html', {
        provideCompletionItems: () => {
            const tags = ['div', 'span', 'h1', 'h2', 'p', 'a', 'button', 'img', 'ul', 'li', 'section'];
            const suggestions = tags.map(t => ({ label: `<${t}>`, kind: monaco.languages.CompletionItemKind.Snippet, insertText: `<${t}>$0</${t}>`, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet }));
            suggestions.push({ label: 'class', kind: monaco.languages.CompletionItemKind.Property, insertText: 'class="${1:classname}"', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet });
            return { suggestions };
        }
    });
    monaco.languages.registerCompletionItemProvider('css', {
        provideCompletionItems: () => {
            const props = ['display', 'flex', 'grid', 'padding', 'margin', 'background', 'color', 'border-radius', 'width', 'height'];
            return { suggestions: props.map(p => ({ label: p, kind: monaco.languages.CompletionItemKind.Property, insertText: p + ': ' })) };
        }
    });
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: () => {
            const list = [
                { label: 'console.log', kind: monaco.languages.CompletionItemKind.Function, insertText: 'console.log(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                { label: 'addEventListener', kind: monaco.languages.CompletionItemKind.Function, insertText: 'addEventListener("${1:event}", (e)=>{\n\t$0\n});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet }
            ];
            return { suggestions: list };
        }
    });
}

require(['vs/editor/editor.main'], function() {
    models.html = monaco.editor.createModel(localStorage.getItem('m_html') || defaults.html, 'html');
    models.css = monaco.editor.createModel(localStorage.getItem('m_css') || defaults.css, 'css');
    models.javascript = monaco.editor.createModel(localStorage.getItem('m_js') || defaults.javascript, 'javascript');

    editor = monaco.editor.create(document.getElementById('editor'), {
        model: models.html,
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false
    });

    const dom = editor.getDomNode();
    if (dom) dom.dir = 'ltr';

    registerProviders();

    models.html.onDidChangeContent(() => localStorage.setItem('m_html', models.html.getValue()));
    models.css.onDidChangeContent(() => localStorage.setItem('m_css', models.css.getValue()));
    models.javascript.onDidChangeContent(() => localStorage.setItem('m_js', models.javascript.getValue()));
});

// Tab switching
document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        const lang = t.dataset.lang;
        current = lang;
        if (editor && models[lang]) {
            editor.setModel(models[lang]);
            monaco.editor.setModelLanguage(models[lang], lang);
            const dom = editor.getDomNode();
            if (dom) dom.dir = 'ltr';
        }
    });
});

// Build preview document
function buildDoc() {
    const html = models.html.getValue();
    const css = models.css.getValue();
    const js = models.javascript.getValue();
    return `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
}

// Run preview -> load blob into iframe (preview on right)
document.getElementById('runBtn').addEventListener('click', () => {
    const doc = buildDoc();
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const iframe = document.getElementById('preview');
    iframe.src = url;
    iframe.onload = () => URL.revokeObjectURL(url);
});

// Open in new tab
document.getElementById('openNew').addEventListener('click', () => {
    const w = window.open();
    w.document.open();
    w.document.write(buildDoc());
    w.document.close();
});

// Downloads (single files)
function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

document.getElementById('downloadHtml').addEventListener('click', () => {
    const htmlContent = `<!doctype html>${buildDoc()}`;
    downloadFile(htmlContent, 'index.html', 'text/html');
});
document.getElementById('downloadCss').addEventListener('click', () => downloadFile(models.css.getValue(), 'style.css', 'text/css'));
document.getElementById('downloadJs').addEventListener('click', () => downloadFile(models.javascript.getValue(), 'script.js', 'application/javascript'));

// ZIP download (JSZip + FileSaver must be loaded in index.html)
document.getElementById('downloadZip').addEventListener('click', async() => {
    const zip = new JSZip();
    zip.file('index.html', `<!doctype html>${buildDoc()}`);
    zip.file('style.css', models.css.getValue());
    zip.file('script.js', models.javascript.getValue());
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'project.zip');
});

// initial preview
window.addEventListener('load', () => setTimeout(() => { try { document.getElementById('runBtn').click(); } catch (e) {} }, 600));
