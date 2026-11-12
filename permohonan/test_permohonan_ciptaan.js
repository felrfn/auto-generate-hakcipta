const path = require('path');
const fs = require('fs');
const { generatePermohonanCiptaan } = require('./permohonan_ciptaan');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function runTests() {
    console.log("==============================================");
    console.log("  PERMOHONAN PENDAFTARAN CIPTAAN TEST");
    console.log("==============================================");

    const outDocxDir = path.resolve(__dirname, '../output-docx');
    const outPdfDir = path.resolve(__dirname, '../output-pdf');
    const templatePath = path.resolve(
        __dirname,
        'surat-permohonan-pendaftaran-ciptaan.docx'
    );

    fs.mkdirSync(outDocxDir, { recursive: true });
    fs.mkdirSync(outPdfDir, { recursive: true });

    console.log(`DOCX output: ${outDocxDir}`);
    console.log(`PDF output : ${outPdfDir}\n`);

    const baseData = {
        jenis_hak_cipta: "Buku",
        judul_ciptaan: "Sistem Informasi Manajemen Berbasis Web",
        tempat_diumumkan_ciptaan: "Semarang",
        tanggal_ciptaan_diumumkan: "1 Oktober 2026",
        tanggal_pengisian: "6 Oktober 2026",
        tempat_pengisian: "Semarang",
        uraian_ciptaan:
            "Sebuah sistem informasi manajemen yang dibangun dengan React dan Node.js.",
    };

    const pencipta1 = {
        status: "Dosen",
        nama_pencipta: "Dr. Budi Santoso, S.Kom., M.Kom.",
        nik: "3374123456789012",
        nip_nim: "198001012005011001",
        fakultas: "Fakultas Ilmu Komputer",
        no_hp: "081234567890",
        telp_rumah: "024-123456",
        email: "budi.santoso@univ.ac.id",
        alamat_lengkap: "Jl. Imam Bonjol No. 207, Semarang",
        kode_pos: "50131",
        kewarganegaraan: "Indonesia",
    };

    const pencipta2 = {
        status: "Mahasiswa",
        nama_pencipta: "Andi Saputra, S.Kom.",
        nik: "3374123456789013",
        nip_nim: "24060120120011",
        fakultas: "Fakultas Ilmu Komputer",
        no_hp: "085678901234",
        telp_rumah: "024-654321",
        email: "andi.saputra@mhs.univ.ac.id",
        alamat_lengkap: "Jl. Pemuda No. 100, Semarang",
        kode_pos: "50132",
        kewarganegaraan: "Indonesia",
    };

    const pencipta3 = {
        status: "Mahasiswa",
        nama_pencipta: "Siti Aminah",
        nik: "3374123456789014",
        nip_nim: "24060120120012",
        fakultas: "Fakultas Ilmu Komputer",
        no_hp: "087890123456",
        email: "siti.aminah@mhs.univ.ac.id",
        alamat_lengkap: "Jl. Pandanaran No. 50, Semarang",
        kode_pos: "50133",
        kewarganegaraan: "Indonesia",
    };

    const scenarios = [
        {
            name: "1. Satu Pencipta",
            filename: "permohonan-test-01-satu-pencipta",
            input: {
                ...baseData,
                pencipta: [pencipta1],
            },
        },

        {
            name: "2. Tiga Pencipta",
            filename: "permohonan-test-02-tiga-pencipta",
            input: {
                ...baseData,
                pencipta: [
                    pencipta1,
                    pencipta2,
                    pencipta3,
                ],
            },
        },

        {
            name: "3. Video dengan Link",
            filename: "permohonan-test-03-video-link",
            input: {
                ...baseData,
                jenis_hak_cipta: "Karya Rekaman Video",
                judul_ciptaan:
                    "Video Dokumentasi Sistem Informasi Manajemen Berbasis Web",
                link_ciptaan:
                    "https://youtube.com/watch?v=123456789",
                pencipta: [pencipta1],
            },
        },

        {
            name: "4. Uraian Panjang Banget",
            filename: "permohonan-test-04-uraian-panjang",
            input: {
                ...baseData,
                judul_ciptaan:
                    "Sistem Informasi Manajemen Terintegrasi untuk Pengelolaan Data Akademik, Administrasi, Pelaporan, Monitoring, dan Evaluasi Berbasis Web",
                uraian_ciptaan: `
Sistem informasi ini merupakan sebuah perangkat lunak berbasis web yang dirancang untuk membantu proses pengelolaan data dan informasi secara terintegrasi dalam suatu organisasi atau institusi. Sistem dibangun dengan pendekatan modular sehingga setiap bagian aplikasi dapat dikembangkan, digunakan, dipelihara, dan dikembangkan lebih lanjut secara terpisah tanpa mengganggu keseluruhan fungsi sistem. Sistem memiliki beberapa komponen utama yang mencakup pengelolaan pengguna, pengelolaan data master, pengelolaan transaksi, pencatatan aktivitas, penyajian informasi, pelaporan, serta pemantauan terhadap proses yang sedang berjalan.

Pada bagian pengelolaan pengguna, sistem menyediakan mekanisme autentikasi dan otorisasi sehingga setiap pengguna dapat mengakses fitur sesuai dengan hak akses yang telah ditentukan. Administrator dapat melakukan pengelolaan data pengguna, mengatur peran pengguna, melakukan perubahan informasi akun, serta memantau aktivitas pengguna dalam sistem. Mekanisme tersebut digunakan untuk membatasi akses terhadap data dan fungsi tertentu sehingga informasi yang tersedia dapat dikelola secara lebih terstruktur dan aman.

Sistem juga menyediakan modul pengelolaan data master yang digunakan untuk menyimpan berbagai informasi dasar yang diperlukan oleh modul lainnya. Data tersebut dapat berupa data organisasi, data pengguna, data kategori, data periode, data unit kerja, maupun data lain yang diperlukan sesuai kebutuhan implementasi. Setiap data dapat ditambahkan, diperbarui, ditampilkan, dan dihapus berdasarkan hak akses pengguna. Validasi dilakukan terhadap data yang dimasukkan untuk mengurangi kemungkinan terjadinya kesalahan atau inkonsistensi data.

Pada bagian transaksi, sistem memungkinkan pengguna untuk melakukan pencatatan dan pengelolaan aktivitas operasional. Setiap transaksi yang dibuat akan disimpan ke dalam basis data dan dapat digunakan sebagai sumber informasi untuk proses berikutnya. Sistem menyediakan fitur pencarian, penyaringan, pengurutan, serta pemantauan status sehingga pengguna dapat menemukan informasi yang dibutuhkan dengan lebih cepat. Data transaksi juga dapat digunakan sebagai dasar dalam proses pembuatan laporan dan evaluasi.

Sistem menggunakan basis data relasional untuk menyimpan informasi secara terstruktur. Hubungan antarentitas direpresentasikan melalui struktur tabel dan relasi sehingga data dapat dikelola secara konsisten. Proses komunikasi antara aplikasi dengan basis data dilakukan melalui lapisan akses data yang bertanggung jawab dalam proses pengambilan, penyimpanan, perubahan, dan penghapusan data. Dengan pendekatan tersebut, logika aplikasi dapat dipisahkan dari struktur penyimpanan data.

Pada sisi antarmuka, sistem menyediakan halaman yang dapat digunakan melalui peramban web pada perangkat komputer maupun perangkat lain yang mendukung teknologi web. Antarmuka dirancang agar pengguna dapat memahami fungsi yang tersedia dan melakukan pekerjaan administratif tanpa harus melakukan konfigurasi teknis secara langsung. Informasi penting ditampilkan dalam bentuk tabel, formulir, kartu informasi, grafik, maupun komponen antarmuka lainnya sesuai dengan kebutuhan masing-masing modul.

Sistem juga menyediakan mekanisme pelaporan yang memungkinkan pengguna memperoleh informasi berdasarkan data yang telah tersimpan. Laporan dapat digunakan untuk kebutuhan dokumentasi, monitoring, evaluasi, maupun pengambilan keputusan. Informasi yang ditampilkan dalam laporan dapat disaring berdasarkan periode, kategori, status, pengguna, maupun parameter lain yang relevan.

Selain fungsi utama tersebut, sistem dirancang dengan mempertimbangkan aspek pemeliharaan dan pengembangan lebih lanjut. Struktur perangkat lunak dibuat agar modul baru dapat ditambahkan tanpa harus melakukan perubahan besar terhadap modul yang sudah tersedia. Pendekatan ini memungkinkan sistem untuk terus dikembangkan sesuai dengan perubahan kebutuhan pengguna dan perkembangan proses bisnis organisasi.

Secara keseluruhan, sistem informasi ini ditujukan untuk meningkatkan efisiensi pengelolaan data, mengurangi proses pencatatan manual, meningkatkan keteraturan informasi, membantu proses monitoring, serta menyediakan informasi yang dapat digunakan sebagai dasar dalam proses administrasi dan pengambilan keputusan.
                `.trim(),
                pencipta: [pencipta1],
            },
        },

        {
            name: "5. Tanpa No Telepon",
            filename: "permohonan-test-05-tanpa-no-telp",
            input: {
                ...baseData,
                pencipta: [
                    {
                        ...pencipta1,
                        no_hp: "",
                        telp_rumah: "",
                    },
                ],
            },
        },

        {
            name: "6. Alamat Panjang Banget",
            filename: "permohonan-test-06-alamat-panjang",
            input: {
                ...baseData,
                pencipta: [
                    {
                        ...pencipta1,
                        alamat_lengkap:
                            "Jl. Raya Pendidikan Nomor 207, RT 004 RW 006, Kelurahan Sekaran, Kecamatan Gunungpati, Kota Semarang, Provinsi Jawa Tengah, Indonesia, berlokasi di kawasan sekitar lingkungan kampus dan permukiman warga dengan akses menuju jalan utama melalui Jalan Taman Siswa dan Jalan Kalimasada",
                        kode_pos: "50229",
                    },
                ],
            },
        },
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

            const data = await generatePermohonanCiptaan(
                input,
                templatePath,
                null,
                null
            );

            assert(
                data.semua_nama,
                `${scenario.name}: semua_nama tidak tersedia`
            );

            console.log("✓ Data extraction berhasil");

            // File generation test
            const inputGeneration = JSON.parse(
                JSON.stringify(scenario.input)
            );

            const docxPath = path.join(
                outDocxDir,
                `${scenario.filename}.docx`
            );

            const pdfPath = path.join(
                outPdfDir,
                `${scenario.filename}.pdf`
            );

            await generatePermohonanCiptaan(
                inputGeneration,
                templatePath,
                docxPath,
                pdfPath
            );

            assert(
                fs.existsSync(docxPath),
                `${scenario.name}: DOCX tidak berhasil dibuat`
            );

            console.log(`✓ DOCX berhasil dibuat`);

            if (fs.existsSync(pdfPath)) {
                console.log(`✓ PDF berhasil dibuat`);
            } else {
                console.log(`- PDF tidak dibuat pada skenario ini`);
            }

            // Scenario-specific assertions
            if (scenario.name === "1. Satu Pencipta") {
                assert(
                    data.semua_nama === pencipta1.nama_pencipta,
                    "Nama satu pencipta tidak sesuai"
                );

                console.log("✓ Hanya satu pencipta");
            }

            if (scenario.name === "2. Tiga Pencipta") {
                assert(
                    data.semua_nama.includes(pencipta1.nama_pencipta),
                    "Pencipta pertama tidak ditemukan"
                );

                assert(
                    data.semua_nama.includes(pencipta2.nama_pencipta),
                    "Pencipta kedua tidak ditemukan"
                );

                assert(
                    data.semua_nama.includes(pencipta3.nama_pencipta),
                    "Pencipta ketiga tidak ditemukan"
                );

                console.log("✓ Ketiga pencipta masuk");
            }

            if (scenario.name === "3. Video dengan Link") {
                assert(
                    data.link_ciptaan ===
                    "\nLink: https://youtube.com/watch?v=123456789",
                    "Link video tidak terbentuk dengan benar"
                );

                console.log("✓ Link video berhasil diproses");
            }

            if (scenario.name === "4. Uraian Panjang Banget") {
                assert(
                    data.uraian_ciptaan.length > 2000,
                    "Uraian belum cukup panjang untuk skenario overflow"
                );

                console.log(
                    `✓ Uraian panjang diproses (${data.uraian_ciptaan.length} karakter)`
                );
            }

            if (scenario.name === "5. Tanpa No Telepon") {
                assert(
                    data.telepon === "-",
                    "Telepon kosong tidak menggunakan fallback (-)"
                );

                console.log("✓ No telepon kosong menggunakan fallback (-)");
            }

            if (scenario.name === "6. Alamat Panjang Banget") {
                assert(
                    data.alamat_lengkap.length > 150,
                    "Alamat belum cukup panjang untuk skenario overflow"
                );

                console.log(
                    `✓ Alamat panjang diproses (${data.alamat_lengkap.length} karakter)`
                );
            }

            console.log(`✓ ${scenario.name} berhasil\n`);
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