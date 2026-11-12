const path = require('path');
const fs = require('fs');
const { generatePengalihanCiptaan } = require('./pengalihan_ciptaan');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// Helper untuk membuat dummy pencipta berdasarkan jumlah/order
function createDummyCreators(count) {
    const list = [];
    for (let i = 1; i <= count; i++) {
        list.push({
            nama_pencipta: `Pencipta Ke-${i}, S.Kom.`,
            nik: `337400000000000${i}`,
            alamat_lengkap: `Jl. Prof. Soedarto No. ${i}, Tembalang, Semarang`,
            kode_pos: "50275",
            no_hp: `08123456780${i}`,
            email: `pencipta${i}@undip.ac.id`,
            kewarganegaraan: "Indonesia"
        });
    }
    return list;
}

async function runTests() {
    console.log("==============================================");
    console.log("   SURAT PENGALIHAN HAK CIPTA TEST");
    console.log("==============================================");

    const outDocxDir = path.resolve(__dirname, '../output-docx');
    const outPdfDir = path.resolve(__dirname, '../output-pdf');
    const templatePath = path.resolve(
        __dirname,
        'surat-pengalihan-hak-cipta.docx'
    );

    fs.mkdirSync(outDocxDir, { recursive: true });
    fs.mkdirSync(outPdfDir, { recursive: true });

    console.log(`DOCX output: ${outDocxDir}`);
    console.log(`PDF output : ${outPdfDir}\n`);

    const baseData = {
        jenis_hak_cipta: "Program Komputer",
        judul_ciptaan: "Sistem Informasi Inventaris Teak Wood (WoodStock)",
        tempat_pengisian: "Semarang",
        tanggal_pengisian: "7 Oktober 2026",
    };

    // Skenario Pencipta Ganjil: 1, 3, 5, 7, 9
    const oddCounts = [1, 3, 5, 7, 9];
    const scenarios = oddCounts.map((count) => ({
        name: `${count}. ${count} Pencipta (Ganjil)`,
        filename: `pengalihan-test-${String(count).padStart(2, '0')}-${count}-pencipta`,
        input: {
            ...baseData,
            pencipta: createDummyCreators(count)
        }
    }));

    console.log("Running Odd Creators Scenario Tests...\n");

    for (const scenario of scenarios) {
        console.log("----------------------------------------------");
        console.log(scenario.name);
        console.log("----------------------------------------------");

        try {
            const input = JSON.parse(JSON.stringify(scenario.input));

            // Test Extraction Mode
            input._testMode = true;
            const data = await generatePengalihanCiptaan(
                input,
                templatePath,
                null,
                null
            );

            assert(data.pencipta && data.pencipta.length > 0, `${scenario.name}: Data pencipta kosong`);
            assert(data.pencipta[0].is_author_1 === true, `${scenario.name}: Pencipta 1 harusMemiliki is_author_1 = true`);
            assert(data.pencipta[0].author_order === 1, `${scenario.name}: Pencipta 1 harusMemiliki author_order = 1`);

            // Verifikasi untuk pencipta ke-2 dst (jika ada)
            if (data.pencipta.length > 1) {
                for (let i = 1; i < data.pencipta.length; i++) {
                    assert(data.pencipta[i].is_author_1 === false, `${scenario.name}: Pencipta ke-${i + 1} harus is_author_1 = false`);
                    assert(data.pencipta[i].author_order === i + 1, `${scenario.name}: author_order pencipta ke-${i + 1} salah`);
                }
            }

            console.log("✓ Data extraction & tagging author_order berhasil");

            // Test File Generation
            const inputGeneration = JSON.parse(JSON.stringify(scenario.input));
            const docxPath = path.join(outDocxDir, `${scenario.filename}.docx`);
            const pdfPath = path.join(outPdfDir, `${scenario.filename}.pdf`);

            await generatePengalihanCiptaan(
                inputGeneration,
                templatePath,
                docxPath,
                pdfPath
            );

            assert(fs.existsSync(docxPath), `${scenario.name}: File DOCX tidak berhasil dibuat`);
            console.log(`✓ DOCX berhasil dibuat`);

            if (fs.existsSync(pdfPath)) {
                console.log(`✓ PDF berhasil dibuat`);
            } else {
                console.log(`- PDF tidak dibuat pada skenario ini`);
            }

            console.log(`✓ ${scenario.name} BERHASIL\n`);

        } catch (e) {
            console.error(`✗ ${scenario.name} GAGAL:`);
            console.error(e.message);
            throw e;
        }
    }

    console.log("==============================================");
    console.log("  SEMUA SKENARIO GANJIL (1-9) BERHASIL");
    console.log("==============================================");
}

runTests().catch((e) => {
    console.error("\nFATAL ERROR:");
    console.error(e.stack);
    process.exit(1);
}); 