  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0.12 });
  revealEls.forEach(el=>io.observe(el));

  // mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  menuBtn.addEventListener('click', ()=> nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> nav.classList.remove('open')));

  // work modal (name/cat are read live from the DOM so they always match the current language)
  const modal = document.getElementById('workModal');
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderDots = document.getElementById('sliderDots');
  const sliderPrevBtn = document.getElementById('sliderPrev');
  const sliderNextBtn = document.getElementById('sliderNext');
  const modalSlider = document.getElementById('modalSlider');

  let slides = [];
  let slideIndex = 0;

  function openWorkModal(card){
    document.getElementById('modalId').textContent = card.dataset.id;
    document.getElementById('modalName').textContent = card.querySelector('.work-name').textContent;
    document.getElementById('modalCat').textContent = card.querySelector('.work-cat').textContent;
    document.getElementById('modalAsset').textContent = card.dataset.asset;
    document.getElementById('modalOption').textContent = card.dataset.option;
    document.getElementById('modalYear').textContent = card.dataset.yearmonth;

    // 入力されていないときに行を非表示にする
    const videoRow = document.getElementById('modalVideoRow');
    if(card.dataset.video){
      document.getElementById('modalVideoLink').href = card.dataset.video;
      videoRow.hidden = false;
    } else {
      videoRow.hidden = true;
    }

    // gather slides: prefer the .work-gallery (multiple images), fall back to the single thumbnail
    const gallery = card.querySelector('.work-gallery');
    const slideEls = gallery
      ? Array.from(gallery.querySelectorAll('.slide'))
      : [card.querySelector('.work-thumb')];
    slides = slideEls.map(el => el.innerHTML);
    slideIndex = 0;
    renderSlides();

    modal.classList.add('open');
  }
  function closeWorkModal(){ modal.classList.remove('open'); }
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      if(lightbox.classList.contains('open')){ closeLightbox(); }
      else { closeWorkModal(); }
      return;
    }
    if(!modal.classList.contains('open') || lightbox.classList.contains('open')) return;
    if(e.key === 'ArrowRight') goToSlide(slideIndex + 1);
    if(e.key === 'ArrowLeft') goToSlide(slideIndex - 1);
  });

  function renderSlides(){
    sliderTrack.innerHTML = slides.map(html => `<div class="slide">${html}</div>`).join('');
    sliderDots.innerHTML = slides.map((_, i) =>
      `<button class="slider-dot${i === slideIndex ? ' active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');
    sliderDots.querySelectorAll('.slider-dot').forEach(dot=>{
      dot.addEventListener('click', ()=> goToSlide(parseInt(dot.dataset.index, 10)));
    });
    const multi = slides.length > 1;
    sliderPrevBtn.hidden = !multi;
    sliderNextBtn.hidden = !multi;
    sliderDots.hidden = !multi;
    updateSliderPosition();
  }
  function updateSliderPosition(){
    sliderTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
    sliderDots.querySelectorAll('.slider-dot').forEach((dot, i)=>{
      dot.classList.toggle('active', i === slideIndex);
    });
  }
  function goToSlide(i){
    if(slides.length === 0) return;
    slideIndex = (i + slides.length) % slides.length;
    updateSliderPosition();
  }
  sliderPrevBtn.addEventListener('click', ()=> goToSlide(slideIndex - 1));
  sliderNextBtn.addEventListener('click', ()=> goToSlide(slideIndex + 1));

  // touch swipe support
  let touchStartX = null;
  modalSlider.addEventListener('touchstart', (e)=>{ touchStartX = e.touches[0].clientX; }, { passive:true });
  modalSlider.addEventListener('touchend', (e)=>{
    if(touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx) > 40){ dx < 0 ? goToSlide(slideIndex + 1) : goToSlide(slideIndex - 1); }
    touchStartX = null;
  });

  // click the zoom icon (bottom-right of the slide) to view the current slide at full size
  const lightbox = document.getElementById('imageLightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const zoomHintBtn = document.getElementById('zoomHintBtn');
  function openLightbox(html){
    lightboxContent.innerHTML = html;
    lightbox.classList.add('open');
  }
  function closeLightbox(){ lightbox.classList.remove('open'); }
  zoomHintBtn.addEventListener('click', ()=>{
    if(slides.length === 0) return;
    openLightbox(slides[slideIndex]);
  });

  /* =========================================================
     i18n (JA / EN) — swap text via data-i18n attributes.
     Elements with data-i18n-html="true" are updated via innerHTML
     (needed for text containing <span>/<br>), everything else
     via textContent. data-i18n-attr="key:attrName" updates an
     attribute (e.g. aria-label) instead of the element's content.
  ========================================================= */
  const translations = {
    ja: {
      nav_work: "WORK", nav_pricing: "PRICING", nav_about: "ABOUT", nav_contact: "見積り/お問い合わせ",
      menu_label: "メニュー",

      translation_notice: "このページは自動翻訳で作成されています。不自然な箇所があればご連絡ください。",
      translation_notice_footer: 'このページは自動翻訳で作成されています。不自然な箇所があれば<a href="#contact">ご連絡</a>ください。',
      notice_close_label: "閉じる",

      // HEROセクション
      hero_eyebrow: "FREELANCE 3D MODELER",
      hero_title: '<span class="accent-word">イラストそっくり</span>な<br>3Dボディを手に入れよう',
      hero_sub: 'Vtuber向けに3Dモデル（VRM）を制作しています。<br>三面図などの<strong>イラストを基に</strong>Vroidでは対応しきれない複雑な形状も再現することができる<strong>フルスクラッチモデル</strong>です。</br>Warudoなどのトラッキングソフトの使用方法もサポートしているので、3D化がはじめての方にも安心です。',
      hero_cta_primary: "作品を見る",
      hero_cta_ghost: "見積り/お問い合わせ",
      availability_hero: "現在ご依頼受付中(次回納品目安:2027年2月〜)",

      // WORKセクション
      work_tag: "SELECTED WORK",
      work_title: "実績一覧",
      work_desc: 'これまでに制作した3Dモデル一覧です。<br>カードをクリックで詳細が確認できます。',
      work_note: "",

      // 作品カードサムネのタイトル
      asset004_name: "藍晶シアン様",
      asset005_name: "瑞乃しろ様",
      asset006_name: "猫薔薇ねこ様",
      asset007_name: "Lemon_773様",
      asset008_name: "たんぽぽちゃん様",
      asset009_name: "天凪なぎ様",
      asset010_name: "おわたおわな様",

      // 作品カード内詳細
      modal_video_label: "VIDEO",
      modal_video_link_text: "お披露目配信を見る",
      modal_close_label: "閉じる",

      slider_prev_label: "前の画像",
      slider_next_label: "次の画像",

      zoom_hint_label: "拡大表示",

      // 料金プランセクション
      pricing_tag: "PRICING",
      pricing_title: "料金プラン",
      pricing_desc: "用途や予算別に3つのプランを用意しています。<br>詳しくは下部記載の『つなぐ』でもご確認ください",

      price1_name: "ライトプラン",
      price1_desc: "上半身のみで出費を抑えたい場合はこちら *1",
      price1_unit: " / 1体",
      price1_f1: "上半身モデル",
      price1_f2: "あいうえお、喜怒哀楽、瞬き、ウインク",
      price1_f3: "上半身のすべての揺れもの",
      price1_not1: "フルトラッキング",
      price1_not2: "パーフェクトシンク",

      price2_badge: "おすすめ",
      price2_name: "スタンダードプラン",
      price2_desc: "3Dデビューに必要な要素がすべてそろったプラン！",
      price2_unit: " / 1体",
      price2_f1: "全身モデル",
      price2_f2: "あいうえお、喜怒哀楽、瞬き、ウインク",
      price2_f3: "パーフェクトシンク",
      price2_f4: "すべての揺れもの",
      price2_not1: "追加表情",
      price2_not2: "VRChat対応",

      price3_name: "フルカスタムプラン",
      price3_desc: "希望の要素を盛り込んだり、逆にセットプランで予算を抑えたい場合に",
      price3_amount: "要相談",
      price3_unit: " ～ 最大¥750,000",
      price3_f1: "スタンダードプランの全要素",
      price3_f2: "小物の追加・オンオフ機能",
      price3_f3: "赤面・キラキラ目などの追加表情",
      price3_f4: "MagicaCloth2を用いたなめらかな布表現 *2",
      price3_f5: "VRChat対応・ギミックの追加",

      price_cta: "見積り相談",
      pricing_note: "*1……パーフェクトシンクなどのオプションを追加することも可能です<br>*2……Warudoでのみ使用可能なファイル形式になります",

      // プロフィールセクション
      about_tag: "PROFILE",
      about_title: "ミナトノイヌについて",
      about_p1: '<strong>blenderとゲームを愛す、港街に住むイヌ。</strong><br>Vtuberとしての経験と再現度の高いモデリングスキルを活かして、Vtuber向けに3Dモデル制作を始めました。',
      about_p2: '『ココナラ』では開設以来、<strong>評価最高ランクのプラチナを維持</strong>し続けています！<br>「習うは一生」を座右の銘とし、noteでは<strong>VRM制作に関するTips</strong>を公開しています。',
      about_p3: "ソフトウェアの操作サポートから活用方法のご提案まで、丁寧でわかりやすい対応を心がけています。まずはお気軽にご相談ください。",

      contact_title: "まずは『つなぐ』より、<br>メッセージをどうぞ",
      availability_contact: "現在ご依頼受付中"
    },

    en: {
      nav_work: "WORK", nav_pricing: "PRICING", nav_about: "ABOUT", nav_contact: "Quotation / Contact",
      menu_label: "Menu",

      translation_notice: "This page was created using machine translation. If anything looks unnatural, please let us know.",
      translation_notice_footer: '　　This page was created using machine translation. If anything looks unnatural, please <a href="https://forms.gle/wE6q54c8DHdfLNiC9">let us know</a>.',
      notice_close_label: "Close",

      hero_eyebrow: "FREELANCE 3D MODELER",
      hero_title: 'Get a 3D body that looks<br><span class="accent-word">just like the illustration</span>',
      hero_sub: 'I create full-scratch VRM models for VTubers based on reference illustrations.<br>Unlike VRoid, these models are built <strong>entirely from scratch</strong> and can faithfully reproduce complex designs.<br>For those who are new to 3D, I also provide support with tracking software such as Warudo.',
      hero_cta_primary: "View Work",
      hero_cta_ghost: "Quotation / Contact",
      availability_hero: "Currently accepting new commisions (next available: from Jan 2027)",

      work_tag: "SELECTED WORK",
      work_title: "Comissions",
      work_desc: "A selection of the character and creature assets I've worked on.<br>Click a card to see the details.",
      work_note: "",
      asset004_name: "Ransho Cian",
      asset005_name: "Mizuno Shiro",
      asset006_name: "Necobara Neco",
      asset007_name: "Lemon_773",
      asset008_name: "Tampopo-chan",
      asset009_name: "Amanagi Nagi",
      asset010_name: "Owata Owana",

      modal_video_label: "VIDEO",
      modal_video_link_text: "Watch Rveal Stream",
      modal_close_label: "Close",

      slider_prev_label: "Previous image",
      slider_next_label: "Next image",
      
      zoom_hint_label: "View full size",

      pricing_tag: "PRICING",
      pricing_title: "Pricing Plans",
      pricing_desc: "Pricing is flexible depending on the scope and volume of your request. Below are rough guideline prices — feel free to get in touch first.",
      
      price1_name: "Light Plan",
      price1_desc: "A budget-friendly upper-body option *1",
      price1_unit: " ~ / character",
      price1_f1: "Upper Body model",
      price1_f2: "A/E/I/O/U, Joy/Angry/Sorrow/Fun, blink, wink",
      price1_f3: "All physics for upper body",
      price1_not1: "Full-body Tracking",
      price1_not2: "Perfect Sync",

      price2_badge: "Recommended",
      price2_name: "Standard Plan",
      price2_desc: "Everything you need for your 3D debut — all in one plan!",
      price2_unit: " / character",
      price2_f1: "Full Body model",
      price2_f2: "A/E/I/O/U, Joy/Angry/Sorrow/Fun, blink, wink",
      price2_f3: "Perfect Sync",
      price2_f4: "All physics",
      price2_not1: "Additional expressions",
      price2_not2: "VRChat convert",

      price3_name: "Full Custom Plan",
      price3_desc: "Add the features you want, or choose a set plan to fit your budget",
      price3_amount: "Contact for quote",
      price3_unit: " ～ mix¥750,000",
      price3_f1: "All contents from Standard plan",
      price3_f2: "Additional item, ON/OFF function",
      price3_f3: "Additional expresions like Blash, Shocked",
      price3_f4: "Smooth cloth simulation by using MagicaCloth2 *2",
      price3_f5: "VRChat convert, add gimmicks",

      price_cta: "Get in Touch",
      pricing_note: "*1……Perfect Sync Option is available<br>*2……only works on Warudo",

      about_tag: "PROFILE",
      about_title: "About Minato-no-Inu",
      about_p1: "<strong>A creator based in a port city with a passion for Blender and video games.</strong><br>Drawing on experience as a VTuber and expertise in high-fidelity 3D modeling, opened VRM model commisions for VTubers.",
      about_p2: 'On the Coconala platform, the highest <strong>"Platinum" rank</strong> has been maintained continuously since the service launched.<br>Guided by the belief that learning is a lifelong pursuit, tips and insights on VRM creation are also shared on Note.',
      about_p3: "From software setup and operation to advice on making the most of each model, every project is supported with clear communication and attentive guidance. Consultations are always welcome..",

      contact_title: "Message Before We Connect",
      availability_contact: "Currently accepting new projects — feel free to reach out anytime."
    },

    ko: {
      nav_work: "WORK", nav_about: "ABOUT", nav_pricing: "PRICING", nav_contact: "문의하기",
      menu_label: "메뉴",

      translation_notice: '이 페이지는 번역 기능을 사용해 작성되었습니다. 어색한 부분이 있다면 <a href="https://forms.gle/wE6q54c8DHdfLNiC9">문의</a> 부탁드립니다.',
      translation_notice_footer: '　　이 페이지는 번역 기능을 사용해 작성되었습니다. 어색한 부분이 있다면 <a href="https://forms.gle/wE6q54c8DHdfLNiC9">문의</a> 부탁드립니다.',
      notice_close_label: "닫기",

      hero_eyebrow: "FREELANCE 3D MODELER",
      hero_title: '<span class="accent-word">일러스트와 똑같은</span><br>3D 바디를 얻자',
      hero_sub: 'Vtuber용 3D 모델(VRM)을 제작하고 있습니다.<br>삼면도 등 일러스트를 기반으로 Vroid로는 구현하기 어려운 복잡한 형태도 재현할 수 있는 풀스크래치 모델입니다.<br>Warudo 등 트래킹 소프트웨어 사용 방법도 지원하므로, 3D화가 처음인 분들도 안심하실 수 있습니다.',
      hero_cta_primary: "작업 보기",
      hero_cta_ghost: "견적/문의하기",
      availability_hero: "현재 의뢰 접수 중입니다 (다음 납품 가능 시기: 2027년 2월~)",

      work_tag: "SELECTED WORK",
      work_title: "작업",
      work_desc: "지금까지 작업한 캐릭터·크리처 에셋 중 일부입니다. 카드를 클릭하면 자세한 내용을 확인할 수 있습니다.",
      work_note: "",
      asset004_name: "Ransho Cian",
      asset005_name: "Mizuno Shiro",
      asset006_name: "Necobara Neco",
      asset007_name: "Lemon_773",
      asset008_name: "Tampopo-chan",
      asset009_name: "Amanagi Nagi",
      asset010_name: "Owata Owana",

      modal_video_label: "VIDEO",
      modal_video_link_text: "영상 보기",
      modal_close_label: "닫기",

      slider_prev_label: "이전 이미지",
      slider_next_label: "다음 이미지",

      zoom_hint_label: "확대 보기",

      pricing_tag: "PRICING",
      pricing_title: "요금 플랜",
      pricing_desc: "용도와 예산에 따라 3가지 플랜을 준비했습니다. 자세한 내용은 아래에 적힌 ‘Tsunagu’에서도 확인해 주세요.",

      price1_name: "라이트 플랜",
      price1_desc: "상반신만으로 비용을 절감하고 싶다면 *1",
      price1_unit: " / 1체",
      price1_f1: "상반신 모델",
      price1_f2: "A/I/U/E/O, 기쁨·분노·슬픔·즐거움, 눈 깜빡임, 윙크",
      price1_f3: "상반신 전체의 흔들림",
      price1_not1: "풀 트래킹",
      price1_not2: "퍼펙트 싱크",

      price2_badge: "추천",
      price2_name: "스탠다드 플랜",
      price2_desc: "3D 데뷔에 필요한 요소가 모두 갖춰진 플랜",
      price2_unit: " / 1체",
      price2_f1: "전신 모델",
      price2_f2: "아이우에오, 기쁨·분노·슬픔·즐거움, 눈 깜빡임, 윙크",
      price2_f3: "퍼펙트 싱크",
      price2_f4: "모든 흔들림",
      price2_not1: "표정 추가",
      price2_not2: "VRChat 변환",

      price3_name: "풀 커스텀 플랜",
      price3_desc: "원하는 요소를 담거나, 반대로 세트 플랜으로 예산을 절감하고 싶을 때에",
      price3_unit: " ～ 최대¥750,000",
      price3_amount: "별도 문의",
      price3_f1: "스탠다드 플랜의 모든 요소",
      price3_f2: "소품 추가·온오프 기능",
      price3_f3: "얼굴이 붉어지거나 반짝이는 눈 등 추가 표정",
      price3_f4: "MagicaCloth2를 이용한 부드러운 천 표현 *2",
      price3_f5: "VRChat 변환, 기믹 추가",

      price_cta: "문의하기",
      pricing_note: "※ 위 금액은 참고용입니다. 작업 난이도와 납기에 따라 조정될 수 있습니다.",

      about_tag: "PROFILE",
      about_title: "소개",
      about_p1: '<strong>blender와 게임을 사랑하는, 항구 마을에 사는 개.</strong><br>Vtuber로서의 경험과 재현도가 높은 모델링 스킬을 활용해, Vtuber를 위해 3D 모델 제작을 시작했습니다.',
      about_p2: '‘코코나라’는 개설 이래 최고 등급인 플래티넘을 꾸준히 유지하고 있습니다!"<br>‘배우는 것은 평생’이라는 좌우명을 가지고, note에서는 VRM 제작에 관한 Tips를 공개하고 있습니다.',
      about_p3: "소프트웨어 조작 지원부터 활용 방법 제안까지, 친절하고 이해하기 쉬운 대응을 항상 염두에 두고 있습니다. 먼저 편하게 상담해 주세요.", 

      contact_title: "우선 ‘つなぐ’에서<br>메시지를 남겨 주세요.",
      availability_contact: "현재 의뢰 접수 중입니다. 편하게 문의해 주세요."
    }
  };

  function applyLanguage(lang){
    const dict = translations[lang];
    if(!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(!(key in dict)) return;
      if(el.getAttribute('data-i18n-html') === 'true'){
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key]; // ここでテキストが差し替わる
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      const [key, attr] = el.getAttribute('data-i18n-attr').split(':');
      if(key in dict) el.setAttribute(attr, dict[key]);
    });

    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    currentLang = lang;
    updateTranslationNotice();
  }

  // translation notice bar + footer note (shown for non-Japanese languages only)
  const translationNotice = document.getElementById('translationNotice');
  const footerTranslationNote = document.getElementById('footerTranslationNote');
  const noticeCloseBtn = document.getElementById('noticeCloseBtn');
  let currentLang = 'ja';
  let noticeDismissed = { en: false, ko: false };

  function updateTranslationNotice(){
    const isTranslated = currentLang !== 'ja';
    const dismissedForCurrentLang = !!noticeDismissed[currentLang];
    translationNotice.hidden = !(isTranslated && !dismissedForCurrentLang);
    footerTranslationNote.hidden = !isTranslated;
  }
  noticeCloseBtn.addEventListener('click', ()=>{
    noticeDismissed[currentLang] = true;
    updateTranslationNotice();
  });

  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> applyLanguage(btn.dataset.lang));
  });

  // トップ画像のスライドショー設定
  (function(){
  const slides = document.querySelectorAll('.hero-slideshow img');
  if(slides.length <= 1) return;

  let current = 0;
  setInterval(()=>{
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000); // 5000 = 5秒ごとに切り替え。数値を変えれば速さを調整できます
})();

/* 先頭に戻るボタン */
(function(){
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', ()=>{
    backToTopBtn.classList.toggle('show', window.scrollY > 400); //ボタンの出てくるタイミングを調整
  });

  backToTopBtn.addEventListener('click', ()=>{
    window.scrollTo({ top:0, behavior:'smooth' });
  });
})();