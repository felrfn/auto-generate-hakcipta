const path = require('path');
const fs = require('fs');
const { generatePernyataanCiptaan } = require('./pernyataan_ciptaan');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function runTests() {
    console.log("==============================================");
    console.log("  PREVIEW 7 SKENARIO PERNYATAAN CIPTAAN");
    console.log("==============================================");

    const outDocxDir = path.resolve(__dirname, '../output-docx');
    const outPdfDir = path.resolve(__dirname, '../output-pdf');
    const templatePath = path.resolve(
        __dirname,
        'surat-pernyataan-hak-cipta.docx'
    );

    fs.mkdirSync(outDocxDir, { recursive: true });
    fs.mkdirSync(outPdfDir, { recursive: true });

    console.log(`DOCX output: ${outDocxDir}`);
    console.log(`PDF output : ${outPdfDir}\n`);

    const baseData = {
        jenis_hak_cipta: "Buku",
        tanggal_pengisian: "6 Oktober 2026",
        tempat_pengisian: "Semarang"
    };

    // Skenario 1 - 7 dengan panjang judul_ciptaan yang bertahap
    const scenarios = [
        {
            name: "1. Judul Sangat Pendek",
            filename: "pernyataan-01-sangat-pendek",
            input: {
                ...baseData,
                judul_ciptaan: "Sistem Manajemen"
            },
        },
        {
            name: "2. Judul Pendek",
            filename: "pernyataan-02-pendek",
            input: {
                ...baseData,
                judul_ciptaan: "Sistem Informasi Manajemen Berbasis Web"
            },
        },
        {
            name: "3. Judul Sedang",
            filename: "pernyataan-03-sedang",
            input: {
                ...baseData,
                judul_ciptaan: "Sistem Informasi Manajemen Terintegrasi Untuk Pengelolaan Data Akademik Universitas"
            },
        },
        {
            name: "4. Judul Panjang",
            filename: "pernyataan-04-panjang",
            input: {
                ...baseData,
                judul_ciptaan: "Sistem Informasi Manajemen Terintegrasi Untuk Pengelolaan Data Akademik, Administrasi, Pelaporan, Monitoring Berbasis Web"
            },
        },
        {
            name: "5. Judul Sangat Panjang (Mulai Hapus Baris)",
            filename: "pernyataan-05-sangat-panjang",
            input: {
                ...baseData,
                judul_ciptaan: "Sistem Informasi Manajemen Terintegrasi Untuk Pengelolaan Data Akademik, Administrasi, Pelaporan, Monitoring, dan Evaluasi Berbasis Web Menggunakan React JS dan Node JS"
            },
        },
        {
            name: "6. Judul Ekstra Panjang",
            filename: "pernyataan-06-ekstra-panjang",
            input: {
                ...baseData,
                judul_ciptaan: "Pengembangan Sistem Informasi Manajemen Terintegrasi Untuk Pengelolaan Data Akademik, Administrasi, Pelaporan, Monitoring, dan Evaluasi Berbasis Web Menggunakan React JS, Node JS, MongoDB, dan Arsitektur Microservices Di Universitas Diponegoro Tahun 2026"
            },
        },
        {
            name: "7. Judul Maksimal Ekstrem",
            filename: "pernyataan-07-maksimal-ekstrem",
            input: {
                ...baseData,
                jenis_hak_cipta: "Lainnya",
                jenis_hak_cipta_lainnya: "Program Komputer Terapan",
                judul_ciptaan: "Pengembangan Sistem Informasi Manajemen Terintegrasi Untuk Pengelolaan Data Akademik, Administrasi, Pelaporan, Monitoring, dan Evaluasi Berbasis Web Menggunakan React JS, Node JS, MongoDB, dan Arsitektur Microservices Serta Artificial Intelligence Untuk Prediksi Kelulusan Tepat Waktu Mahasiswa Program Sarjana Fakultas Ilmu Komputer Universitas Diponegoro Semarang Jawa Tengah Indonesia"
            },
        }
    ];

    console.log("Running Scenario Tests...\n");

    for (const scenario of scenarios) {
        console.log("----------------------------------------------");
        console.log(scenario.name);
        console.log("----------------------------------------------");

        try {
            const input = JSON.parse(JSON.stringify(scenario.input));

            // Extraction test
            input._testMode = true;
            const data = await generatePernyataanCiptaan(input, templatePath, null, null);

            assert(data.judul_ciptaan, `${scenario.name}: judul_ciptaan tidak tersedia`);
            assert(data.jenis_ciptaan, `${scenario.name}: jenis_ciptaan tidak tersedia`);
            
            console.log("✓ Data extraction berhasil");

            // File generation test
            const inputGeneration = JSON.parse(JSON.stringify(scenario.input));
            const docxPath = path.join(outDocxDir, `${scenario.filename}.docx`);
            const pdfPath = path.join(outPdfDir, `${scenario.filename}.pdf`);

            await generatePernyataanCiptaan(inputGeneration, templatePath, docxPath, pdfPath);

            assert(fs.existsSync(docxPath), `${scenario.name}: DOCX tidak berhasil dibuat`);
            console.log(`✓ DOCX berhasil dibuat: ${scenario.filename}.docx`);

            if (fs.existsSync(pdfPath)) {
                console.log(`✓ PDF berhasil dibuat: ${scenario.filename}.pdf`);
            } else {
                console.log(`- PDF tidak dibuat pada skenario ini`);
            }

            console.log(`✓ ${scenario.name} berhasil (Panjang judul: ${scenario.input.judul_ciptaan.length} karakter)\n`);
        } catch (e) {
            console.error(`✗ ${scenario.name} gagal:`);
            console.error(e.message);
            throw e;
        }
    }

    console.log("==============================================");
    console.log("  SEMUA SKENARIO BERHASIL");
    console.log("==============================================");
}

runTests().catch((e) => {
    console.error("\nFATAL ERROR:");
    console.error(e.stack);
    process.exit(1);
});
