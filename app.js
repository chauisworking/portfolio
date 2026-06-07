/**
 * Portfolio JavaScript Engine
 * Controls: ROI Calculator, GTM Simulator Console, Theme Engine, Layout Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. THEME ENGINE (Light & Dark Mode)
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('svg');
  
  // Set default theme from localStorage or system preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  setTheme(initialTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    
    // Update theme icon
    if (theme === 'dark') {
      themeIcon.innerHTML = `
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      `;
      themeToggle.setAttribute('title', 'Switch to Light Mode');
    } else {
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
      `;
      themeToggle.setAttribute('title', 'Switch to Dark Mode');
    }
  }

  // ==========================================
  // 2. LIVE GTM EVENT TRACKING SIMULATOR
  // ==========================================
  const consoleWidget = document.getElementById('console-widget');
  const consoleTrigger = document.getElementById('console-trigger');
  const consoleWindow = document.getElementById('console-window');
  const consoleClose = document.getElementById('console-close');
  const consoleClear = document.getElementById('console-clear');
  const consoleDownload = document.getElementById('console-download');
  const consoleBody = document.getElementById('console-body');
  
  // Custom virtual dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Track open/close state
  consoleTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    consoleWindow.classList.add('active');
    consoleTrigger.style.display = 'none';
    logToConsole('console_open', 'GTM Console opened by user', 'gtm-sys');
  });
  
  consoleClose.addEventListener('click', (e) => {
    e.stopPropagation();
    consoleWindow.classList.remove('active');
    consoleTrigger.style.display = 'flex';
  });
  
  // Close console window when clicking outside
  document.addEventListener('click', (e) => {
    if (consoleWindow.classList.contains('active') && !consoleWidget.contains(e.target)) {
      consoleWindow.classList.remove('active');
      consoleTrigger.style.display = 'flex';
    }
  });
  
  consoleClear.addEventListener('click', () => {
    consoleBody.innerHTML = '';
    logToConsole('console_clear', 'Console log history cleared', 'gtm-sys');
  });
  
  consoleDownload.addEventListener('click', () => {
    const textLogs = Array.from(consoleBody.querySelectorAll('.console-log-entry'))
      .map(entry => entry.innerText)
      .join('\n');
    
    const blob = new Blob([textLogs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtm_datalayer_export_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logToConsole('console_download', 'Triggered dataLayer log text export', 'gtm-sys');
  });
  
  // Log message formatter
  function logToConsole(event, details, categoryClass) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    
    // Append to virtual window.dataLayer
    window.dataLayer.push({
      event: event,
      timestamp: now.getTime(),
      details: details
    });
    
    const entry = document.createElement('div');
    entry.className = 'console-log-entry';
    entry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-event ${categoryClass}">${event}</span>
      <span class="log-details">${details}</span>
    `;
    
    consoleBody.appendChild(entry);
    consoleBody.scrollTop = consoleBody.scrollHeight;
  }
  
  // Initial Page Load logs
  setTimeout(() => {
    logToConsole('gtm.js', 'Google Tag Manager Container Loaded (GTM-MKTGPORT)', 'gtm-sys');
  }, 300);
  
  setTimeout(() => {
    logToConsole('gtm.dom', 'DOM Ready (HTML parsed and structure loaded)', 'gtm-sys');
  }, 500);
  
  setTimeout(() => {
    logToConsole('gtm.load', 'Window Loaded (Images & stylesheets verified)', 'gtm-sys');
  }, 750);
  
  // Track scroll depth metrics
  const trackedScrollDepths = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    [25, 50, 75, 100].forEach(threshold => {
      if (scrollPercent >= threshold && !trackedScrollDepths[threshold]) {
        trackedScrollDepths[threshold] = true;
        logToConsole('scroll_depth', `Threshold reached: ${threshold}% | GA4 Event Triggered`, 'gtm-scroll');
      }
    });
  });
  
  // Track out-bound button clicks
  document.querySelectorAll('a, button').forEach(elem => {
    // Exclude GTM simulator elements
    if (elem.closest('#console-widget') || elem.closest('.theme-toggle')) return;
    
    elem.addEventListener('click', () => {
      const tagId = elem.getAttribute('id') || 'unknown';
      const label = elem.innerText.trim() || elem.getAttribute('aria-label') || 'Icon Link';
      logToConsole('element_click', `ID: ${tagId} | Text: "${label}" | Custom Event Dispatched`, 'gtm-click');
    });
  });
  
  // Track hovering on cards for insights
  document.querySelectorAll('.expertise-card, .stat-card').forEach(card => {
    let hoverTimer;
    card.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(() => {
        const title = card.querySelector('h3, .stat-label')?.innerText.trim() || 'Info Card';
        logToConsole('element_hover', `Focused on Card: "${title}" for 1.5s (Intent detected)`, 'gtm-hover');
      }, 1500);
    });
    
    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
    });
  });



  // ==========================================
  // 4. TECH BADGES INTERACTION & FILTER
  // ==========================================
  document.querySelectorAll('.tech-badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const text = badge.innerText.trim();
      logToConsole('badge_focus', `Clicked Tech badge: "${text}" | Displaying skills profile info`, 'gtm-click');
      
      // Flash animation on click
      badge.style.transform = 'scale(0.95)';
      setTimeout(() => {
        badge.style.transform = 'translateY(-1px)';
      }, 100);
    });
  });

  // 4b. Skill Chips About Me interaction
  document.querySelectorAll('.skill-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const skillName = chip.getAttribute('data-skill') || chip.innerText.trim();
      logToConsole('skill_chip_click', `GTM Event: skill_selected | Tech: "${skillName}"`, 'gtm-click');
      
      // Flash animation on click
      chip.style.transform = 'scale(0.95)';
      setTimeout(() => {
        chip.style.transform = '';
      }, 100);
    });
  });

  // ==========================================
  // 5. CONTACT FORM VALIDATION & SIMULATION
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formOverlay = document.getElementById('form-success-overlay');
  const resetFormBtn = document.getElementById('reset-form-btn');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const company = document.getElementById('contact-company').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      
      // Basic client validation
      if (!name || !email || !message) {
        logToConsole('form_error', 'Submission blocked: Required fields missing', 'gtm-form');
        alert('Please fill out all required fields.');
        return;
      }
      
      // Simulate form submission API call delay
      logToConsole('form_submit_start', `Submitting lead contact info: ${name} (${email})`, 'gtm-form');
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';
      
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        // Show success visual state
        formOverlay.classList.add('active');
        
        logToConsole('form_submit_success', `Lead captured successfully. Lead ID: lead_${Math.random().toString(36).substring(2, 9)}`, 'gtm-form');
        
        // Dispatches lead pixel event
        logToConsole('meta_lead_event', 'Meta Ads Lead Pixel Fired (conversion value: $150.00)', 'gtm-click');
      }, 1200);
    });
    
    resetFormBtn.addEventListener('click', () => {
      contactForm.reset();
      formOverlay.classList.remove('active');
      logToConsole('form_reset', 'Cleared contact form inputs to allow new submission', 'gtm-form');
    });
  }

  // ==========================================
  // 6. CASE STUDY MODAL & CAMPAIGN DATABASE
  // ==========================================
  
  const caseStudiesDb = {
  project_00: {
    title: "Paraquat Litigation Campaign - Tosi Law client",
    industry: "Legal Services",
    period: "2025",
    icon: "briefcase",
    tagline: "Generated qualified Paraquat litigation leads with low Cost Per Deal.",
    kpis: [
      { value: "$92,240", label: "Total Ad Spend" },
      { value: "615", label: "Leads Generated" },
      { value: "$150", label: "Cost Per Lead" },
{ value: "44", label: "Signed Deals" },
      { value: "$2,096", label: "Cost Per Deal" }
    ],
    overview: "Paraquat is a widely used herbicide linked to Parkinson’s disease. The campaign aimed to acquire qualified claimants across the US while maintaining strong lead quality and cost efficiency.",
    challenge: "Balancing high lead volume with quality and accurate geographic attribution, and optimizing CPD across multiple paid channels.",
    role: "Paid Media Specialist. Managed acquisition across Google, Meta, TikTok, and Bing, and performed lead quality analysis.",
    strategy: [
      "Managed and optimized acquisition campaigns across Google, Meta, TikTok, and Bing.",
      "Evaluated performance using qualified leads, signed deals, and Cost Per Deal (CPD) rather than lead volume alone.",
      "Conducted keyword, search term, and channel performance analysis to identify optimization opportunities.",
      "Assessed landing page relevance, creative messaging, and audience targeting strategies.",
      "Analyzed lead quality trends and downstream conversion performance to support budget allocation decisions."
    ],
    keyLearnings: [
      {
        title: "High Intent Search Terms Drive Better Deal Quality",
        text: "Keywords such as \"Paraquat lawsuit\" and \"Paraquat lawsuit attorney\" consistently generated stronger deal outcomes because users were actively seeking legal representation rather than general information."
      },
      {
        title: "Search Intent and Landing Page Relevance Must Align",
        text: "Search term analysis revealed that many users were looking for settlement updates, compensation information, and lawsuit status rather than immediately seeking legal assistance. Competitors that addressed these informational needs more directly often created a stronger user experience and captured demand more effectively."
      },
      {
        title: "Lead Volume Does Not Always Translate Into Business Results",
        text: "Meta Call Campaigns generated substantial call volume but failed to produce signed cases. The campaign highlighted a key limitation of optimizing for platform-generated call objectives, which prioritize call quantity rather than claimant quality."
      },
      {
        title: "Geographic Analysis Requires More Than Submitted Location Data",
        text: "Performance reviews identified discrepancies between Contact State and IP State. Some leads submitted forms from one state while browsing from another, creating potential inaccuracies in state-level performance analysis and budget allocation decisions."
      },
      {
        title: "Emotional Messaging Improved Lead Quality",
        text: "Family-oriented creative angles referencing spouses and loved ones generated stronger lead quality signals compared to generic litigation messaging, despite most retained claimants ultimately being the affected individuals themselves."
      },
      {
        title: "Emerging Audiences Can Reveal Untapped Opportunities",
        text: "Analysis of signed-case data revealed unexpected claimant patterns, including individuals working in golf course maintenance and landscaping environments. These findings suggested potential expansion opportunities toward occupations with higher Paraquat exposure risk."
      },
      {
        title: "Channel Performance Should Be Evaluated Beyond CPL",
        text: "TikTok generated fewer leads and a higher CPL than some other channels. However, its Cost Per Deal remained competitive, reinforcing the importance of evaluating channels using downstream business outcomes rather than top-of-funnel metrics alone."
      }
    ],
    keyLearningsSummary: "Evaluating downstream performance, optimizing search intent, and auditing geographic data quality are key to maximizing case acquisition efficiency.",
    tools: ["Google Ads", "Meta Ads", "TikTok Ads", "Bing Ads"],
    results: [
      "Achieved $2,096 Cost Per Deal, the lowest among comparable activations.",
      "Generated 615 leads with $150 CPL.",
      "Secured 44 signed deals driving $2.8M revenue."
    ],
    beforeAfter: {
      before: "High CPL and low qualified lead conversion, fragmented attribution.",
      after: "Reduced CPD, improved lead quality, unified tracking across channels."
    }
  },
    project_01: {
      title: "Suzuki Jimny Lead Generation Campaign",
      industry: "Automotive",
      period: "Apr 2024 – Jul 2025",
      icon: "car",
      tagline: "Achieved 100% qualified lead KPI while maintaining the highest agency performance fee tier.",
      kpis: [
        { value: "100%", label: "KPI Target Met" },
        { value: "45.37%", label: "Qualified Lead Rate" },
        { value: "Tier 1", label: "Agency Fee Tier" },
        { value: "6+", label: "Channels Managed" }
      ],
      overview: "Managed an end-to-end lead generation campaign for Suzuki Jimny, combining performance marketing, automation, and cross-functional collaboration to maximize lead quality and operational efficiency.",
      challenge: "Filtering out low-intent registrations and duplicate leads for this highly sought-after off-road model, while maintaining a low Cost-Per-Lead (CPL) and maximizing CRM lead validation rates.",
      role: "Campaign Strategy Lead & Automation Developer. Architected the cross-channel paid funnel and CRM tracking links integration.",
      strategy: [
        "Managed branding and lead generation campaigns across 6+ distinct networks.",
        "Monitored strict budget pacing and keyword-level conversion triggers.",
        "Developed Google Apps Script automation for immediate localized Bitly tracking link generation.",
        "Implemented HubSpot CRM duplicate lead detection rules to protect database integrity.",
        "Collaborated with dealer sales managers on optimized response time workflows."
      ],
      tools: ["Meta Ads", "Google Ads", "Google Apps Script", "Google Sheets", "CRM Systems"],
      results: [
        "Delivered a record 45.37% qualified lead validation rate.",
        "Secured 100% of Suzuki distributor's target performance KPIs.",
        "Sustained the highest agency performance fee payout tier."
      ],
      beforeAfter: {
        before: "Manual local link generation and high duplicate leads (18% redundancy).",
        after: "100% automated link dispatch and duplicate lead rate reduced below 2%."
      },
      process: ["Audience Modeling", "Google/Meta Buy", "CRM Link Auto", "Dealer Activation"]
    },
    project_02: {
      title: "Finifer Jewelry Customer Acquisition & Retention",
      industry: "Luxury Jewelry",
      period: "Q4 2023 – Q1 2024",
      icon: "gem",
      tagline: "Generated 2.8B VND revenue through CDP-driven retention and personalized customer activation.",
      kpis: [
        { value: "4.0x", label: "Facebook ROAS" },
        { value: "+15%", label: "Conversion Lift" },
        { value: "2.8B", label: "SMS Revenue (VND)" },
        { value: "3+", label: "Ad Networks" }
      ],
      overview: "Executed a comprehensive e-commerce acquisition and customer retention strategy combining paid social channels, Customer Data Platform (CDP) segmentation, and custom SMS flows.",
      challenge: "Sustaining high conversion volumes during luxury buying seasons without driving up acquisition costs, while re-engaging historical high-value customer bases.",
      role: "Paid Media Specialist & CDP CRM Strategist. Led multi-channel paid spend and RFM cohort segmentation.",
      strategy: [
        "Developed multi-channel acquisition funnels targeting premium demographic interests.",
        "Segmented first-party customer profiles using RFM (Recency, Frequency, Monetary) cohort parameters.",
        "Built automated SMS messaging automation trigger trees tied to CRM lifecycles.",
        "Optimized lookalike audiences based on verified luxury purchasers.",
        "Refined creative test groups across Facebook and TikTok ad feeds."
      ],
      tools: ["Facebook Ads", "TikTok Ads", "Google Ads", "CDP Platforms", "SMS Automation"],
      results: [
        "Achieved a consistent 4.0x Return on Ad Spend (ROAS) on Facebook campaigns.",
        "Captured a 15% conversion rate increase across paid search funnels.",
        "Generated 2.8 Billion VND in direct revenue from SMS lifecycles."
      ],
      beforeAfter: {
        before: "Fragmented user cohorts and isolated retargeting setups.",
        after: "CDP-aligned cohort funnels with automated first-party retention loops."
      },
      process: ["CDP Core Segment", "RFM Grouping", "Omnichannel Ad", "SMS Automation"]
    },
    project_03: {
      title: "Suzuki XL7 Hybrid Launch Campaign",
      industry: "Automotive",
      period: "Aug 2024 – Dec 2024",
      icon: "zap",
      tagline: "Exceeded reach KPI by 112% while maintaining a 51.60% qualified lead rate.",
      kpis: [
        { value: "112%", label: "Reach KPI" },
        { value: "1238%", label: "Engagement" },
        { value: "51.60%", label: "Qualified Lead" },
        { value: "340K", label: "CPL (VND)" }
      ],
      overview: "Successfully introduced the new Suzuki XL7 Hybrid SUV to the market, executing multi-tiered awareness campaigns and premium qualified lead acquisition models.",
      challenge: "Building rapid trust in hybrid technology for domestic buyers and maintaining high qualified lead thresholds amid strong SUV segment competition.",
      role: "Lead Performance Executive. Formulated channels mapping, creative optimizations, and target dealer integrations.",
      strategy: [
        "Exceeded initial target reach requirements through hyper-targeted localized ad placements.",
        "Achieved 1238% engagement KPI target via hybrid-education creative formats.",
        "Maintained 51.60% Qualified Lead Rate through CRM qualification filters.",
        "Sustained highly optimized Cost-Per-Lead (CPL) benchmarks below target limits."
      ],
      tools: ["Meta Ads", "Google Ads", "HubSpot", "CDP", "Automotive CRM"],
      results: [
        "112% of total reach objectives achieved within launch week.",
        "51.60% qualified lead rate (highest registered launch category).",
        "Cost-Per-Lead optimized down to 340,697 VND average."
      ],
      process: ["Launch Planning", "Video Ad Reach", "Lead Capture Form", "Sales Dispatch"]
    },
    project_04: {
      title: "Jaspal Group Fashion Portfolio Campaign",
      industry: "Fashion",
      period: "May 2024 – Mar 2025",
      icon: "shirt",
      tagline: "Managed awareness campaigns across 7 fashion brands while achieving all monthly KPI targets.",
      kpis: [
        { value: "100%", label: "KPI Target Met" },
        { value: "20%", label: "Page Growth" },
        { value: "7", label: "Brands Managed" },
        { value: "15M+", label: "Total Impressions" }
      ],
      overview: "Managed multi-brand awareness and customer acquisition paid campaigns for Jaspal Group, standardizing creative assets and metrics tracking workflows across 7 luxury fashion labels.",
      challenge: "Handling distinct brand guidelines, target demographics, and varying inventory timelines across multiple retail labels without diluting resource performance.",
      role: "Multi-Brand Account Manager & Performance Planner. Controlled client communication and media spend optimization.",
      strategy: [
        "Standardized monthly performance reporting frameworks across all fashion brands.",
        "Accelerated page follower metrics by an average of 20% across retail handles.",
        "Maintained 100% fulfillment of set monthly traffic and impression KPIs.",
        "Collaborated with brand visual managers on trend-sensitive creative updates."
      ],
      tools: ["Facebook Ads", "Instagram Shop", "Google Ads Analytics", "CRM Systems"],
      results: [
        "100% KPI achievement sustained consistently over the campaign period.",
        "20% organic-assisted page follower growth across retail portfolios.",
        "Coordinated 7 premium brands simultaneously with streamlined reporting workflows."
      ],
      process: ["Brand Alignment", "Asset Standards", "Integrated Buy", "Weekly Auditing"]
    },
    project_05: {
      title: "MyKingdom Digital Awareness Campaign",
      industry: "Education & Retail",
      period: "May 2024 – Jul 2025",
      icon: "award",
      tagline: "Reached over 500K users monthly while coordinating 30+ KOC collaborations.",
      kpis: [
        { value: "500K+", label: "Monthly Reach" },
        { value: "+40%", label: "Engagement Lift" },
        { value: "30+", label: "KOCs Managed" },
        { value: "12x", label: "Content Assets" }
      ],
      overview: "Designed and rolled out a dual brand-awareness and retail lead generation campaign leveraging high-volume Key Opinion Consumer (KOC) partnerships and paid media boosts.",
      challenge: "Selecting, onboarding, and tracking conversion attribution for a large network of creators, while maximizing social media engagement rates.",
      role: "KOC Campaign Manager & Social Ads Boost Coordinator. Led creator sourcing, contracts, and paid amplification strategy.",
      strategy: [
        "Sourced and coordinated collaborations with 30+ qualified family and kids KOC handles.",
        "Drove consistent reach metrics of over 500,000 unique target users per month.",
        "Increased core engagement ratios by 40% using optimized paid boost strategies.",
        "Organized attribution tracking links for creator-driven content campaigns."
      ],
      tools: ["Facebook Ads", "Instagram Ads", "KOC Networks", "Attribution Links", "Google Analytics"],
      results: [
        "Pushed total monthly unique reach benchmarks past 500,000 users.",
        "Drove a 40% rise in organic interactions on promoted media posts.",
        "Coordinated 30+ creator partnerships with high delivery accuracy."
      ],
      beforeAfter: {
        before: "Unmeasured influencer posts and low general ad interaction ratios.",
        after: "Attribution-tracked creator assets boosted by structured performance paid ads."
      },
      process: ["KOC Matching", "Creative Briefs", "Asset Validation", "Social Ads Boost"]
    },
    project_06: {
      title: "Marketing Attribution & User Journey Analytics Dashboard",
      industry: "Gamification | Customer Retention | SME Ecosystem",
      period: "2025",
      icon: "pie-chart",
      tagline: "Data‑driven marketing attribution & journey insights for the Freedom World ecosystem.",
      overview: "Freedom World is a Thailand‑based platform designed to help SMEs build connected communities through a gamified marketing ecosystem. The platform combines loyalty programs, social engagement, and interactive gaming experiences to increase customer retention, digital engagement, and physical store visits. One of its flagship experiences, The Scape, allows users to participate in gamified activities and earn rewards, creating multiple engagement touchpoints beyond the initial app install.",
      challenge: "The marketing team needed a scalable way to analyze post‑install user behavior for The Scape game within the Freedom World ecosystem.",
      role: "Analytics Lead & Attribution Specialist. Designed data pipelines, dashboards, and KPI frameworks.",
      strategy: [
        "Integrated AppsFlyer attribution data into BigQuery",
        "Built automated Looker Studio dashboards for cross‑channel user journeys",
        "Developed SQL models to calculate LTV, ROI, and cohort performance",
        "Automated reporting pipelines and stakeholder alerts"
      ],
      tools: ["BigQuery", "SQL", "Looker Studio", "AppsFlyer", "Marketing Analytics", "Automation", "Data Visualization"],
      results: [
        "Unified attribution dashboard reduced reporting time by 70%",
        "Enabled cross‑channel performance insights across Meta, Google, TikTok"
      ],
      process: ["Data Ingestion", "ETL Architecture", "Dashboard Build", "Stakeholder Training"],
      images: [
        { url: "scape_dashboard_countries.png", caption: "Total Installs and Revenue by Country" },
        { url: "scape_dashboard_dropoff.png", caption: "User Drop-off Funnel Analysis" },
        { url: "scape_dashboard_daily.png", caption: "Daily Gameplay vs Registrations Trend" },
        { url: "scape_dashboard_networks.png", caption: "Ad Networks Performance & ROAS Comparison" }
      ]
    },
    project_07: {
      title: "Lead Tracking & Attribution Operations",
      client: "Tosi Law",
      industry: "Legal Services | Class Action Litigation | Lead Generation",
      period: "2025 – 2026",
      icon: "briefcase",
      tagline: "Conversion tracking, CRM ingestion, and attribution systems implementation.",
      tools: ["Google Ads", "Microsoft Ads", "Meta Ads", "TikTok Ads"]
    }
  };

  const caseStudyModal = document.getElementById('case-study-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalBody = document.getElementById('modal-body');

  function openCaseStudy(projectId) {
    const data = caseStudiesDb[projectId];
    if (!data) return;

    if (projectId === 'project_07') {
      modalBody.innerHTML = `
        <div class="modal-header-hero">
          <div class="modal-preheader">
            <span class="project-category-icon-wrapper" style="width: 32px; height: 32px; background-color: var(--color-accent-light); color: var(--color-accent); border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;">
              <i data-lucide="briefcase" style="width: 16px; height: 16px;"></i>
            </span>
            <span class="project-industry" style="margin-left: 0.25rem;">${data.industry}</span>
            <span class="project-period" style="margin-left: auto;">${data.period}</span>
          </div>
          <h1 class="modal-title">${data.title}</h1>
          <p class="modal-summary-tagline">Client: <strong>${data.client}</strong></p>
        </div>

        <div class="case-study-layout">
          <!-- Left Main Column -->
          <div class="cs-content-main">
            <!-- Business Overview -->
            <div class="cs-section">
              <h3><i data-lucide="book-open"></i> Business Overview</h3>
              <p>Tosi Law specializes in class action litigation across the United States, representing individuals affected by defective products, dangerous drugs, environmental exposure, and deceptive business practices.</p>
              <p>As one of the performance marketing agencies supporting Tosi Law, our team was responsible for generating qualified leads and signed cases through paid media campaigns while maintaining efficient acquisition costs.</p>
              <p>To support lead generation efforts, Tosi Law utilized a multi-system marketing ecosystem consisting of advertising platforms, landing pages, CRM systems, call tracking solutions, intake management software, and reporting tools.</p>
            </div>

            <!-- Workflow Visualization -->
            <div class="cs-section">
              <h3><i data-lucide="network"></i> Data Flow &amp; Tracking Workflow</h3>
              <p style="margin-bottom: 1rem;">Click the workflow diagram to open the high-resolution version in a new tab:</p>
              <a href="tosi_law_workflow.png" target="_blank" class="cs-gallery-item" style="max-width: 100%;">
                <img src="tosi_law_workflow.png" alt="Tosi Law Marketing Ecosystem Tracking Workflow Diagram" class="cs-gallery-img" style="height: auto; max-height: 400px; object-fit: contain; background: #ffffff;" />
                <div class="cs-gallery-caption">
                  Tosi Law End-to-End Lead Ingestion &amp; Attribution Workflow
                  <i data-lucide="external-link" style="width: 10px; height: 10px; margin-left: 0.25rem; display: inline-block;"></i>
                </div>
              </a>
            </div>

            <!-- Key Responsibilities -->
            <div class="cs-section">
              <h3><i data-lucide="compass"></i> Key Responsibilities</h3>
              
              <div style="margin-top: 1.5rem;">
                <h4 style="font-size: 0.95rem; text-transform: uppercase; color: var(--color-accent); margin-bottom: 0.75rem; letter-spacing: 0.05em;">Tracking & Measurement</h4>
                <ul class="cs-checklist">
                  <li><i data-lucide="check-circle-2"></i><span>Configured and maintained GTM tags, triggers, and event tracking.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Implemented form submission tracking across websites and landing pages.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Validated conversion paths and event firing accuracy.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Conducted ongoing QA to ensure tracking reliability.</span></li>
                </ul>
              </div>

              <div style="margin-top: 1.5rem;">
                <h4 style="font-size: 0.95rem; text-transform: uppercase; color: var(--color-accent); margin-bottom: 0.75rem; letter-spacing: 0.05em;">Landing Pages & Lead Capture</h4>
                <ul class="cs-checklist">
                  <li><i data-lucide="check-circle-2"></i><span>Built and maintained campaign landing pages in Unbounce.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Integrated HubSpot forms and lead capture workflows.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Supported website and landing page optimization initiatives.</span></li>
                </ul>
              </div>

              <div style="margin-top: 1.5rem;">
                <h4 style="font-size: 0.95rem; text-transform: uppercase; color: var(--color-accent); margin-bottom: 0.75rem; letter-spacing: 0.05em;">CRM & Attribution</h4>
                <ul class="cs-checklist">
                  <li><i data-lucide="check-circle-2"></i><span>Connected HubSpot lifecycle stages for lead progression tracking.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Implemented Enhanced Conversions to improve attribution accuracy and optimization signals.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Managed lead source mapping and attribution validation.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Supported CRM data quality and lead tracking consistency.</span></li>
                </ul>
              </div>

              <div style="margin-top: 1.5rem;">
                <h4 style="font-size: 0.95rem; text-transform: uppercase; color: var(--color-accent); margin-bottom: 0.75rem; letter-spacing: 0.05em;">Call Tracking & Intake Operations</h4>
                <ul class="cs-checklist">
                  <li><i data-lucide="check-circle-2"></i><span>Integrated and validated CallRail tracking for inbound phone leads.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Monitored lead routing between HubSpot and Lead Docket.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Supported visibility into lead progression from acquisition through intake qualification.</span></li>
                </ul>
              </div>

              <div style="margin-top: 1.5rem;">
                <h4 style="font-size: 0.95rem; text-transform: uppercase; color: var(--color-accent); margin-bottom: 0.75rem; letter-spacing: 0.05em;">Reporting & Analysis</h4>
                <ul class="cs-checklist">
                  <li><i data-lucide="check-circle-2"></i><span>Supported performance reporting through accurate tracking implementation.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Investigated tracking discrepancies and attribution issues.</span></li>
                  <li><i data-lucide="check-circle-2"></i><span>Ensured reporting consistency across marketing and intake systems.</span></li>
                </ul>
              </div>
            </div>

            <!-- Impact -->
            <div class="cs-section">
              <h3><i data-lucide="trending-up"></i> Impact</h3>
              <ul class="cs-checklist">
                <li><i data-lucide="check-square" style="color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0; margin-top: 0.2rem;"></i><span>Maintained reliable conversion tracking across multiple acquisition channels.</span></li>
                <li><i data-lucide="check-square" style="color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0; margin-top: 0.2rem;"></i><span>Improved confidence in campaign reporting and attribution accuracy.</span></li>
                <li><i data-lucide="check-square" style="color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0; margin-top: 0.2rem;"></i><span>Enabled visibility into lead progression beyond initial form submissions.</span></li>
                <li><i data-lucide="check-square" style="color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0; margin-top: 0.2rem;"></i><span>Strengthened conversion signals used for paid media optimization.</span></li>
                <li><i data-lucide="check-square" style="color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0; margin-top: 0.2rem;"></i><span>Helped ensure marketing, CRM, and intake teams operated from consistent lead data.</span></li>
                <li><i data-lucide="check-square" style="color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0; margin-top: 0.2rem;"></i><span>Supported data-driven decision-making through accurate measurement and reporting.</span></li>
              </ul>
            </div>
          </div>

          <!-- Right Sidebar Column -->
          <div class="cs-sidebar">
            <!-- Role -->
            <div class="cs-sidebar-card">
              <h4>My Role</h4>
              <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 0;">As part of the performance marketing team, I was responsible for implementing, maintaining, and optimizing the existing tracking and attribution ecosystem used across legal lead generation campaigns.</p>
              <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 0;">My work focused on ensuring accurate conversion tracking, reliable CRM integration, lead lifecycle visibility, and data quality across multiple acquisition channels.</p>
            </div>

            <!-- Technology Stack -->
            <div class="cs-sidebar-card">
              <h4>Technology Stack</h4>
              <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">
                <strong style="display:block; margin-top: 0.5rem; color: var(--text-primary);">Analytics & Tracking:</strong>
                <div class="cs-tool-badges" style="margin-top: 0.25rem;">
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>GA4</span>
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>Google Tag Manager</span>
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>Enhanced Conversions</span>
                </div>
                
                <strong style="display:block; margin-top: 0.75rem; color: var(--text-primary);">CRM & Lead Management:</strong>
                <div class="cs-tool-badges" style="margin-top: 0.25rem;">
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>HubSpot</span>
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>Lead Docket</span>
                </div>
                
                <strong style="display:block; margin-top: 0.75rem; color: var(--text-primary);">Call Tracking:</strong>
                <div class="cs-tool-badges" style="margin-top: 0.25rem;">
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>CallRail</span>
                </div>
                
                <strong style="display:block; margin-top: 0.75rem; color: var(--text-primary);">Landing Pages:</strong>
                <div class="cs-tool-badges" style="margin-top: 0.25rem;">
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>Unbounce</span>
                </div>
                
                <strong style="display:block; margin-top: 0.75rem; color: var(--text-primary);">Reporting:</strong>
                <div class="cs-tool-badges" style="margin-top: 0.25rem;">
                  <span class="cs-tool-badge"><i data-lucide="wrench" style="width:12px; height:12px;"></i>Looker Studio</span>
                </div>
              </div>
            </div>

            <!-- Acquisition Channels -->
            <div class="cs-sidebar-card">
              <h4>Acquisition Channels</h4>
              <div class="cs-tool-badges">
                ${data.tools.map(tool => `
                  <span class="cs-tool-badge"><i data-lucide="check" style="width:12px; height:12px;"></i>${tool}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      caseStudyModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      logToConsole('case_study_open', `Opened case study modal for "${data.title}"`, 'gtm-click');
      return;
    }

    // Build Tool Badges
    const toolsHtml = data.tools.map(tool => `
      <span class="cs-tool-badge">
        <i data-lucide="wrench" style="width: 12px; height: 12px;"></i>
        ${tool}
      </span>
    `).join('');

    // Build Strategy Items
    const strategyHtml = data.strategy.map(item => `
      <li>
        <i data-lucide="check-circle-2"></i>
        <span>${item}</span>
      </li>
    `).join('');

    // Build Results Items
    const resultsHtml = data.results.map(item => `
      <li>
        <i data-lucide="trending-up"></i>
        <span><strong>Achieved:</strong> ${item}</span>
      </li>
    `).join('');

    // Build Key Learnings Items
    const keyLearningsHtml = data.keyLearnings ? data.keyLearnings.map(learning => `
      <div class="learning-item" style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.5rem; font-weight: 600;">
          <i data-lucide="lightbulb" style="width: 18px; height: 18px; color: var(--color-accent); flex-shrink: 0; margin-top: 0.1rem;"></i>
          <span>${learning.title}</span>
        </h4>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin: 0; padding-left: 1.65rem;">${learning.text}</p>
      </div>
    `).join('') : '';

    // Build KPI Grid HTML with safe fallback
    const kpiHtml = (data.kpis || []).map(kpi => `
      <div class="kpi-card">
        <div class="kpi-val">${kpi.value}</div>
        <div class="kpi-lbl">${kpi.label}</div>
      </div>
    `).join('');

    // Build Diagram Process Flow Steps
    const processHtml = data.process ? data.process.map((step, idx) => `
      <div class="diagram-step">${step}</div>
      ${idx < data.process.length - 1 ? `<div class="diagram-arrow"><i data-lucide="arrow-right"></i></div>` : ''}
    `).join('') : '';

    // Inject rich case study layout
    modalBody.innerHTML = `
      <div class="modal-header-hero">
        <div class="modal-preheader">
          <span class="project-category-icon-wrapper" style="width: 32px; height: 32px; background-color: var(--color-accent-light); color: var(--color-accent); border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;">
            <i data-lucide="${data.icon}" style="width: 16px; height: 16px;"></i>
          </span>
          <span class="project-industry" style="margin-left: 0.25rem;">${data.industry}</span>
          <span class="project-period" style="margin-left: auto;">${data.period}</span>
        </div>
        <h1 class="modal-title">${data.title}</h1>
        <p class="modal-summary-tagline">${data.tagline}</p>
      </div>

      <!-- KPI Stat Cards (conditionally rendered) -->
      ${kpiHtml ? `<div class="modal-kpi-grid">${kpiHtml}</div>` : ''}

      <div class="case-study-layout">
        <!-- Left Main Column -->
        <div class="cs-content-main">
          <!-- 1. Overview -->
          <div class="cs-section">
            <h3><i data-lucide="book-open"></i> 1. Overview</h3>
            <p>${data.overview}</p>
          </div>

          <!-- 2. Business Challenge -->
          <div class="cs-section">
            <h3><i data-lucide="alert-circle"></i> 2. Business Challenge</h3>
            <p>${data.challenge}</p>
          </div>

          <!-- 3. Strategy & Execution -->
          <div class="cs-section">
            <h3><i data-lucide="compass"></i> 3. Strategy & Execution</h3>
            <ul class="cs-checklist">
              ${strategyHtml}
            </ul>
            
            <!-- Process flowchart visual enhancement -->
            ${processHtml ? `
              <div class="process-diagram-wrapper">
                <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1rem; letter-spacing: 0.05em;">Campaign Execution Process</h4>
                <div class="process-diagram-steps">
                  ${processHtml}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- 4. Results & Impact -->
          <div class="cs-section">
            <h3><i data-lucide="bar-chart-3"></i> 4. Results & Impact</h3>
            <ul class="cs-checklist" style="margin-bottom: 1.5rem;">
              ${resultsHtml}
            </ul>
          </div>

          <!-- 5. Key Learnings & Insights -->
          ${keyLearningsHtml ? `
            <div class="cs-section">
              <h3><i data-lucide="lightbulb"></i> 5. Key Learnings &amp; Insights</h3>
              <div class="key-learnings-list" style="margin-top: 1rem;">
                ${keyLearningsHtml}
              </div>
            </div>
          ` : ''}

          <!-- 6. Dashboard & Reports Showcase -->
          ${data.images ? `
            <div class="cs-section">
              <h3><i data-lucide="image"></i> ${data.keyLearnings ? '6.' : '5.'} Dashboard &amp; Reports Showcase</h3>
              <p style="margin-bottom: 1rem;">Click any report screenshot to open the high-resolution version in a new tab:</p>
              <div class="cs-image-gallery">
                ${data.images.map(img => `
                  <a href="${img.url}" target="_blank" class="cs-gallery-item">
                    <img src="${img.url}" alt="${img.caption}" class="cs-gallery-img" />
                    <div class="cs-gallery-caption">
                      ${img.caption}
                      <i data-lucide="external-link" style="width: 10px; height: 10px; margin-left: 0.25rem; display: inline-block;"></i>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right Sidebar Column -->
        <div class="cs-sidebar">
          <!-- Role -->
          <div class="cs-sidebar-card">
            <h4>My Role</h4>
            <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 0;">${data.role}</p>
          </div>

          <!-- Tools Stack -->
          <div class="cs-sidebar-card">
            <h4>Technology Stack</h4>
            <div class="cs-tool-badges">
              ${toolsHtml}
            </div>
          </div>

          <!-- Key Learnings -->
          <div class="cs-sidebar-card">
            <h4>Key Learnings</h4>
            <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 0;">
              ${data.keyLearningsSummary || "Integrity of data tracking models and clean cohort analysis are essential to sustain high performance tiers and scalable client ROAS."}
            </p>
          </div>
        </div>
      </div>
    `;

    // Re-initialize Lucide Icons inside modal
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Toggle Modal View state
    caseStudyModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
    logToConsole('case_study_open', `Opened case study modal for "${data.title}"`, 'gtm-click');
  }

  function closeCaseStudy() {
    caseStudyModal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scrolling
    logToConsole('case_study_close', 'Closed case study modal', 'gtm-sys');
  }

  // Card click triggers
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project-id');
      openCaseStudy(projectId);
    });
  });

  // Modal event closers
  modalCloseBtn.addEventListener('click', closeCaseStudy);
  modalBackdrop.addEventListener('click', closeCaseStudy);

  // Close modal on Esc key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseStudyModal.classList.contains('active')) {
      closeCaseStudy();
    }
  });

  // ==========================================
  // 7. TASTEFUL MICRO-INTERACTIONS & GLOWS
  // ==========================================
  
  // (a) Cursor-following glow
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      cursorGlow.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
    });
  }

  // (b) Spotlight hover effect for Expertise Cards
  document.querySelectorAll('.expertise-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // (c) Count-up metric logic
  function startCountUp(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    let current = 0;
    const duration = 1200; // ms
    const increment = target / (duration / 16); // ~60fps
    
    const countTimer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.innerText = target;
        clearInterval(countTimer);
      } else {
        el.innerText = Math.floor(current);
      }
    }, 16);
  }

  // (d) Scroll Reveal Intersection Observer
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Trigger count-up if child element exists
          const countEl = entry.target.querySelector('.stat-val-animate');
          if (countEl && !countEl.classList.contains('counted')) {
            countEl.classList.add('counted');
            startCountUp(countEl);
          }
          
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    reveals.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    reveals.forEach(el => el.classList.add('revealed'));
    document.querySelectorAll('.stat-val-animate').forEach(el => {
      el.innerText = el.getAttribute('data-target');
    });
  }

  // (e) Interactive Timeline Collapse / Expander
  document.querySelectorAll('.timeline-toggle-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentNode = btn.closest('.timeline-content');
      const highlights = parentNode.querySelector('.timeline-highlights');
      const company = parentNode.querySelector('.timeline-company')?.innerText || 'Company';
      const role = parentNode.querySelector('.timeline-role')?.innerText || 'Role';
      const spanLabel = btn.querySelector('span');
      
      const isCollapsed = highlights.classList.contains('collapsed');
      
      if (isCollapsed) {
        highlights.classList.remove('collapsed');
        btn.classList.add('active');
        spanLabel.innerText = 'Hide Highlights';
        logToConsole('timeline_expand', `Expanded details for ${role} at ${company}`, 'gtm-click');
      } else {
        highlights.classList.add('collapsed');
        btn.classList.remove('active');
        spanLabel.innerText = 'Show Highlights';
        logToConsole('timeline_collapse', `Collapsed details for ${role} at ${company}`, 'gtm-click');
      }
    });
  });

  // (f) Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
