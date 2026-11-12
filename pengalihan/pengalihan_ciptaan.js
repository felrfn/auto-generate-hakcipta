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

async function generatePengalihanCiptaan(input, templatePath, outputDocxPath, outputPdfPath) {
    try {
        const rawCreators = input.pencipta || [];
        if (rawCreators.length === 0) {
            throw new Error("Data pencipta tidak boleh kosong.");
        }

        // Olah data pencipta dan sediakan flag author_order serta is_author_1
        const pencipta = rawCreators.map((c, index) => {
            const author_order = index + 1;
            const is_author_1 = author_order === 1;

            const no_hp = c.no_hp || "-";
            const email = c.email || "-";

            return {
                ...c,
                author_order,
                is_author_1,
                nama_lengkap: c.nama_pencipta || c.nama_lengkap || "-",
                nik: c.nik || "-",
                alamat_lengkap: c.alamat_lengkap || "-",
                kode_pos: c.kode_pos || "",
                email,
                no_hp
            };
        });

        // Handle jenis hak cipta
        let jenis_ciptaan = input.jenis_hak_cipta || input.jenis_ciptaan || "-";
        if (jenis_ciptaan === "Lainnya" && input.jenis_hak_cipta_lainnya) {
            jenis_ciptaan = input.jenis_hak_cipta_lainnya;
        }

        const templateData = {
            pencipta,
            jenis_ciptaan,
            judul_ciptaan: input.judul_ciptaan || "-",
            tempat_tanggal_pengisian: `${input.tempat_pengisian || "Semarang"}, ${input.tanggal_pengisian || "-"}`
        };

        // Output mode test extraction jika diperlukan
        if (input._testMode) {
            return templateData;
        }

        // Read DOCX template
        const content = fs.readFileSync(path.resolve(templatePath), "binary");
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Render template
        doc.render(templateData);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        // Simpan DOCX
        const docxDir = path.dirname(outputDocxPath);
        if (!fs.existsSync(docxDir)) {
            fs.mkdirSync(docxDir, { recursive: true });
        }
        fs.writeFileSync(outputDocxPath, buf);

        // Convert ke PDF jika dimintai
        if (outputPdfPath) {
            try {
                const pdfBuf = await convertToPdf(buf, ".pdf", undefined);
                const pdfDir = path.dirname(outputPdfPath);
                if (!fs.existsSync(pdfDir)) {
                    fs.mkdirSync(pdfDir, { recursive: true });
                }
                fs.writeFileSync(outputPdfPath, pdfBuf);
            } catch (err) {
                console.warn("\n[Warning] Gagal mengonversi ke PDF. Error:", err.message);
            }
        }

        return { success: true, docx: outputDocxPath, pdf: outputPdfPath };

    } catch (error) {
        console.error("Error dalam generatePengalihanCiptaan:", error);
        throw error;
    }
}

module.exports = {
    generatePengalihanCiptaan
};