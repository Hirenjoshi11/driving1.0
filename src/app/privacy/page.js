'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import HeroVisual from './components/HeroVisual';
import {
  IconShield,
  IconFolder,
  IconTarget,
  IconSettings,
  IconScale,
  IconSearch,
  IconClose,
  IconBulb,
  IconCheck,
  IconArrowRight,
} from '@/components/icons/Icons';
import styles from './privacy_public.module.css';

export default function PrivacyPage() {
  const { t, state } = useApp();
  const currentLang = state.language || 'en';

  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState('1.2');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionKey, setActiveSectionKey] = useState('01-overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({ account: true, application: true });
  const [cookieModalOpen, setCookieModalOpen] = useState(false);

  // Fetch structured policy from CMS API
  useEffect(() => {
    let isCancelled = false;
    async function loadPolicy() {
      setLoading(true);
      try {
        const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
        const res = await fetch(`/api/privacy/policy?lang=${currentLang}&version=${selectedVersion}${queryParam}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setPolicyData(data);
          }
        }
      } catch (err) {
        console.error('Failed to load privacy policy:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadPolicy();
    return () => {
      isCancelled = true;
    };
  }, [currentLang, selectedVersion, searchQuery]);

  // Scrollspy to highlight active section on scroll
  useEffect(() => {
    if (!policyData?.sections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id && id.startsWith('sec-')) {
              setActiveSectionKey(id.replace('sec-', ''));
            }
          }
        });
      },
      {
        rootMargin: '-15% 0px -70% 0px',
        threshold: 0
      }
    );

    policyData.sections.forEach((sec) => {
      const el = document.getElementById(`sec-${sec.section_key}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [policyData?.sections]);

  // Smooth scroll handler
  const scrollToSection = (secKey) => {
    setActiveSectionKey(secKey);
    setMobileMenuOpen(false);
    const target = document.getElementById(`sec-${secKey}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Toggle category accordion in Section 02
  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const sections = policyData?.sections || [];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerWrap}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">{t('nav.home') || 'Home'}</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span>{t('privacy.centerTitle') || 'Privacy & Data Protection'}</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span style={{ color: '#18232D', fontWeight: 600 }}>{t('privacy.policyVersion') || 'Privacy Policy'}</span>
        </nav>

        {/* HERO SECTION */}
        <header className={styles.heroCard}>
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <IconShield size={14} />
              <span>DPDP Act, 2023 Statutory Privacy Notice</span>
            </div>
            <h1 className={styles.heroTitle}>
              {t('privacy.policyHeroHeading') || 'Your Privacy Matters'}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('privacy.policyHeroSubtitle') ||
                'Learn how Driving License Form collects, uses, protects and manages your personal information under the Digital Personal Data Protection Act, 2023.'}
            </p>

            <div className={styles.heroMetaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t('privacy.lastUpdated') || 'Last Updated'}:</span>
                <span className={styles.metaValue}>01 September 2026</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t('privacy.policyVersion') || 'Privacy Policy'}:</span>
                <span className={styles.versionBadge}>v{selectedVersion} (Current)</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Language:</span>
                <span className={styles.metaValue} style={{ textTransform: 'uppercase' }}>
                  {currentLang === 'gu' ? 'ગુજરાતી' : currentLang === 'hi' ? 'हिन्दी' : 'English'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroVisualGlow} />
            <HeroVisual />
          </div>
        </header>

        {/* QUICK PRIVACY SUMMARY (4 COMPACT CARDS) */}
        <section className={styles.summaryGrid} aria-label="Quick Privacy Summary">
          <button
            type="button"
            className={styles.summaryCard}
            onClick={() => scrollToSection('02-information-collected')}
          >
            <div className={styles.summaryIcon}><IconFolder size={22} /></div>
            <h2 className={styles.summaryTitle}>{t('privacy.summaryYourDataTitle') || 'Your Data'}</h2>
            <p className={styles.summaryDesc}>{t('privacy.summaryYourDataDesc') || 'What information we collect'}</p>
            <span className={styles.summaryAction}>View collection list ↓</span>
          </button>

          <button
            type="button"
            className={styles.summaryCard}
            onClick={() => scrollToSection('03-why-we-collect')}
          >
            <div className={styles.summaryIcon}><IconTarget size={22} /></div>
            <h2 className={styles.summaryTitle}>{t('privacy.summaryWhyWeUseTitle') || 'Why We Use It'}</h2>
            <p className={styles.summaryDesc}>{t('privacy.summaryWhyWeUseDesc') || 'How your data supports the service'}</p>
            <span className={styles.summaryAction}>See purpose map ↓</span>
          </button>

          <button
            type="button"
            className={styles.summaryCard}
            onClick={() => scrollToSection('10-cookies-analytics')}
          >
            <div className={styles.summaryIcon}><IconSettings size={22} /></div>
            <h2 className={styles.summaryTitle}>{t('privacy.summaryYourChoicesTitle') || 'Your Choices'}</h2>
            <p className={styles.summaryDesc}>{t('privacy.summaryYourChoicesDesc') || 'Manage privacy and consent'}</p>
            <span className={styles.summaryAction}>Adjust preferences ↓</span>
          </button>

          <button
            type="button"
            className={styles.summaryCard}
            onClick={() => scrollToSection('08-your-rights')}
          >
            <div className={styles.summaryIcon}><IconScale size={22} /></div>
            <h2 className={styles.summaryTitle}>{t('privacy.summaryYourRightsTitle') || 'Your Rights'}</h2>
            <p className={styles.summaryDesc}>{t('privacy.summaryYourRightsDesc') || 'Access, correct or delete data'}</p>
            <span className={styles.summaryAction}>Exercise rights ↓</span>
          </button>
        </section>

        {/* TWO-COLUMN MAIN CONTENT LAYOUT */}
        <div className={styles.mainLayout}>
          {/* LEFT: STICKY DESKTOP PRIVACY NAVIGATION */}
          <aside className={styles.sidebar} aria-label="Policy Navigation">
            <div className={styles.sidebarTitle}>{t('privacy.onThisPage') || 'On this page'}</div>
            <ul className={styles.navList}>
              {sections.map((sec) => {
                const isActive = activeSectionKey === sec.section_key;
                return (
                  <li key={sec.section_key}>
                    <button
                      type="button"
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                      onClick={() => scrollToSection(sec.section_key)}
                    >
                      <span className={styles.navNumber}>{sec.section_number}</span>
                      <span className={styles.navLabel}>{sec.heading.replace(/^\d+\s*/, '')}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* RIGHT: POLICY CONTENT & SEARCH */}
          <main className={styles.contentArea}>
            {/* IN-PAGE POLICY SEARCH */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><IconSearch size={16} /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t('privacy.searchPlaceholder') || 'Search privacy policy clauses...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search this policy"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <IconClose size={14} />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className={styles.searchStatus}>
                Showing results matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}

            {/* MOBILE SECTION NAVIGATION DROPDOWN & HORIZONTAL CHIPS */}
            <div className={styles.mobileNavWrap}>
              {/* Horizontal Scrollable Chip Bar */}
              <div className={styles.mobileChipsBar} role="tablist" aria-label="Privacy clauses fast selector">
                {sections.map((sec) => {
                  const isActive = activeSectionKey === sec.section_key;
                  return (
                    <button
                      key={sec.section_key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.mobileChip} ${isActive ? styles.mobileChipActive : ''}`}
                      onClick={() => scrollToSection(sec.section_key)}
                    >
                      <span className={styles.mobileChipNum}>{sec.section_number}</span>
                      <span>{sec.heading.replace(/^\d+\s*/, '')}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.mobileNavBtn}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
              >
                <span>
                  {t('privacy.onThisPage') || 'On this page'}:{' '}
                  <strong style={{ color: '#159447' }}>
                    {sections.find((s) => s.section_key === activeSectionKey)?.heading.replace(/^\d+\s*/, '') || 'Select section'}
                  </strong>
                </span>
                <span>{mobileMenuOpen ? '▴' : '▾'}</span>
              </button>

              {mobileMenuOpen && (
                <div className={styles.mobileMenu}>
                  {sections.map((sec) => (
                    <button
                      key={sec.section_key}
                      type="button"
                      className={`${styles.mobileMenuItem} ${
                        activeSectionKey === sec.section_key ? styles.mobileMenuItemActive : ''
                      }`}
                      onClick={() => scrollToSection(sec.section_key)}
                    >
                      <span style={{ fontWeight: 700, minWidth: '1.5rem', color: '#159447' }}>
                        {sec.section_number}
                      </span>
                      <span>{sec.heading.replace(/^\d+\s*/, '')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION RENDERING */}
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#5B6470' }}>
                Loading policy details...
              </div>
            ) : sections.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#5B6470' }}>
                No clauses matched your query. Try searching for &ldquo;data&rdquo;, &ldquo;retention&rdquo;, or &ldquo;rights&rdquo;.
              </div>
            ) : (
              sections.map((sec) => {
                const sData = sec.structured || {};

                return (
                  <article
                    key={sec.section_key}
                    id={`sec-${sec.section_key}`}
                    className={styles.sectionCard}
                  >
                    {/* SECTION HEADER */}
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionMarker}>
                        <span className={styles.sectionNumber}>{sec.section_number}</span>
                        <div className={styles.sectionLine} />
                      </div>
                      <h2 className={styles.sectionHeading}>{sec.heading}</h2>
                      {sec.subheading && <p className={styles.sectionSubheading}>{sec.subheading}</p>}
                    </div>

                    {/* SECTION BODY TEXT */}
                    <div className={styles.sectionContent}>
                      <p>{sec.content}</p>
                    </div>

                    {/* CALLOUT BOX IF PRESENT */}
                    {sec.callout_title && (
                      <div className={styles.calloutBox}>
                        <div className={styles.calloutTitle}>
                          <IconBulb size={15} />
                          <span>{sec.callout_title}</span>
                        </div>
                        <p className={styles.calloutText}>{sec.callout_content}</p>
                      </div>
                    )}

                    {/* ============================================================
                        SECTION-SPECIFIC PROGRESSIVE DISCLOSURE COMPONENTS
                        ============================================================ */}

                    {/* 01 OVERVIEW: PRINCIPLES */}
                    {sec.section_key === '01-overview' && sData.principles && (
                      <div className={styles.principleGrid}>
                        {sData.principles.map((p, idx) => (
                          <div key={idx} className={styles.principleCard}>
                            <div className={styles.principleTitle}>
                              <IconCheck size={14} />
                              {p.title}
                            </div>
                            <div className={styles.principleDesc}>{p.desc}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 02 INFORMATION WE COLLECT: EXPANDABLE CATEGORIES */}
                    {sec.section_key === '02-information-collected' && sData.categories && (
                      <div className={styles.accordionList}>
                        {sData.categories.map((cat) => {
                          const isOpen = !!expandedCategories[cat.id];
                          return (
                            <div
                              key={cat.id}
                              className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ''}`}
                            >
                              <button
                                type="button"
                                className={styles.accordionHeader}
                                onClick={() => toggleCategory(cat.id)}
                                aria-expanded={isOpen}
                              >
                                <div className={styles.accordionHeaderLeft}>
                                  <span className={styles.accordionTitle}>{cat.title}</span>
                                  <span className={styles.badgeCategory}>{cat.badge}</span>
                                </div>
                                <span className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ''}`}>
                                  ▼
                                </span>
                              </button>

                              {isOpen && (
                                <div className={styles.accordionBody}>
                                  <p className={styles.accordionSummaryText}>{cat.summary}</p>
                                  <ul className={styles.dataItemList}>
                                    {cat.items.map((item, idx) => (
                                      <li key={idx} className={styles.dataItem}>
                                        <span className={styles.dataItemBullet}>•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 03 WHY WE COLLECT IT: VISUAL MAPPING */}
                    {sec.section_key === '03-why-we-collect' && sData.mappings && (
                      <div className={styles.mappingGrid}>
                        {sData.mappings.map((m, idx) => (
                          <div key={idx} className={styles.mappingRow}>
                            <div className={styles.mappingField}>{m.field}</div>
                            <div className={styles.mappingArrow}><IconArrowRight size={16} /></div>
                            <div className={styles.mappingPurpose}>{m.purpose}</div>
                            <div className={styles.mappingBasis}>{m.basis}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 04 HOW WE USE DATA: AUDITED STEPS */}
                    {sec.section_key === '04-how-we-use-data' && sData.steps && (
                      <div className={styles.stepsGrid}>
                        {sData.steps.map((st, idx) => (
                          <div key={idx} className={styles.stepCard}>
                            <div className={styles.stepCardNumber}>
                              STEP 0{idx + 1}
                            </div>
                            <div className={styles.stepCardTitle}>
                              {st.title}
                            </div>
                            <div className={styles.stepCardDesc}>
                              {st.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 05 DATA SHARING & PROCESSORS */}
                    {sec.section_key === '05-sharing-processors' && (
                      <>
                        <div className={styles.sharingFlow}>
                          <div className={styles.flowStep}>You (Data Principal)</div>
                          <div className={styles.flowArrow}><IconArrowRight size={16} /></div>
                          <div className={styles.flowStep}>Driving License Form</div>
                          <div className={styles.flowArrow}><IconArrowRight size={16} /></div>
                          <div className={styles.flowStep}>Authorized Processors</div>
                          <div className={styles.flowArrow}><IconArrowRight size={16} /></div>
                          <div className={styles.flowStep}>State RTO (Upon Submission)</div>
                        </div>

                        {sData.processors && (
                          <div className={styles.tableResponsiveWrapper}>
                            <table className={styles.processorsTable}>
                              <thead>
                                <tr>
                                  <th>Processor / Service</th>
                                  <th>Operational Role</th>
                                  <th>Data Exchanged</th>
                                  <th>Jurisdiction</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sData.processors.map((proc, idx) => (
                                  <tr key={idx}>
                                    <td><strong>{proc.service}</strong></td>
                                    <td>{proc.role} — <span style={{ color: '#5B6470' }}>{proc.purpose}</span></td>
                                    <td><span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{proc.data}</span></td>
                                    <td><span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#159447' }}>{proc.location}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}

                    {/* 06 HOW WE PROTECT YOUR INFORMATION: SECURITY CARDS */}
                    {sec.section_key === '06-data-security' && sData.securityCards && (
                      <div className={styles.securityGrid}>
                        {sData.securityCards.map((c, idx) => (
                          <div key={idx} className={styles.securityCard}>
                            <div className={styles.securityIcon}>{c.icon}</div>
                            <h3 className={styles.securityHeading}>{c.title}</h3>
                            <p className={styles.securityDesc}>{c.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 07 DATA RETENTION: LIFECYCLE & SCHEDULE TABLE */}
                    {sec.section_key === '07-data-retention' && (
                      <div className={styles.lifecycleWrap}>
                        <div className={styles.lifecycleGrid}>
                          {sData.lifecycle?.map((lf, idx) => (
                            <div key={idx} className={styles.lifecycleItem}>
                              <div className={styles.lifecycleStepTitle}>{lf.step}</div>
                              <div className={styles.lifecycleStepDesc}>{lf.desc}</div>
                            </div>
                          ))}
                        </div>

                        {sData.schedule && (
                          <div className={styles.tableResponsiveWrapper}>
                            <table className={styles.processorsTable}>
                              <thead>
                                <tr>
                                  <th>Data Record Category</th>
                                  <th>Statutory Retention</th>
                                  <th>Regulatory / Operational Justification</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sData.schedule.map((row, idx) => (
                                  <tr key={idx}>
                                    <td><strong>{row.category}</strong></td>
                                    <td>
                                      <span style={{ fontWeight: 700, color: '#159447', background: '#EAF6EE', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                        {row.period}
                                      </span>
                                    </td>
                                    <td><span style={{ fontSize: 'var(--font-size-sm)', color: '#5B6470' }}>{row.reason}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 08 USER RIGHTS: INTERACTIVE CARDS */}
                    {sec.section_key === '08-your-rights' && sData.rights && (
                      <div className={styles.rightsGrid}>
                        {sData.rights.map((r) => (
                          <Link key={r.id} href={r.href} className={styles.rightsCard}>
                            <div>
                              <div className={styles.rightsCardTop}>
                                <div className={styles.rightsIcon}>{r.icon}</div>
                                <div>
                                  <h3 className={styles.rightsTitle}>{r.title}</h3>
                                  <p className={styles.rightsDesc}>{r.desc}</p>
                                </div>
                              </div>
                            </div>
                            <span className={styles.rightsCardArrow}>
                              Exercise in Privacy Center
                              <IconArrowRight size={14} />
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* 09 CHILDREN & GUARDIANS: VERIFICATION FLOW */}
                    {sec.section_key === '09-children-guardians' && (
                      <div className={styles.guardiansWrap}>
                        <div className={styles.sharingFlow}>
                          <div className={styles.flowStep}>Parent / Lawful Guardian</div>
                          <div className={styles.flowArrow}><IconArrowRight size={16} /></div>
                          <div className={styles.flowStep}>Guardian Identity Verification</div>
                          <div className={styles.flowArrow}><IconArrowRight size={16} /></div>
                          <div className={styles.flowStep}>Verifiable Consent</div>
                          <div className={styles.flowArrow}><IconArrowRight size={16} /></div>
                          <div className={styles.flowStep}>Minor Application Dossier</div>
                        </div>

                        {sData.prohibitions && (
                          <ul className={styles.prohibitionsGrid}>
                            {sData.prohibitions.map((item, idx) => (
                              <li key={idx} className={styles.prohibitionItem}>
                                <IconCheck size={14} className={styles.inlineCheck} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* 10 COOKIES & ANALYTICS: PREFERENCES */}
                    {sec.section_key === '10-cookies-analytics' && (
                      <div className={styles.cookiesWrap}>
                        <div className={styles.cookieList}>
                          {sData.categories?.map((ck, idx) => (
                            <div key={idx} className={styles.cookieCard}>
                              <div className={styles.cookieCardContent}>
                                <div className={styles.cookieCardName}>
                                  {ck.name}
                                </div>
                                <div className={styles.cookieCardDesc}>
                                  {ck.desc}
                                </div>
                              </div>
                              <span className={`${styles.cookieBadge} ${ck.status.includes('Always') ? styles.cookieBadgeAlways : ''}`}>
                                {ck.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Link href="/account/privacy/consent" className={styles.btnSecondary}>
                          {t('privacy.managePreferencesBtn')}
                          <IconArrowRight size={14} />
                        </Link>
                      </div>
                    )}

                    {/* 11 INTERNATIONAL TRANSFERS & RESIDENCY */}
                    {sec.section_key === '11-international-transfers' && sData.points && (
                      <div className={styles.transfersGrid}>
                        {sData.points.map((pt, idx) => (
                          <div key={idx} className={styles.transferCard}>
                            <span className={styles.flagIcon}>🇮🇳</span>
                            <span className={styles.transferText}>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 12 GRIEVANCE REDRESSAL: DPO DETAILS & ACTION BUTTONS */}
                    {sec.section_key === '12-grievance-redressal' && sData.dpo && (
                      <div className={styles.grievanceBox}>
                        <div className={styles.dpoGrid}>
                          <div className={styles.dpoItem}>
                            <div className={styles.dpoLabel}>Designated Officer</div>
                            <div className={styles.dpoValue}>{sData.dpo.name}</div>
                            <div className={styles.dpoSub}>{sData.dpo.designation}</div>
                          </div>
                          <div className={styles.dpoItem}>
                            <div className={styles.dpoLabel}>Direct Email</div>
                            <div className={styles.dpoValue}>
                              <a href={`mailto:${sData.dpo.email}`} className={styles.dpoLink}>
                                {sData.dpo.email}
                              </a>
                            </div>
                          </div>
                          <div className={styles.dpoItem}>
                            <div className={styles.dpoLabel}>Statutory SLA</div>
                            <div className={styles.dpoValue}>{sData.dpo.sla}</div>
                          </div>
                          <div className={styles.dpoItem}>
                            <div className={styles.dpoLabel}>Physical Address</div>
                            <div className={styles.dpoAddress}>
                              {sData.dpo.address}
                            </div>
                          </div>
                        </div>

                        <div className={styles.grievanceActions}>
                          <Link href="/account/privacy/grievances" className={styles.ctaBtnPrimary}>
                            {t('privacy.submitGrievanceBtn') || 'Submit a Grievance'}
                          </Link>
                          <a href={`mailto:${sData.dpo.email}`} className={styles.btnSecondary}>
                            {t('privacy.contactPrivacyBtn') || 'Contact Privacy Team'}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* 13 CONTACT DETAILS */}
                    {sec.section_key === '13-contact-details' && sData.contactItems && (
                      <div className={styles.contactGrid}>
                        {sData.contactItems.map((ci, idx) => (
                          <div key={idx} className={styles.contactCard}>
                            <div className={styles.contactLabel}>
                              {ci.label}
                            </div>
                            <div className={styles.contactVal}>
                              {ci.val}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 14 POLICY UPDATES: VERSION TIMELINE */}
                    {sec.section_key === '14-policy-updates' && sData.timeline && (
                      <div className={styles.timeline}>
                        {sData.timeline.map((item, idx) => {
                          const isCurrent = item.status.toLowerCase().includes('current') || item.status.toLowerCase().includes('હાલની') || item.status.toLowerCase().includes('वर्तमान');
                          return (
                            <div
                              key={idx}
                              className={`${styles.timelineItem} ${!isCurrent ? styles.timelineItemArchived : ''}`}
                            >
                              <div className={styles.timelineDot} />
                              <div className={styles.timelineHeader}>
                                <span className={styles.timelineVersion}>{item.version}</span>
                                <span
                                  style={{
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 700,
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '6px',
                                    background: isCurrent ? '#EAF6EE' : '#F1F5F9',
                                    color: isCurrent ? '#159447' : '#5B6470'
                                  }}
                                >
                                  {item.status}
                                </span>
                                <span className={styles.timelineDate}>{item.date}</span>
                              </div>
                              <p className={styles.timelineSummary}>{item.summary}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })
            )}

            {/* PRIVACY CENTER CTA BANNER */}
            <div className={styles.privacyCenterCTA}>
              <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>
                  {t('privacy.managePrivacyTitle') || 'Manage Your Privacy'}
                </h2>
                <p className={styles.ctaSubtitle}>
                  {t('privacy.managePrivacySubtitle') ||
                    'View your personal inventory, manage consent choices, download machine-readable archives, and submit statutory requests directly from your Privacy Center.'}
                </p>
              </div>
              <Link href="/account/privacy" className={styles.ctaBtnPrimary}>
                {t('privacy.openPrivacyCenter')}
                <IconArrowRight size={15} />
              </Link>
            </div>

            {/* NON-GOVERNMENT TRANSPARENCY DISCLAIMER */}
            <div className={styles.disclaimerNotice}>
              <strong>{t('privacy.nonGovDisclaimerTitle') || 'Non-Government Transparency Notice'}:</strong>{' '}
              {t('privacy.nonGovDisclaimerText') ||
                'Driving License Form is an independent private application assistance platform. We are NOT an official government portal and are not affiliated with MoRTH, Parivahan Sewa, or any State Regional Transport Authority. We collect data solely with informed consent to prepare applications for official submission.'}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
