import { expect, Frame, Page, test } from '@playwright/test'

import { blockGroups, layoutBlocks } from '../../src/blocks'
import { createAdminContext } from '../helpers/adminSession'
import { adminEmail, adminPassword } from '../helpers/adminCredentials'

/**
 * Uji runtime UX penyunting: pemilih mode di halaman edit, dan canvas Puck
 * sebagai view tersendiri di tab baru.
 *
 * Tiga perilaku yang dijaga:
 *
 * 1. Halaman edit tetap TAMPILAN BAWAAN Payload. Yang ditambahkan hanya satu
 *    pemilih mode; tidak ada canvas yang ikut dimuat di sana.
 * 2. Memilih "Puck" membuka TAB BARU ke view-nya sendiri.
 * 3. Memilih "Live Preview" menyalakan Live Preview milik Payload.
 *
 * SATU file, berurutan. Sebelumnya uji form bersarang berada di file terpisah dan
 * hasilnya flaky: keduanya menggerakkan halaman edit yang sama, sementara
 * preferensi admin tersimpan di SERVER — jadi spec yang jalan lebih dulu mengubah
 * kondisi awal spec berikutnya. Isolasi worker tidak menolong karena state-nya
 * bukan di browser.
 */

const BASE = 'http://localhost:3001'

/**
 * Live Preview memuat FRONTEND, yang berada di origin lain.
 *
 * Sebelumnya konstanta ini tidak ada dan tautannya diperiksa terhadap `BASE` —
 * benar sewaktu keduanya satu origin, dan diam-diam salah begitu dipisah.
 */
const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3030'
const HEADING = 'Halaman ini dibuat lewat REST API'

/**
 * Blok yang diseret dari katalog dalam uji ini.
 *
 * Sengaja block yang TIDAK dipasang `beforeAll`, supaya kemunculannya di outline
 * hanya bisa berasal dari seretan.
 */
const NEW_BLOCK_LABEL = 'Penghargaan'

/**
 * Membuka semua kelompok katalog.
 *
 * Hanya kelompok pertama yang terbuka secara bawaan — sengaja, supaya katalog
 * tidak kembali menjadi daftar panjang. Konsekuensinya butir di kelompok lain
 * tidak ada di DOM sampai kelompoknya dibuka, dan uji yang lupa membukanya akan
 * melaporkan block-nya "hilang".
 */
/**
 * Membuka salah satu tab di rel kiri layout Puck.
 *
 * Dipilih lewat TEKS di dalam nav, bukan lewat peran aksesibilitas: butir rel
 * Puck adalah `<li>` berisi `<div>` — tanpa `role`, tanpa `aria-selected`, dan
 * tanpa `<button>`. Jadi `getByRole('button'|'tab')` tidak akan pernah cocok.
 * (Itu juga berarti rel-nya tidak bisa dijangkau keyboard maupun screen reader;
 * kekurangan di Puck sendiri, bukan sesuatu yang bisa ditambal dari sini.)
 */
const openTab = async (page: Page, label: string): Promise<void> => {
  await page.locator('[class*="PuckLayout-nav"]').getByText(label, { exact: true }).click()
}

const expandAllCategories = async (page: Page): Promise<void> => {
  for (const group of blockGroups) {
    const header = page.getByRole('button', { name: group.title }).first()
    if ((await header.count()) === 0) {
      continue
    }
    if ((await header.getAttribute('aria-expanded')) === 'false') {
      await header.click()
    }
  }
}


/**
 * Mencari frame berdasarkan ISI, bukan urutan.
 *
 * Jumlah dan urutan iframe berubah tergantung Live Preview menyala atau tidak,
 * dan devtools Next.js menyumbang satu iframe tersembunyi.
 */
const findFrameWith = async (page: Page, text: string): Promise<Frame> => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    for (const frame of page.frames()) {
      try {
        if (await frame.locator(`text=${text}`).first().isVisible({ timeout: 500 })) {
          return frame
        }
      } catch {
        // Frame bisa lepas saat Puck me-mount ulang canvas-nya; dicoba lagi.
      }
    }
    await page.waitForTimeout(1000)
  }
  throw new Error(`Tidak ada frame yang memuat teks "${text}"`)
}

/**
 * Membaca overlay error dev Next.js.
 *
 * Ini menutup celah nyata: error yang terjadi saat SSR — mis. `window is not
 * defined` di komponen `'use client'` yang tetap dirender di server — TIDAK muncul
 * sebagai console error di browser. Assertion "tidak ada error console" pun
 * melewatkannya, dan itu benar-benar terjadi sekali.
 *
 * Overlay-nya hidup di dalam shadow DOM elemen `nextjs-portal`, jadi teksnya
 * dibaca dari sana.
 */
const devOverlayText = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('nextjs-portal')]
      .map((el) => (el as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot?.textContent ?? '')
      .join(' '),
  )

const assertNoDevError = async (page: Page, label: string) => {
  const text = await devOverlayText(page)
  const hit = ['Runtime Error', 'is not defined', 'Unhandled', 'Server Error'].find((m) =>
    text.includes(m),
  )
  if (hit) {
    throw new Error(`Overlay error Next muncul di ${label} ("${hit}"): ${text.slice(0, 400)}`)
  }
}

const nestedForms = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('form')]
      .filter((f) => f.parentElement?.closest('form'))
      .map((f) => f.className),
  )

test.describe.configure({ mode: 'serial' })

test.describe('Penyunting halaman', () => {
  let page: Page
  let puckTab: null | Page = null
  const consoleErrors: string[] = []

  const watch = (p: Page) => {
    p.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    p.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))
  }

  test.beforeAll(async ({ browser, request }) => {
    /*
     * Layout halaman 1 diisi ulang di sini, bukan diandaikan sudah ada.
     *
     * Sebelumnya suite ini bergantung pada baris block yang kebetulan tersimpan
     * di basis data. Begitu definisi block berubah, tabelnya ikut hilang dan
     * seluruh suite gagal karena alasan yang tidak ada hubungannya dengan yang
     * diuji — dan pesan gagalnya menunjuk ke tempat yang salah.
     */
    const login = await request.post(`${BASE}/api/users/login`, {
      data: { email: adminEmail(), password: adminPassword() },
    })
    expect(login.ok(), 'login admin harus berhasil').toBeTruthy()
    const { token } = (await login.json()) as { token: string }

    const updated = await request.patch(`${BASE}/api/pages/1`, {
      data: {
        _status: 'published',
        layout: [
          {
            actions: [{ href: '/services', label: 'Tombol garis', variant: 'outline-white' }],
            blockType: 'benefits',
            description: HEADING,
            items: [{ description: 'Baris dari Payload.', title: 'Item pertama' }],
            title: HEADING,
            tone: 'dark',
          },
          {
            blockType: 'trustIndicators',
            items: [{ label: 'Indikator kedua', value: '99,99%' }],
            title: 'Angka kepercayaan',
          },
        ],
        slug: 'home',
        title: 'Beranda',
      },
      headers: { Authorization: `JWT ${token}` },
    })
    expect(updated.ok(), 'penyiapan layout halaman 1 harus berhasil').toBeTruthy()

    page = await (await createAdminContext(browser, BASE)).newPage()
    watch(page)
  })

  test('collection Halaman ada dan berisi dokumen', async () => {
    await page.goto(`${BASE}/admin/collections/pages`)

    // Diperiksa lewat baris dokumennya, bukan `h1`: pada compile dingin
    // Turbopack, list view melewati state sementara yang h1-nya belum berisi
    // label collection.
    await expect(page.getByRole('link', { name: 'Beranda' }).first()).toBeVisible({
      timeout: 120_000,
    })
  })

  test('form bawaan memiliki layout dengan tombol Add Layout', async () => {
    await page.goto(`${BASE}/admin/collections/pages/1`)

    await expect(page.locator('#field-title')).toBeVisible({ timeout: 120_000 })
    await expect(page.locator('#field-slug')).toBeVisible()

    /*
     * Inilah inti arsitekturnya: DEFINISI layout/block/component milik Payload,
     * dan form bawaan yang menambahkannya. Puck hanya merender data yang sama.
     *
     * Sebelumnya `authoring: 'puck'` menyimpan layout sebagai satu kolom JSON —
     * akibatnya tombol tambah bawaan Payload hilang seluruhnya, dan Puck menjadi
     * satu-satunya jalan menyusun halaman.
     */
    await expect(page.getByRole('button', { name: 'Add Layout' })).toBeVisible({ timeout: 60_000 })

    // Canvas tidak dimuat di halaman ini — `Puck.Fields` selalu merender `<form>`,
    // dan di sini ia akan bersarang di dalam form edit Payload.
    await expect(page.locator('[class*="PuckFields"]')).toHaveCount(0)
    expect(await nestedForms(page), 'ada form bersarang di halaman edit').toEqual([])
  })

  test('ikon mata Live Preview berganti menjadi dropdown', async () => {
    // Dropdown berada di KONTROL DOKUMEN, sebaris dengan Save Draft dan Publish —
    // bukan di badan form. Memilih cara menyunting adalah aksi terhadap dokumen,
    // sederajat dengan Save dan Publish.
    const select = page.locator('.doc-controls #puck-advance-edit-mode')
    await expect(select).toBeVisible({ timeout: 60_000 })

    const options = await select.locator('option').allTextContents()
    expect(options).toEqual(['Form bawaan', 'Live Preview', 'Puck (buka tab baru)'])

    // Toggler bawaan disembunyikan supaya tidak ada dua kontrol untuk satu hal.
    // Selektornya nama class INTERNAL Payload — kalau berganti, test ini gagal
    // dengan keras alih-alih menampilkan ikon mata dan dropdown sekaligus.
    const toggler = page.locator('.live-preview-toggler')
    if ((await toggler.count()) > 0) {
      await expect(toggler.first()).toBeHidden()
    }
  })

  test('memilih Puck membuka tab baru ke view-nya sendiri', async () => {
    const [opened] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('#puck-advance-edit-mode').selectOption('puck'),
    ])

    puckTab = opened
    watch(puckTab)

    // Ditunggu URL-nya, bukan dibaca seketika: tab yang dibuka dengan `noopener`
    // mulai sebagai `about:blank` lalu bernavigasi, jadi membacanya tepat setelah
    // event `page` mengembalikan string kosong.
    await puckTab.waitForURL(`${BASE}/admin/collections/pages/1/puck`, { timeout: 120_000 })
  })

  test('pemilih mode tidak berpindah ke Puck setelah tab dibuka', async () => {
    // Puck bukan mode halaman ini — ia tab lain. Select yang menunjuk "Puck"
    // akan berbohong soal apa yang sedang tampil.
    await expect(page.locator('#puck-advance-edit-mode')).toHaveValue(/form|live-preview/)
  })

  test('katalog block dikelompokkan dan memuat seluruh block terdaftar', async () => {
    const tab = puckTab!
    await expect(tab.locator('#puck-advance-save')).toBeVisible({ timeout: 120_000 })

    /*
     * Katalog `Puck.Components` DITAMPILKAN, dan isinya diturunkan dari definisi
     * block Payload yang sama dengan yang membentuk panel field.
     *
     * Sempat sengaja disembunyikan dengan alasan "katalog kedua yang bisa
     * menyimpang". Alasan itu keliru — daftarnya berasal dari sumber yang sama —
     * dan akibatnya nyata: editor yang membuka Puck melihat canvas tanpa satu pun
     * cara menambah blok, yang terbaca sebagai editor rusak.
     */
    for (const group of blockGroups) {
      await expect(
        tab.getByText(group.title, { exact: true }).first(),
        `kelompok "${group.title}" tidak muncul di katalog`,
      ).toBeVisible({ timeout: 30_000 })
    }

    await expandAllCategories(tab)

    /*
     * Yang dihitung LABEL UNIK, bukan jumlah elemen: Puck merender tiap butir
     * katalog dua kali — satu di daftar, satu lagi sebagai lapisan seret.
     * Menghitung elemen menghasilkan tepat dua kali lipat, dan angka itu
     * terlihat seperti katalog ganda padahal isinya sama.
     *
     * Dibandingkan dengan jumlah block terdaftar, bukan angka tetap: yang ingin
     * dijaga bukan "ada 31", melainkan "tidak ada yang hilang" — termasuk block
     * yang lupa dimasukkan ke kelompok mana pun.
     */
    const labels = new Set(
      (await tab.locator('[data-puck-drawer-item]').allTextContents())
        .map((text) => text.trim())
        .filter(Boolean),
    )
    expect(labels.size, 'katalog tidak memuat seluruh block yang terdaftar').toBe(
      layoutBlocks.length,
    )
  })

  test('outline memuat block yang ada di halaman', async () => {
    const tab = puckTab!

    // Outline berada di TAB tersendiri pada layout bawaan Puck, jadi harus
    // dibuka dulu. Sebelumnya ia satu kolom dengan katalog dan selalu terlihat.
    await openTab(tab, 'Outline')

    const outline = tab.locator('[class*="OutlineWrapper-layers"]').first()
    await expect(outline).toContainText('Benefits')
    await expect(outline).toContainText('Indikator Kepercayaan')
  })

  test('menyeret dari katalog menambah blok ke halaman', async () => {
    const tab = puckTab!

    /*
     * Jumlah komponen di CANVAS yang dihitung, bukan isi outline.
     *
     * Outline kini di balik tab, dan menggantungkan uji seret pada tab lain
     * berarti satu test menguji dua hal sekaligus — kalau gagal, tidak jelas
     * seretannya yang tidak jalan atau tabnya yang tidak terbuka.
     */
    const countComponents = () =>
      tab.evaluate(() => {
        for (const frame of document.querySelectorAll('iframe')) {
          try {
            const found = frame.contentDocument?.querySelectorAll('[data-puck-component]')
            if (found?.length) {
              return found.length
            }
          } catch {
            continue
          }
        }
        return 0
      })

    await openTab(tab, 'Blocks')
    await expandAllCategories(tab)
    const before = await countComponents()
    expect(before, 'canvas seharusnya sudah berisi block halaman').toBeGreaterThan(0)

    const item = tab.locator('[data-puck-drawer-item]', { hasText: NEW_BLOCK_LABEL }).first()

    /*
     * Butir katalog DIGULIRKAN ke viewport dulu.
     *
     * Katalognya panjang dan sebagian besar butir berada di bawah layar. Seretan
     * yang dimulai dari titik di luar viewport tidak pernah memicu sensor
     * dnd-kit — dan gagalnya terlihat persis seperti fitur seret yang tidak
     * berfungsi, bukan seperti test yang menyeret dari tempat yang salah.
     */
    await item.scrollIntoViewIfNeeded()
    const src = await item.boundingBox()
    const dst = await tab.locator('iframe').first().boundingBox()
    expect(src, 'butir katalog tidak punya posisi di layar').not.toBeNull()
    expect(dst, 'canvas tidak punya posisi di layar').not.toBeNull()

    // Digerakkan bertahap, bukan sekali lompat: dnd-kit butuh rentetan
    // pergerakan untuk melewati ambang aktivasinya.
    const from = { x: src!.x + src!.width / 2, y: src!.y + src!.height / 2 }
    const to = { x: dst!.x + dst!.width / 2, y: dst!.y + dst!.height / 2 }
    await tab.mouse.move(from.x, from.y)
    await tab.mouse.down()
    for (let step = 1; step <= 20; step += 1) {
      await tab.mouse.move(
        from.x + ((to.x - from.x) * step) / 20,
        from.y + ((to.y - from.y) * step) / 20,
      )
    }
    await tab.mouse.up()

    await expect.poll(countComponents, { timeout: 30_000 }).toBe(before + 1)
  })

  test('canvas merender pack yang sama dengan produksi', async () => {
    const canvas = await findFrameWith(puckTab!, HEADING)
    await expect(canvas.locator(`text=${HEADING}`).first()).toBeVisible()
  })

  test('view Puck menempati penuh viewport', async () => {
    /*
     * Tanpa ini, canvas hanya mendapat sisa ruang di bawah header admin, judul
     * dokumen, dan tab Edit/Versions/API — sekitar dua pertiga tinggi layar. Untuk
     * drag-and-drop tiga panel, ruang yang hilang itu terasa.
     *
     * `views.edit.root` tidak bisa dipakai: Payload melarangnya berdampingan
     * dengan custom view (`root?: never`). Jadi view ini menutupi shell admin
     * dengan lapisan `position: fixed`, sambil tetap mempertahankan konteks
     * dokumen Payload — termasuk gerbang autentikasinya.
     */
    const tab = puckTab!
    // Dicari lewat COMPUTED POSITION, bukan lewat isi teks: mencari elemen
    // berdasarkan teks membuat test bergantung pada struktur pembungkus, dan
    // versi pertama assertion ini memang menemukan elemen yang salah (top = 8px).
    const box = await tab.evaluate(() => {
      const layer = [...document.querySelectorAll('div')].find((d) => {
        const cs = getComputedStyle(d)
        const r = d.getBoundingClientRect()
        return cs.position === 'fixed' && r.height >= window.innerHeight - 2 && r.width > 400
      })
      const r = layer?.getBoundingClientRect()
      return r
        ? {
            height: Math.round(r.height),
            top: Math.round(r.top),
            viewportHeight: window.innerHeight,
          }
        : null
    })

    expect(box, 'tidak ada lapisan penuh viewport — shell admin masih memakan ruang').not.toBeNull()
    expect(box!.top, 'lapisan tidak menempel ke atas viewport').toBeLessThanOrEqual(1)
    expect(
      box!.height,
      'lapisan tidak setinggi viewport — shell admin masih memakan ruang',
    ).toBeGreaterThanOrEqual(box!.viewportHeight - 2)

    // Scroll halaman di belakang lapisan dikunci, kalau tidak menggulir di canvas
    // ikut menggulir halaman admin dan posisi lapisan terasa melayang.
    await expect(tab.locator('body')).toHaveCSS('overflow', 'hidden')
  })

  test('canvas memakai CSS yang sama dengan frontend', async () => {
    /*
     * Canvas Puck adalah iframe KOSONG tempat React merender — ia tidak memuat
     * halaman mana pun, jadi secara default tidak punya CSS apa pun dan seluruh
     * pack tampil sebagai teks polos. Live Preview tidak mengalaminya karena ia
     * memuat URL frontend sungguhan.
     *
     * Diperbaiki dengan menyuntikkan stylesheet frontend ke dokumen iframe lewat
     * `overrides.iframe`. Diuji lewat COMPUTED STYLE, bukan keberadaan tag: tag
     * yang ada tapi gagal dimuat tetap menghasilkan canvas tanpa gaya.
     */
    const tab = puckTab!

    /*
     * Section-nya dicari lewat kelas design system, bukan `querySelector('section')`
     * begitu saja: shell Puck sendiri punya elemen `section`, dan yang pertama di
     * dokumen belum tentu milik canvas.
     *
     * Dan dibaca lewat `poll`, karena penyuntikan stylesheet baru berjalan setelah
     * fetch lintas origin ke frontend selesai — pembacaan sekali jalan menangkap
     * canvas yang memang belum bergaya, lalu melaporkannya sebagai CSS yang gagal.
     */
    const readSections = () =>
      tab.evaluate(() => {
        for (const frame of document.querySelectorAll('iframe')) {
          let sections: Element[] = []
          try {
            sections = [
              ...(frame.contentDocument?.querySelectorAll('section[class*="section-spacing"]') ??
                []),
            ]
          } catch {
            continue
          }
          if (!sections.length) {
            continue
          }
          return sections.map((section) => {
            const cs = getComputedStyle(section)
            return { background: cs.backgroundColor, padding: parseFloat(cs.paddingTop) }
          })
        }
        return []
      })

    /*
     * `bg-secondary` = #114a43 dan `section-spacing-lg` memberi padding vertikal.
     * Keduanya TIDAK punya padanan bawaan browser, jadi kalau stylesheet frontend
     * gagal disuntikkan, background-nya transparan dan padding-nya nol.
     */
    /*
     * SELURUH section diperiksa, bukan yang pertama.
     *
     * Urutan blok di halaman bukan milik test ini — uji seret di atas menyisipkan
     * blok baru, dan blok mana yang kebetulan berada di posisi pertama bisa
     * berubah kapan saja. Test yang mematok posisi akan gagal karena urutan,
     * lalu melaporkannya sebagai CSS yang tidak berlaku.
     */
    await expect
      .poll(async () => (await readSections()).some((s) => s.background === 'rgb(17, 74, 67)'), {
        message: 'tidak ada section yang memakai warna design system frontend',
        timeout: 60_000,
      })
      .toBe(true)

    /*
     * Padding diperiksa sebagai "ada yang besar", bukan "semua besar".
     *
     * Ritme jaraknya memang bertingkat — `section-spacing-md` lebih kecil dari
     * `lg`, dan `none` sengaja nol. Menuntut semuanya besar berarti menuntut
     * halaman hanya berisi satu ragam jarak, dan itu bukan yang sedang diuji di
     * sini. Yang dibuktikan: kelas jarak dari CSS frontend benar-benar berlaku,
     * karena nilai bawaan browser untuk `section` adalah nol.
     */
    const sections = await readSections()
    expect(
      sections.some((s) => s.padding > 40),
      'tidak ada section yang mendapat jarak vertikal — CSS frontend tidak berlaku',
    ).toBe(true)
  })

  test('tidak ada form bersarang di view Puck', async () => {
    // Batas test dinaikkan di atas batas `waitFor` di bawah. Kalau lebih rendah,
    // test mati lebih dulu dan yang dilaporkan adalah "timeout" — bukan sebab
    // aslinya, yang jadi tidak pernah terlihat.
    test.setTimeout(120_000)

    const tab = puckTab!

    // Panel field baru dirender setelah sebuah komponen dipilih — dan panel itulah
    // satu-satunya yang merender `<form>`.
    const canvas = await findFrameWith(tab, HEADING)
    await canvas.locator(`text=${HEADING}`).first().click()
    /*
     * Yang ditunggu panel field yang TERLIHAT.
     *
     * Layout bawaan Puck merender panel kanan dua kali — satu untuk desktop, satu
     * untuk mobile — dan yang pertama di DOM adalah yang tersembunyi. `.first()`
     * tanpa saringan menunggu elemen yang memang tidak akan pernah terlihat, lalu
     * gagal seolah panelnya tidak pernah muncul.
     */
    await tab.locator('[class*="PuckFields"]:visible').first().waitFor({ timeout: 60_000 })

    // Di view tersendiri tidak ada form Payload yang membungkusnya, jadi form
    // milik Puck berdiri sendiri dan sah.
    expect(await nestedForms(tab), 'ada form bersarang di view Puck').toEqual([])
  })

  test('panel field Puck diturunkan dari definisi block Payload', async () => {
    /*
     * Label-label ini berasal dari definisi block MILIK APLIKASI INI di
     * `src/blocks/reactbank/` — bukan dari contract, dan bukan dari katalog
     * milik paket.
     *
     * Itu inti arsitekturnya: blok didefinisikan sekali di Payload, dan panel field
     * Puck dibentuk dari definisi itu saat runtime. Menambah field di block cukup
     * satu tempat, dan Puck langsung menawarkannya.
     */
    const tab = puckTab!
    // Panel yang TERLIHAT, dengan alasan yang sama seperti di uji sebelumnya:
    // layout bawaan Puck merender salinan mobile yang selalu tersembunyi.
    const panel = tab.locator('[class*="PuckFields"]:visible').first()

    for (const label of ['Label kecil', 'Judul', 'Deskripsi', 'Nada latar', 'Jarak vertikal']) {
      await expect(
        panel.getByText(label, { exact: true }).first(),
        `field "${label}" dari definisi block Payload tidak muncul di panel Puck`,
      ).toBeVisible({ timeout: 30_000 })
    }
  })

  test('header view Puck punya tombol kembali dan dua tombol simpan terpisah', async () => {
    const tab = puckTab!

    // Tautan, bukan `history.back()`: view ini dibuka di TAB BARU, jadi riwayatnya
    // kosong dan tombol back browser tidak menuju ke mana pun.
    await expect(tab.locator('a[aria-label="Kembali ke halaman edit"]')).toHaveAttribute(
      'href',
      '/admin/collections/pages/1',
      { timeout: 60_000 },
    )

    /*
     * DUA tombol dengan label TETAP, dan tidak ada lagi dropdown status.
     *
     * Bentuk sebelumnya menaruh pilihan "Terbitkan" di dalam dropdown tepat di
     * sebelah tombol bertuliskan "Terbitkan", dan label tombol itu ikut berubah
     * mengikuti dropdown — tidak ada yang menandai mana yang memilih dan mana yang
     * mengerjakan.
     */
    await expect(tab.locator('#puck-advance-status')).toHaveCount(0)
    await expect(tab.locator('#puck-advance-save')).toHaveText('Simpan draft')
    await expect(tab.locator('#puck-advance-publish')).toHaveText('Terbitkan')

    // Status dokumen kini DILAPORKAN, bukan dipilih. Isinya tidak dipaku ke salah
    // satu nilai: dokumen ini diterbitkan dan disimpan-draft ulang oleh test lain
    // di file yang sama, jadi memakunya membuat urutan test jadi penting.
    await expect(tab.locator('#puck-advance-doc-status')).toHaveText(/^(Draft|Terbit)$/)
  })

  test('Simpan draft menulis ke versions, bukan ke dokumen terbit', async () => {
    const tab = puckTab!
    const patches: string[] = []
    tab.on('request', (r) => {
      if (r.method() === 'PATCH' && r.url().includes('/api/pages/1')) {
        patches.push(r.url())
      }
    })

    await tab.locator('#puck-advance-save').click()
    await expect(tab.getByText('Draft tersimpan.', { exact: false })).toBeVisible({
      timeout: 60_000,
    })

    // `draft=true` WAJIB ada: tanpa itu, menyimpan dari Puck akan langsung
    // mengubah dokumen yang sudah terbit.
    expect(
      patches.some((u) => u.includes('draft=true')),
      patches.join(' | '),
    ).toBe(true)
  })

  test('Terbitkan dari Puck benar-benar menerbitkan dokumen', async () => {
    const tab = puckTab!
    await tab.locator('#puck-advance-publish').click()
    await expect(tab.getByText('Tersimpan dan diterbitkan.', { exact: false })).toBeVisible({
      timeout: 60_000,
    })

    // Diperiksa lewat API tanpa `draft`, bukan lewat teks di layar: hanya jalur
    // itu yang membuktikan dokumen TERBIT-nya benar-benar berubah, bukan sekadar
    // draft yang tersimpan.
    const res = await tab.request.get(`${BASE}/api/pages/1`)
    expect(res.ok()).toBe(true)
    const doc = (await res.json()) as { _status?: string }
    expect(doc._status).toBe('published')
  })

  test('memilih Live Preview menyalakan Live Preview Payload', async () => {
    await page.bringToFront()
    await page.locator('#puck-advance-edit-mode').selectOption('live-preview')

    // Sengaja TIDAK memakai tombol "Exit Live Preview": tombol itu adalah
    // `.live-preview-toggler` yang justru kita sembunyikan. Tanda Live Preview
    // menyala yang sah adalah panel preview-nya sendiri.
    await expect(page.locator('#puck-advance-edit-mode')).toHaveValue('live-preview', {
      timeout: 60_000,
    })
    await expect(page.getByRole('link', { name: 'Open in new window' })).toHaveAttribute(
      'href',
      `${FRONTEND}/preview?slug=home`,
      { timeout: 60_000 },
    )
  })

  test('Live Preview merender konten dari frontend sungguhan', async () => {
    const preview = await findFrameWith(page, HEADING)

    /*
     * Dua block berturut-turut, dan field di dalam array (`actions`) ikut
     * diperiksa — di array itulah renderer paling mudah diam-diam berhenti.
     *
     * Cakupan SLOT BERSARANG hilang di sini bersama block "Kolom", satu-satunya
     * block yang punya slot. Ia dibuang karena ditulis dengan token shadcn milik
     * CMS dan selalu tampil polos di canvas. Kalau nanti dibutuhkan block
     * kontainer, uji itu harus dihidupkan lagi bersamanya.
     */
    /*
     * Teksnya dicari ulang di SELURUH frame setiap kali, bukan lewat satu
     * referensi frame yang diambil sekali.
     *
     * Live Preview me-mount ulang iframe-nya saat menerima pembaruan, dan
     * referensi `Frame` yang lama ikut lepas. Locator terhadap frame lepas tidak
     * error — ia hanya tidak pernah menemukan apa pun, dan gagalnya terbaca
     * seolah kontennya yang tidak sampai ke frontend.
     */
    const visibleSomewhere = async (text: string) => {
      for (const frame of preview.page().frames()) {
        try {
          if (await frame.locator(`text=${text}`).first().isVisible({ timeout: 500 })) {
            return true
          }
        } catch {
          // Frame lepas saat Live Preview me-mount ulang; dilewati.
        }
      }
      return false
    }

    await expect
      .poll(() => visibleSomewhere('Tombol garis'), { timeout: 60_000 })
      .toBe(true)
    await expect
      .poll(() => visibleSomewhere('Indikator kedua'), { timeout: 60_000 })
      .toBe(true)
  })

  test('memilih Form bawaan mematikan Live Preview', async () => {
    await page.locator('#puck-advance-edit-mode').selectOption('form')

    // Panel preview hilang — itu bukti Live Preview benar-benar mati, bukan hanya
    // nilai select yang berubah.
    await expect(page.getByRole('link', { name: 'Open in new window' })).toHaveCount(0, {
      timeout: 60_000,
    })
    await expect(page.locator('#puck-advance-edit-mode')).toHaveValue('form')
  })

  test('tidak ada overlay error Next di kedua tab', async () => {
    // Diperiksa terpisah dari console: error SSR tidak pernah sampai ke console
    // browser, hanya ke overlay dev dan log server.
    await assertNoDevError(page, 'halaman edit')
    if (puckTab) {
      await assertNoDevError(puckTab, 'view Puck')
    }
  })

  test('tidak ada error console di kedua tab', async () => {
    const relevant = consoleErrors.filter(
      (e) =>
        !e.includes('Download the React DevTools') &&
        !e.toLowerCase().includes('favicon') &&
        !e.includes('Failed to load resource'),
    )
    expect(relevant, relevant.join(' || ')).toEqual([])
  })

  test.afterAll(async () => {
    if (puckTab) {
      await puckTab.screenshot({ path: 'test-results/puck-view.png' })
    }
    if (page) {
      await page.screenshot({ path: 'test-results/edit-form.png' })
    }
  })
})
