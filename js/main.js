document.addEventListener("DOMContentLoaded", () => {
  // 1. Tahun otomatis
  const yearEl = document.getElementById("yearNow");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 1b. Scroll Progress Bar
  const progressBar = document.getElementById("scrollProgress");
  const updateProgress = () => {
    if (!progressBar) return;
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // 1c. Clean Scroll Reveal (tanpa kedip: hanya animasikan elemen di bawah layar)
  const revealSelectors = [
    ".section-head",
    ".about-story",
    ".about-facts",
    ".stack-group",
    ".orbit-stage",
    ".timeline-item",
    ".project-card:not(.is-hidden)",
    ".contact-card"
  ];
  const revealTargets = Array.from(document.querySelectorAll(revealSelectors.join(", ")));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    revealTargets.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight - 24) {
        el.classList.add("reveal");
        el.style.setProperty("--reveal-delay", `${(idx % 3) * 0.05}s`);
        io.observe(el);
      }
    });
  }

  // 1d. Interaksi Hover & Tap (Mobile) Roda Teknologi Melingkar
  const orbitNodes = document.querySelectorAll(".orbit-node");
  const orbitTitle = document.getElementById("orbitTitle");
  const orbitNote = document.getElementById("orbitNote");

  if (orbitNodes.length && orbitTitle && orbitNote) {
    const defaultTitle = orbitTitle.innerHTML;
    const defaultNote = orbitNote.textContent;

    const showTech = (node) => {
      orbitTitle.textContent = node.dataset.tech || "Tech Stack";
      orbitNote.textContent = node.dataset.note || "";
    };

    orbitNodes.forEach((node) => {
      node.addEventListener("mouseenter", () => showTech(node));
      node.addEventListener("click", (e) => {
        e.stopPropagation();
        showTech(node);
      });
      node.addEventListener("mouseleave", () => {
        orbitTitle.innerHTML = defaultTitle;
        orbitNote.textContent = defaultNote;
      });
    });
  }

  // 1e. Subtle Custom Cursor (Desktop Only)
  const cursor = document.getElementById("customCursor");
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (cursor && isFinePointer) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.add("is-visible");
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

    const tickCursor = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(tickCursor);
    };
    requestAnimationFrame(tickCursor);

    document.querySelectorAll("[data-cursor='view'], .exp-card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-view"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-view"));
    });
  }

  // 1f. Interactive Stacked Journey Cards
  const expDeck = document.getElementById("expDeck");
  const expCards = expDeck ? Array.from(expDeck.querySelectorAll(".exp-card")) : [];
  const expDots = document.getElementById("expDots");
  const prevExpBtn = document.getElementById("prevExpBtn");
  const nextExpBtn = document.getElementById("nextExpBtn");
  let expIndex = 0;

  const renderExpDeck = () => {
    expCards.forEach((card, i) => {
      const pos = (i - expIndex + expCards.length) % expCards.length;
      card.setAttribute("data-pos", String(pos));
    });
    expDots?.querySelectorAll(".deck-dot").forEach((d, i) => {
      d.classList.toggle("is-active", i === expIndex);
    });
  };

  if (expCards.length && expDots) {
    expCards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "deck-dot";
      dot.setAttribute("aria-label", `Perjalanan ${i + 1}`);
      dot.addEventListener("click", () => {
        expIndex = i;
        renderExpDeck();
      });
      expDots.appendChild(dot);
    });

    expCards.forEach((card) => {
      card.addEventListener("click", () => {
        expIndex = (expIndex + 1) % expCards.length;
        renderExpDeck();
      });
    });

    prevExpBtn?.addEventListener("click", () => {
      expIndex = (expIndex - 1 + expCards.length) % expCards.length;
      renderExpDeck();
    });

    nextExpBtn?.addEventListener("click", () => {
      expIndex = (expIndex + 1) % expCards.length;
      renderExpDeck();
    });

    renderExpDeck();
  }

  // 2. Theme Toggle (Light / Dark) dengan animasi menjalar melingkar (Circular Reveal)
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  const setTheme = (mode) => {
    htmlEl.setAttribute("data-theme", mode);
    localStorage.setItem("ajs-v2-theme", mode);
    if (themeIcon) {
      themeIcon.className = mode === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  };

  const saved = localStorage.getItem("ajs-v2-theme");
  if (saved === "dark" || saved === "light") setTheme(saved);

  themeToggle?.addEventListener("click", (e) => {
    const next = htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }

    const rect = themeToggle.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 680,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          pseudoElement: "::view-transition-new(root)"
        }
      );
    });
  });

  // 3. Mobile Hamburger Menu
  const menuToggle = document.getElementById("menuToggle");
  const menuIcon = document.getElementById("menuIcon");
  const navMenu = document.getElementById("navMenu");

  const closeMenu = () => {
    navMenu?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuIcon) menuIcon.className = "fa-solid fa-bars";
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    if (menuIcon) menuIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });

  navMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // 4. Filter Proyek + Mode 5 Favorit / Lihat Semua
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const toggleAllBtn = document.getElementById("toggleAllProjects");
  let currentFilter = "all";
  let showAllProjects = false;

  const renderProjects = () => {
    projectCards.forEach((card) => {
      const cats = (card.dataset.cat || "").split(" ");
      const isExtra = card.classList.contains("is-extra");
      const matchesFilter = currentFilter === "all" || cats.includes(currentFilter);
      const visible = matchesFilter && (currentFilter !== "all" || showAllProjects || !isExtra);
      card.classList.toggle("is-hidden", !visible);
      if (visible) {
        card.classList.remove("reveal");
      }
    });

    if (toggleAllBtn) {
      if (currentFilter === "all") {
        toggleAllBtn.style.display = "inline-flex";
        toggleAllBtn.innerHTML = showAllProjects
          ? 'Tampilkan 3 Favorit Saja <i class="fa-solid fa-chevron-up"></i>'
          : 'Lihat Semua Proyek (10) <i class="fa-solid fa-chevron-down"></i>';
      } else {
        toggleAllBtn.style.display = "none";
      }
    }
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentFilter = btn.dataset.filter || "all";
      renderProjects();
    });
  });

  toggleAllBtn?.addEventListener("click", () => {
    showAllProjects = !showAllProjects;
    renderProjects();
  });

  renderProjects();

  // 5. Galeri Foto Horizontal Carousel + Filter
  const galleryTrack = document.getElementById("galleryTrack");
  const galleryBtns = document.querySelectorAll(".gallery-filter-btn");
  const galleryCards = document.querySelectorAll(".gallery-card");
  const galPrev = document.getElementById("galPrev");
  const galNext = document.getElementById("galNext");

  galleryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      galleryBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const target = btn.dataset.gfilter || "all";

      galleryCards.forEach((card) => {
        const cats = (card.dataset.gcat || "").split(" ");
        const show = target === "all" || cats.includes(target);
        card.classList.toggle("is-hidden", !show);
      });

      if (galleryTrack) galleryTrack.scrollLeft = 0;
    });
  });

  galPrev?.addEventListener("click", () => {
    galleryTrack?.scrollBy({ left: -320, behavior: "smooth" });
  });

  galNext?.addEventListener("click", () => {
    galleryTrack?.scrollBy({ left: 320, behavior: "smooth" });
  });

  // 6. Data Detail Semua Proyek
  const PROJECTS = {
    "mosquito-cam": {
      cat: "Juara 3 KMIPN • E-Government & AI",
      title: "Smart Mosquito Cam (AI)",
      img: "assets/images/projects/mos.jpg",
      tags: ["Computer Vision", "Python", "AI", "KMIPN 2025"],
      desc: "Aplikasi kamera yang diintegrasikan dengan AI untuk mendeteksi nyamuk secara otomatis. Proyek ini berhasil meraih Juara 3 KMIPN kategori E-Government.",
      role: "Menghubungkan modul deteksi AI ke aplikasi, menguji tangkapan gambar, dan menyiapkan demo untuk penilaian lomba KMIPN.",
      links: [
        { label: "Profil GitHub", url: "https://github.com/AhmadJafarShodiq", primary: true }
      ]
    },
    "esurat-badean": {
      cat: "Juara 3 Web & Mobile • Kelurahan Badean, Bondowoso",
      title: "E-Surat Badean",
      img: "assets/images/projects/surat.jpeg",
      tags: ["Web", "Mobile", "Sistem Surat", "Bondowoso"],
      desc: "Aplikasi web dan mobile surat-menyurat untuk Kelurahan Badean, Bondowoso agar pengajuan dan pengarsipan surat warga lebih tertata dan cepat. Meraih Juara 3 kategori Aplikasi Web & Mobile.",
      role: "Mengerjakan fitur pengelolaan surat masuk/keluar, pengajuan surat, pencarian arsip, dan tampilan web/mobile.",
      links: [
        { label: "Repo SISURAT", url: "https://github.com/AhmadJafarShodiq/SISURAT", primary: true }
      ]
    },
    facereq: {
      cat: "Web Admin & Mobile AI",
      title: "FaceReq — Sistem Absensi Wajah AI",
      img: "assets/images/projects/adminfacereq.png",
      tags: ["Laravel", "Flutter", "REST API", "Face Recognition AI"],
      desc: "Sistem absensi yang menggabungkan aplikasi mobile Flutter dengan deteksi wajah (AI) serta validasi lokasi, terhubung ke web admin Laravel untuk pemantauan kehadiran.",
      role: "Membangun dashboard admin Laravel, REST API, database MySQL, serta menghubungkannya dengan aplikasi mobile Flutter.",
      links: [
        { label: "Repo Web Admin", url: "https://github.com/AhmadJafarShodiq/Facereqconnection_web", primary: true },
        { label: "Repo Mobile App", url: "https://github.com/AhmadJafarShodiq/Facereqconnection_Mobile", primary: false }
      ]
    },
    "analisa-keuangan": {
      cat: "Proyek Magang • OTW Computer Gusaha",
      title: "Aplikasi Analisa Keuangan & Kredit AI",
      img: "assets/images/projects/analisa-keuangan.jpg",
      tags: ["Web App", "AI 5C Scoring", "SLIK OJK", "Magang"],
      desc: "Proyek yang sedang saya kerjakan saat magang di OTW Computer Gusaha. Membantu penyusunan laporan analisis kelayakan kredit dan scoring 5C secara otomatis dengan data SLIK OJK untuk lembaga pembiayaan.",
      role: "Ikut mengembangkan fitur web, tampilan dashboard analitik & scoring 5C, serta alur pengolahan data analisis keuangan.",
      links: [
        { label: "Repo Analisa Keuangan", url: "https://github.com/AhmadJafarShodiq/Analisa_keuangan", primary: true },
        { label: "Repo AI Analisis", url: "https://github.com/AhmadJafarShodiq/AI_Analisis_keuangan", primary: false }
      ]
    },
    "iot-kangkung": {
      cat: "IoT & AI • Monitoring",
      title: "Monitoring IoT & AI Tanaman Kangkung",
      img: "assets/images/projects/monitoring.jpeg",
      tags: ["IoT", "AI", "Mobile Monitoring", "Aquaponic"],
      desc: "Aplikasi monitoring berbasis IoT dan AI untuk memantau kondisi dan perkembangan tanaman kangkung (sistem Smart Aquaponic) secara langsung.",
      role: "Membangun tampilan pemantauan di aplikasi mobile dan menghubungkan pembacaan data sensor serta hasil analisisnya.",
      links: [
        { label: "Repo Aquaponic Mobile", url: "https://github.com/AhmadJafarShodiq/Aquaponic-Mobile", primary: true },
        { label: "Repo SmartAquaponic PCV", url: "https://github.com/AhmadJafarShodiq/SmartAquaponic_PCV", primary: false }
      ]
    },
    "apotek-desktop": {
      cat: "Juara 1 SISKA & Juara Poster EPIM",
      title: "Aplikasi Kasir Apotek Desktop",
      img: "assets/images/projects/apotikdekstop.png",
      tags: ["Desktop", "Kasir & Stok", "SISKA", "EPIM"],
      desc: "Proyek kuliah semester 1–2 untuk membantu transaksi kasir apotek, pengelolaan stok obat, dan laporan penjualan. Berhasil meraih Juara 1 SISKA dan Juara Poster Aplikasi EPIM.",
      role: "Mengerjakan antarmuka transaksi kasir, manajemen data obat, laporan, serta koneksi database lokal.",
      links: [
        { label: "Repo SISKA Desktop", url: "https://github.com/AhmadJafarShodiq/SISKA_DEKSTOP", primary: true }
      ]
    },
    "yayasan-raudhah": {
      cat: "Company Profile & Admin • Laravel",
      title: "Company Profile Yayasan Raudhah",
      img: "assets/images/projects/webraudhah.png",
      tags: ["Laravel", "MySQL", "Company Profile", "Admin Panel"],
      desc: "Website company profile Yayasan Raudhah yang menampilkan informasi yayasan dan programnya, lengkap dengan dashboard admin Laravel untuk mengelola konten dan hak akses pengurus.",
      role: "Merancang database MySQL, sistem login & role admin, serta halaman publik website yang responsif.",
      links: [
        { label: "Lihat GitHub", url: "https://github.com/AhmadJafarShodiq", primary: true }
      ]
    },
    "mobile-facereq": {
      cat: "Mobile App • Flutter",
      title: "FaceReq Mobile (Flutter)",
      img: "assets/images/projects/absenmobile-facedeteksimuakak.png",
      tags: ["Flutter", "Dart", "Face Recognition", "GPS"],
      desc: "Sisi aplikasi mobile dari sistem FaceReq yang dipakai pengguna untuk absen lewat kamera deteksi wajah dan pengecekan radius lokasi.",
      role: "Mengerjakan tampilan Flutter, akses kamera & lokasi, serta pengiriman data absensi ke REST API.",
      links: [
        { label: "Repo Mobile App", url: "https://github.com/AhmadJafarShodiq/Facereqconnection_Mobile", primary: true }
      ]
    },
    "beasiswa-masjid": {
      cat: "Web & Mobile • Laravel & Flutter",
      title: "Sistem Beasiswa Masjid",
      img: "assets/images/projects/webbeasiswamasjid.png",
      tags: ["Laravel", "Flutter", "MySQL"],
      desc: "Aplikasi web untuk pendaftaran, seleksi berkas, dan pendataan penerima beasiswa masjid, dilengkapi aplikasi mobile untuk absensi kegiatan penerima.",
      role: "Membuat halaman pendaftaran & verifikasi admin di web Laravel serta fitur absensi di aplikasi mobile.",
      links: [
        { label: "Lihat GitHub", url: "https://github.com/AhmadJafarShodiq", primary: true }
      ]
    },
    gaskeun: {
      cat: "Web App • Laravel",
      title: "GasKeun — Manajemen Order",
      img: "assets/images/projects/gaskeunwebjoki.png",
      tags: ["Laravel", "MySQL", "Order Tracking"],
      desc: "Aplikasi web pemesanan layanan dengan fitur buat pesanan, pembagian tugas ke pekerja, dan pantau status pengerjaan secara langsung.",
      role: "Mengerjakan alur order, manajemen akun pekerja & admin, serta pembaruan status pesanan.",
      links: [
        { label: "Repo GasKeun", url: "https://github.com/AhmadJafarShodiq/Gaskeun_id", primary: true }
      ]
    }
  };

  // 7. Modal Detail Proyek
  const modal = document.getElementById("projectModal");
  const modalClose = document.getElementById("modalClose");
  const modalImgWrap = document.getElementById("modalImgWrap");
  const modalImg = document.getElementById("modalImg");
  const modalCat = document.getElementById("modalCat");
  const modalTitle = document.getElementById("modalTitle");
  const modalTags = document.getElementById("modalTags");
  const modalDesc = document.getElementById("modalDesc");
  const modalRole = document.getElementById("modalRole");
  const modalLinks = document.getElementById("modalLinks");

  const openModal = (id) => {
    const item = PROJECTS[id];
    if (!item || !modal) return;

    if (item.img) {
      modalImg.src = item.img;
      modalImg.alt = item.title;
      modalImgWrap.classList.remove("is-hidden");
    } else {
      modalImgWrap.classList.add("is-hidden");
    }

    modalCat.textContent = item.cat;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    modalRole.textContent = item.role;
    modalTags.innerHTML = item.tags.map((t) => `<span>${t}</span>`).join("");
    modalLinks.innerHTML = item.links
      .map(
        (l) =>
          `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn ${
            l.primary ? "btn-primary" : "btn-outline"
          }">${l.label} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
      )
      .join("");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  projectCards.forEach((card) => {
    const id = card.dataset.id;
    card.addEventListener("click", () => openModal(id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(id);
      }
    });
  });

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });
});
