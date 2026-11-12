const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const libre = require("libreoffice-convert");

const convertToPdf = (buf, ext, filter) => {
    return new Promise((resolve, reject) => {
        libre.convert(buf, ext, filter, (err, done) => {
            if (err) return reject(err);
            resolve(done);
        });
    });
};

async function generatePernyataanCiptaan(input, templatePath, outputDocxPath, outputPdfPath) {
    try {
        let jenis_ciptaan = input.jenis_hak_cipta;
        if (jenis_ciptaan === "Lainnya" && input.jenis_hak_cipta_lainnya) {
            jenis_ciptaan = input.jenis_hak_cipta_lainnya;
        }

        const templateData = {
            jenis_ciptaan,
            judul_ciptaan: input.judul_ciptaan || "-",
            tempat_tanggal_pengisian: `${input.tempat_pengisian || "-"}, ${input.tanggal_pengisian || "-"}`
        };

        if (input._testMode) {
            return templateData;
        }

        const content = fs.readFileSync(path.resolve(templatePath), "binary");
        const zip = new PizZip(content);

        // LOGIC FOR REMOVING END LINES IF JUDUL CIPTAAN IS LONG
        let xml = zip.file("word/document.xml").asText();
        
        // Find all paragraphs
        const paras = xml.match(/<w:p(?:\s[^>]*)?>.*?<\/w:p>/g);
        if (paras) {
            let idxMestinya = paras.findIndex(p => p.includes("sebagaimana mestinya."));
            let idxTempat = paras.findIndex(p => p.includes("{tempat_tanggal_pengisian}"));
            let idxMaterai = paras.findIndex(p => p.includes("Materai 10.000"));
            let idxProf = paras.findIndex(p => p.includes("Prof. Dr. Suharnomo"));

            let toRemove = [];
            let judulLen = (input.judul_ciptaan || "").length;
            
            // For every 50 characters above 10 characters, we remove one line to prevent 2nd page overflow
            let linesToRemove = Math.max(0, Math.floor((judulLen - 10) / 50)); 
            
            if (linesToRemove > 0) {
                // 1. Between mestinya and tempat
                if (idxMestinya !== -1 && idxTempat !== -1) {
                    for (let i = idxMestinya + 1; i < idxTempat; i++) {
                        if (!paras[i].includes("<w:t")) toRemove.push(i);
                    }
                }
                
                // 2. Between tempat and Materai
                if (idxTempat !== -1 && idxMaterai !== -1) {
                    for (let i = idxTempat + 1; i < idxMaterai; i++) {
                        if (!paras[i].includes("<w:t")) toRemove.push(i);
                    }
                }

                // 3. Between Materai and Prof
                if (idxMaterai !== -1 && idxProf !== -1) {
                    for (let i = idxMaterai + 1; i < idxProf; i++) {
                        if (!paras[i].includes("<w:t")) toRemove.push(i);
                    }
                }
                
                // Remove the lines from the XML
                toRemove.slice(0, linesToRemove).forEach(idx => {
                    xml = xml.replace(paras[idx], '');
                });
                
                zip.file("word/document.xml", xml);
            }
        }

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render(templateData);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });
        
        const docxDir = path.dirname(outputDocxPath);
        if (!fs.existsSync(docxDir)) {
            fs.mkdirSync(docxDir, { recursive: true });
        }
        fs.writeFileSync(outputDocxPath, buf);

        if (outputPdfPath) {
            try {
                const pdfBuf = await convertToPdf(buf, ".pdf", undefined);
                const pdfDir = path.dirname(outputPdfPath);
                if (!fs.existsSync(pdfDir)) {
                    fs.mkdirSync(pdfDir, { recursive: true });
                }
                fs.writeFileSync(outputPdfPath, pdfBuf);
            } catch (err) {
                console.warn("\n[Warning] Gagal mengonversi ke PDF (pastikan libreoffice terinstal di sistem Anda). Error:", err.message);
            }
        }

        return { success: true, docx: outputDocxPath, pdf: outputPdfPath };

    } catch (error) {
        console.error("Error dalam generatePernyataanCiptaan:", error);
        throw error;
    }
}

module.exports = {
    generatePernyataanCiptaan
};
