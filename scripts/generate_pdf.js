const markdownpdf = require("markdown-pdf")
const fs = require("fs")

const inputPath = "DOCUMENTACION.md"
const outputPath = "documentacion.pdf"

console.log(`Generando PDF desde ${inputPath} a ${outputPath}...`)

markdownpdf()
    .from(inputPath)
    .to(outputPath, function () {
        console.log("PDF creado exitosamente!")
    })
