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

async function generatePermohonanCiptaan(input, templatePath, outputDocxPath, outputPdfPath) {
    try {
        // Data Pencipta
        const creators = input.pencipta || [];
        if (creators.length === 0) {
            throw new Error("Data pencipta tidak boleh kosong.");
        }

        // Ambil data dari pencipta pertama untuk field utama, kecuali semua_nama
        const firstCreator = creators[0];
        const semua_nama = creators.map(c => c.nama_pencipta).join("; ");
        const kewarganegaraan = firstCreator.kewarganegaraan || "Indonesia";
        const alamat_lengkap = firstCreator.alamat_lengkap || "-";
        
        // Handle fallback untuk telepon agar tidak kosong
        const telepon = firstCreator.telp_rumah ? firstCreator.telp_rumah : "-";
        const no_hp = firstCreator.no_hp ? firstCreator.no_hp : "-";
        const email = firstCreator.email ? firstCreator.email : "-";
        const no_hp_dan_email = `${no_hp} / ${email}`;

        // Handle jenis hak cipta
        let jenis_ciptaan = input.jenis_hak_cipta;
        if (jenis_ciptaan === "Lainnya" && input.jenis_hak_cipta_lainnya) {
            jenis_ciptaan = input.jenis_hak_cipta_lainnya;
        }

        // Handle link ciptaan (khusus video atau jika diisi)
        let link_ciptaan = "";
        if (input.link_ciptaan) {
            link_ciptaan = `\nLink: ${input.link_ciptaan}`;
        }

        // Siapkan data untuk docxtemplater
        const templateData = {
            semua_nama,
            kewarganegaraan,
            alamat_lengkap,
            telepon,
            no_hp_dan_email,
            jenis_ciptaan,
            judul_ciptaan: input.judul_ciptaan || "-",
            link_ciptaan,
            tempat_tanggal_diumumkan: `${input.tempat_diumumkan_ciptaan || "-"}, ${input.tanggal_ciptaan_diumumkan || "-"}`,
            tempat_tanggal_pengisian: `${input.tempat_pengisian || "-"}, ${input.tanggal_pengisian || "-"}`,
            uraian_ciptaan: input.uraian_ciptaan || "-"
        };

        // Export this payload if we want to unit test it directly without writing files
        if (input._testMode) {
            return templateData;
        }

        // Buka template DOCX
        const content = fs.readFileSync(path.resolve(templatePath), "binary");
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Render template dengan data
        doc.render(templateData);

        // Generate file baru
        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });
        
        // Buat folder DOCX jika belum ada
        const docxDir = path.dirname(outputDocxPath);
        if (!fs.existsSync(docxDir)) {
            fs.mkdirSync(docxDir, { recursive: true });
        }
        fs.writeFileSync(outputDocxPath, buf);

        // Konversi ke PDF jika diminta
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
        console.error("Error dalam generatePermohonanCiptaan:", error);
        throw error;
    }
}

module.exports = {
    generatePermohonanCiptaan
};
