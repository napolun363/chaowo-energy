// ============================================
// 平滑滚动
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        }

        // 移动端点击后关闭菜单
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});


// ============================================
// 导航栏滚动效果
// ============================================
const navbar = document.querySelector('.navbar');

function updateNavbar() {
    const navLinks = navbar?.querySelectorAll('.nav-links a');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar(); // 初始检查


// ============================================
// 移动端汉堡菜单
// ============================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // 移动端下拉菜单展开/收起
    const dropdowns = navLinks.querySelectorAll('.dropdown > a');
    dropdowns.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = this.closest('.dropdown');
                parent.classList.toggle('open');
            }
        });
    });
}


// ============================================
// 表单提交（EmailJS 真实发送 + localStorage 备份）
//
// 使用前请先在 https://emailjs.com 注册账号：
//   1. 创建 Email Service（连接你的邮箱，如 info@chaowo-energy.com）
//   2. 创建 Email Template（变量：name, phone, company, device, message, time）
//   3. 获取 Public Key、Service ID、Template ID
//   4. 替换下面三处占位值即可生效
// ============================================
emailjs.init('YOUR_PUBLIC_KEY'); // ← 替换为你的 EmailJS Public Key

const contactForm = document.getElementById('contactForm');
const formTip = document.getElementById('formTip');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = this.querySelector('input[name="name"]').value.trim();
        const phone = this.querySelector('input[name="phone"]').value.trim();
        const company = this.querySelector('input[name="company"]').value.trim();
        const device = this.querySelector('input[name="device"]')?.value.trim() || '';
        const message = this.querySelector('textarea[name="message"]').value.trim();
        
        if (!name || !phone || !company) {
            showFormTip('请填写所有必填字段（姓名、电话、公司）', 'error');
            return;
        }

        if (!/^[\d\s+\-()]{7,15}$/.test(phone)) {
            showFormTip('请输入有效的电话号码', 'error');
            return;
        }

        // 本地备份一份（防止网络异常丢失）
        const record = { name, phone, company, device, message, time: new Date().toISOString() };
        const saved = JSON.parse(localStorage.getItem('cw_leads') || '[]');
        saved.push(record);
        localStorage.setItem('cw_leads', JSON.stringify(saved));

        submitBtn.disabled = true;
        submitBtn.textContent = '正在提交...';
        showFormTip('正在发送，请稍候...', '');

        // EmailJS 发送参数（需在 emailjs.com 注册并替换以下值）
        emailjs.send(
            'service_chaowo',   // ← 替换为你的 Service ID
            'template_contact', // ← 替换为你的 Template ID
            {
                name: name,
                phone: phone,
                company: company,
                device: device || '未填写',
                message: message || '无',
                time: new Date().toLocaleString('zh-CN')
            }
        ).then(function(response) {
            showFormTip('✅ 提交成功！我们将在24小时内与您联系。', 'success');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = '提交需求 · 获取定制方案';
        }, function(error) {
            console.error('EmailJS error:', error);
            showFormTip('⚠️ 提交失败，请稍后重试或直接致电：180-6244-9031', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = '提交需求 · 获取定制方案';
        });
    });
}

function showFormTip(msg, type) {
    if (!formTip) return;
    formTip.textContent = msg;
    formTip.className = 'form-tip' + (type === 'error' ? ' error' : '');
    setTimeout(() => { formTip.textContent = ''; }, 6000);
}


// ============================================
// 悬浮联系按钮
// ============================================
const floatContact = document.getElementById('floatContact');
const floatToggle = document.getElementById('floatToggle');

if (floatToggle && floatContact) {
    floatToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        floatContact.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
        if (!floatContact.contains(e.target)) {
            floatContact.classList.remove('open');
        }
    });
}


// ============================================
// 数字计数动画
// ============================================
function animateCounter(element, target, duration) {
    duration = duration || 2000;
    // 判断是否有单位后缀（如㎡、万+等）
    const originalText = element.textContent;
    const isSpecial = originalText.includes('㎡') || originalText.includes('万');
    
    if (isSpecial) return; // 特殊格式不做数字动画

    let start = 0;
    const increment = target / (duration / 16);
    
    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(update);
        } else {
            element.textContent = target + '+';
        }
    }
    update();
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stats = entry.target.querySelectorAll('.stat p');
            const targets = [50, null, null, 500]; // 10000㎡ 和 1000万+ 保持原样
            stats.forEach((stat, index) => {
                if (targets[index]) {
                    animateCounter(stat, targets[index]);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });

const aboutSection = document.querySelector('#about');
if (aboutSection) statsObserver.observe(aboutSection);


// ============================================
// 滚动入场动画
// ============================================
const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            animateObserver.unobserve(entry.target);
            
            const headings = entry.target.querySelectorAll('h2, h3');
            headings.forEach((heading, i) => {
                setTimeout(() => heading.classList.add('text-reveal'), i * 80);
            });
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.scroll-animate').forEach(el => animateObserver.observe(el));


// ============================================
// 鼠标跟随光标
// ============================================
const mouseFollow = document.createElement('div');
mouseFollow.className = 'mouse-follow';
document.body.appendChild(mouseFollow);

document.addEventListener('mousemove', (e) => {
    mouseFollow.style.left = (e.clientX - 9) + 'px';
    mouseFollow.style.top  = (e.clientY - 9) + 'px';
}, { passive: true });


// ============================================
// 背景粒子
// ============================================
function createParticles() {
    const container = document.createElement('div');
    container.className = 'particles';
    document.body.appendChild(container);
    
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top  = Math.random() * 100 + '%';
        p.style.animationDelay    = Math.random() * 6 + 's';
        p.style.animationDuration = (Math.random() * 3 + 4) + 's';
        container.appendChild(p);
    }
}

window.addEventListener('load', createParticles);


// ============================================
// 产品中心交互
// ============================================
function initProductShowcase() {
    // 每类3个代表产品：hero图 + 3张卡片数据 + 特性标签
    const productData = {
        ternary: {
            hero: 'products/ncm-medical-ultrasound.jpg',
            name: '三元锂电池',
            desc: '高能量密度，优异循环性能，适合对重量和体积有严苛要求的设备',
            features: ['高能量密度', '200-300Wh/kg', '-20~60℃'],
            cards: [
                { img: 'products/ncm-medical-ultrasound.jpg', model: 'CW-NMC-3S-11.1V-2.6Ah', app: '医疗护理设备', specs: { voltage: '11.1V', capacity: '2.6Ah', type: '三元锂' }},
                { img: 'products/ncm-laser-range.jpg',       model: 'CW-NMC-1S-3.7V-7Ah',    app: '工业检测仪器', specs: { voltage: '3.7V',  capacity: '7Ah',   type: '三元锂' }},
                { img: 'products/ncm-drone-48V-20Ah.jpg',    model: 'CW-NMC-14S-53.2V-20Ah', app: '工业无人机',   specs: { voltage: '53.2V', capacity: '20Ah',  type: '三元锂' }},
            ]
        },
        polymer: {
            hero: 'products/poly-digital-camera-3.7V-1.2Ah.jpg',
            name: '聚合物锂电池',
            desc: '超薄异形可定制，智能穿戴与医疗设备首选',
            features: ['超薄2.5mm', '异形定制', '柔性封装'],
            cards: [
                { img: 'products/poly-digital-camera-3.7V-1.2Ah.jpg', model: 'CW-NMC-1S-3.7V-1.2Ah', app: '智能数码产品', specs: { voltage: '3.7V', capacity: '1.2Ah', type: '聚合物' }},
                { img: 'products/poly-pda-3.7V-1.6Ah.jpg',      model: 'CW-NMC-1S-3.7V-1.6Ah', app: '智能穿戴设备', specs: { voltage: '3.7V', capacity: '1.6Ah', type: '聚合物' }},
                { img: 'products/poly-police-3.8V-2.6Ah.jpg',    model: 'CW-NMC-1S-3.8V-2.6Ah', app: '智能穿戴设备', specs: { voltage: '3.8V', capacity: '2.6Ah', type: '聚合物' }},
            ]
        },
        lifepo4: {
            hero: 'products/lfp-ess-12V-100Ah.jpg',
            name: '磷酸铁锂电池',
            desc: '长循环寿命，本质安全，储能与动力场景最经济选择',
            features: ['2000+次循环', '本质安全', '性价比高'],
            cards: [
                { img: 'products/lfp-ess-12V-100Ah.jpg',        model: 'CW-LFP-4S-12.8V-100Ah', app: '智慧城市基础设施', specs: { voltage: '12.8V', capacity: '100Ah', type: '磷酸铁锂' }},
                { img: 'products/lfp-big-cell-3.2V-280Ah.jpg',  model: 'CW-LFP-1S-3.2V-280Ah',  app: '智慧城市基础设施', specs: { voltage: '3.2V',  capacity: '280Ah', type: '磷酸铁锂' }},
                { img: 'products/lfp-ess-12V-150Ah.jpg',        model: 'CW-LFP-4S-12.8V-150Ah', app: '智慧城市基础设施', specs: { voltage: '12.8V', capacity: '150Ah', type: '磷酸铁锂' }},
            ]
        },
        lowtemp: {
            hero: 'products/ncm-drone-48V-20Ah.jpg',
            name: '低温锂电池',
            desc: '耐-40℃极寒环境，户外检测与植保无人机专用',
            features: ['耐-40℃', '低温放电85%', '极寒专用'],
            cards: [
                { img: 'products/ncm-drone-48V-20Ah.jpg',   model: 'CW-NMC-14S-53.2V-20Ah', app: '工业无人机',     specs: { voltage: '53.2V', capacity: '20Ah',  type: '三元锂' }},
                { img: 'products/ncm-laser-range.jpg',      model: 'CW-NMC-1S-3.7V-7Ah',    app: '工业检测仪器',   specs: { voltage: '3.7V',  capacity: '7Ah',   type: '三元锂' }},
                { img: 'products/er-medical-18V-1330Ah.png', model: 'CW-ER-5S-18V-1330Ah',  app: '物联网(IoT)设备', specs: { voltage: '18V',   capacity: '1330Ah',type: '锂亚' }},
            ]
        },
        hightemp: {
            hero: 'products/power-robot-48V-60Ah.jpg',
            name: '高温锂电池',
            desc: '耐85℃高温，恶劣工业环境可靠运行',
            features: ['耐85℃', '工业级', '恶劣环境'],
            cards: [
                { img: 'products/power-robot-48V-60Ah.jpg',     model: 'CW-LFP-15S10P-48V-60Ah', app: '服务与工业机器人', specs: { voltage: '48V',  capacity: '60Ah', type: '动力锂' }},
                { img: 'products/power-agv-48V-150Ah.jpg',      model: 'CW-LFP-15S-48V-150Ah',   app: '交通与AGV设备',   specs: { voltage: '48V',  capacity: '150Ah',type: '动力锂' }},
                { img: 'products/power-drone-14.8V-7.8Ah.jpg',  model: 'CW-NMC-4S3P-14.8V-7.8Ah', app: '服务与工业机器人', specs: { voltage: '14.8V', capacity: '7.8Ah',type: '动力锂' }},
            ]
        },
        power: {
            hero: 'products/power-robot-48V-60Ah.jpg',
            name: '动力锂电池',
            desc: '高功率输出，长续航，机器人和AGV设备首选',
            features: ['高功率输出', '大电流放电', '长续航'],
            cards: [
                { img: 'products/power-robot-48V-60Ah.jpg',     model: 'CW-LFP-15S10P-48V-60Ah', app: '服务与工业机器人', specs: { voltage: '48V',  capacity: '60Ah', type: '动力锂' }},
                { img: 'products/power-agv-48V-150Ah.jpg',      model: 'CW-LFP-15S-48V-150Ah',   app: '交通与AGV设备',   specs: { voltage: '48V',  capacity: '150Ah',type: '动力锂' }},
                { img: 'products/power-drone-14.8V-7.8Ah.jpg',  model: 'CW-NMC-4S3P-14.8V-7.8Ah', app: '工业无人机',      specs: { voltage: '14.8V', capacity: '7.8Ah',type: '动力锂' }},
            ]
        },
        storage: {
            hero: 'products/ess-48V-210Ah.png',
            name: '储能锂电池',
            desc: '大容量高效率，光伏储能与应急备电首选',
            features: ['大容量', '10年寿命', '光伏储能'],
            cards: [
                { img: 'products/ess-48V-210Ah.png',       model: 'CW-LFP-16S-51.2V-210Ah', app: '应急备电与储能',   specs: { voltage: '51.2V', capacity: '210Ah', type: '储能锂' }},
                { img: 'products/ess-48V-315Ah.png',       model: 'CW-LFP-16S-51.2V-315Ah', app: '应急备电与储能',   specs: { voltage: '51.2V', capacity: '315Ah', type: '储能锂' }},
                { img: 'products/outdoor-150W.jpg',         model: 'CW-NMC-7S-25.9V-42Ah',   app: '应急备电与储能',   specs: { voltage: '25.9V', capacity: '42Ah',  type: '储能锂' }},
            ]
        },
        smart: {
            hero: 'products/poly-digital-camera-3.7V-1.2Ah.jpg',
            name: '智能锂电池',
            desc: '内置SOC/SOH算法，支持多协议通信与远程监控',
            features: ['SOC/SOH算法', '多协议通信', '远程监控'],
            cards: [
                { img: 'products/poly-digital-camera-3.7V-1.2Ah.jpg', model: 'CW-NMC-1S-3.7V-1.2Ah', app: '智能数码产品', specs: { voltage: '3.7V', capacity: '1.2Ah', type: '聚合物' }},
                { img: 'products/ncm-laser-range.jpg',           model: 'CW-NMC-1S-3.7V-7Ah',    app: '工业检测仪器', specs: { voltage: '3.7V', capacity: '7Ah',   type: '三元锂' }},
                { img: 'products/poly-pda-3.7V-1.6Ah.jpg',       model: 'CW-NMC-1S-3.7V-1.6Ah',  app: '智能穿戴设备', specs: { voltage: '3.7V', capacity: '1.6Ah', type: '聚合物' }},
            ]
        },
        more: {
            hero: 'products/ncm-drone-48V-20Ah.jpg',
            name: '定制产品',
            desc: '告诉我您的设备型号，48小时内出方案',
            features: ['全品类定制', '48h出方案', '7-15天交付'],
            cards: [
                { img: 'products/ncm-drone-48V-20Ah.jpg',      model: '定制', app: '按应用场景定制', specs: { voltage: '定制', capacity: '定制', type: '定制' }},
                { img: 'products/power-robot-48V-60Ah.jpg',    model: '定制', app: '按应用场景定制', specs: { voltage: '定制', capacity: '定制', type: '定制' }},
                { img: 'products/lfp-ess-12V-100Ah.jpg',       model: '定制', app: '按应用场景定制', specs: { voltage: '定制', capacity: '定制', type: '定制' }},
            ]
        }
    };

    const menuItems  = document.querySelectorAll('.menu-item');
    const mainImg    = document.querySelector('#mainProductImage');
    const titleEl    = document.querySelector('#productTitle');
    const descEl     = document.querySelector('#productDesc');
    const featureBox = document.querySelector('#productFeatures');
    const cardImgs   = document.querySelectorAll('.product-card-image img');
    const cardModels = document.querySelectorAll('.product-card-model');
    const cardApps   = document.querySelectorAll('.product-card-app');
    const cardTitles = document.querySelectorAll('.product-card-info h4');
    const specItems  = document.querySelectorAll('.product-specs');
    let busy = false;

    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (busy) return;
            const d = productData[this.dataset.product];
            if (!d) return;
            busy = true;

            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // 左侧大图淡入切换
            mainImg.style.opacity = '0';
            mainImg.style.transform = 'scale(0.95)';
            setTimeout(() => {
                mainImg.src = d.hero;
                titleEl.textContent = d.name;
                descEl.textContent  = d.desc;
                // 更新特性标签
                if (featureBox) {
                    featureBox.innerHTML = d.features.map(f => '<span class="feature-tag">' + f + '</span>').join('');
                }
                mainImg.style.opacity = '1';
                mainImg.style.transform = 'scale(1)';
                setTimeout(() => { busy = false; }, 300);
            }, 300);

            // 右侧3张卡片联动
            d.cards.forEach((card, i) => {
                const img   = cardImgs[i];
                const model = cardModels[i];
                const app   = cardApps[i];
                if (!img) return;
                // 图片动画
                img.style.transform = 'scale(0.85)';
                img.style.opacity   = '0';
                setTimeout(() => {
                    img.src = card.img;
                    img.style.transform = 'scale(1.05)';
                    img.style.opacity   = '1';
                    setTimeout(() => { img.style.transform = 'scale(1)'; }, 180);
                }, 200 + i * 80);
                // 型号标签
                if (model) {
                    model.style.opacity = '0';
                    setTimeout(() => { model.textContent = card.model; model.style.opacity = '1'; }, 300 + i * 80);
                }
                // 应用标签
                if (app) {
                    app.style.opacity = '0';
                    setTimeout(() => { app.textContent = card.app; app.style.opacity = '1'; }, 350 + i * 80);
                }
            });

            // 卡片标题
            cardTitles.forEach(t => {
                t.style.opacity = '0';
                setTimeout(() => { t.textContent = d.name; t.style.opacity = '1'; }, 260);
            });

            // 规格参数（每张卡片使用各自数据）
            specItems.forEach((spec, idx) => {
                const c = d.cards[idx];
                if (!c) return;
                const spans = spec.querySelectorAll('span');
                [1,3,5].forEach(i => {
                    if (spans[i]) { spans[i].style.opacity = '0'; spans[i].style.transform = 'translateX(-8px)'; }
                });
                setTimeout(() => {
                    if (spans[1]) spans[1].textContent = c.specs.voltage;
                    if (spans[3]) spans[3].textContent = c.specs.capacity;
                    if (spans[5]) spans[5].textContent = c.specs.type;
                    [1,3,5].forEach(i => {
                        if (spans[i]) { spans[i].style.opacity = '1'; spans[i].style.transform = 'translateX(0)'; }
                    });
                }, 380);
            });
        });

        // 点击跳转（直接跳转，不等动画完成）
        item.addEventListener('click', function(e) {
            const href = this.dataset.href;
            if (href) {
                e.stopPropagation();
                window.location.href = href;
            }
        });
    });

    // 初始化：默认显示三元锂
    const defaultData = productData['ternary'];
    if (defaultData) {
        if (mainImg) mainImg.src = defaultData.hero;
        if (titleEl) titleEl.textContent = defaultData.name;
        if (descEl)  descEl.textContent  = defaultData.desc;
        if (featureBox) {
            featureBox.innerHTML = defaultData.features.map(f => '<span class="feature-tag">' + f + '</span>').join('');
        }
        defaultData.cards.forEach((card, i) => {
            if (cardImgs[i])  cardImgs[i].src  = card.img;
            if (cardModels[i]) cardModels[i].textContent = card.model;
            if (cardApps[i])   cardApps[i].textContent   = card.app;
        });
    }
}

window.addEventListener('load', initProductShowcase);


// ============================================
// FAQ 手风琴交互
// ============================================
function toggleFaq(button) {
    const faqItem = button.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');

    // 关闭所有其他 FAQ 项（手风琴模式）
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // 如果点击的是非激活项，则打开它
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// ============================================
// 横幅视频质量增强
// ============================================
(function initBannerVideo() {
    const video = document.querySelector('.banner-video video');
    if (!video) return;

    // 强制最高质量播放
    video.setAttribute('playsinline', '');
    if ('webkitEnterFullscreen' in video) {
        // iOS 强制内联播放，不跳全屏
        video.setAttribute('webkit-playsinline', '');
    }

    // 视频加载完成后移除 poster（避免 poster 闪烁遮住首帧）
    video.addEventListener('canplay', function onCanPlay() {
        video.removeAttribute('poster');
        video.removeEventListener('canplay', onCanPlay);
    }, { once: true });

    // 播放失败时降级静默处理（移动端省流/低电量模式）
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // 自动播放被阻止时（如移动端低电量模式），让视频停在第一帧
            video.pause();
            video.currentTime = 0;
            // 可选：添加播放按钮提示（当前静默处理）
        });
    }

    // 页面不可见时暂停，回来时续播（省电 + 防资源浪费）
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
        } else {
            video.play().catch(() => {});
        }
    });

    // 节省流量提示：超慢网络时降低视频优先级
    if ('connection' in navigator) {
        const conn = navigator.connection;
        if (conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
            video.pause();
            video.removeAttribute('autoplay');
            // 降级为显示 poster 静态背景
            video.style.display = 'none';
        }
    }
})();
