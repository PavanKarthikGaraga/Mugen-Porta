'use client';

import React, { useState } from 'react';
import { FiDownload, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';

const domainMap: Record<string, string> = {
    LCH: 'Liberal Arts & Culture',
    TEC: 'Technology',
    HWB: 'Health & Wellbeing',
    ESO: 'Extension & Social Outreach',
    IIE: 'Innovation, Incubation & Entrepreneurship'
};

export default function MonthlyReportsPage() {
    const [monthInput, setMonthInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const handleFetchData = async () => {
        if (!monthInput) {
            toast.error('Please select a month');
            return;
        }

        const [year, month] = monthInput.split('-');
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard/admin/samam/monthly-reports?month=${month}&year=${year}`);
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            
            // Process data for the report
            const processed = processReportData(data, year, month);
            setReportData(processed);
            toast.success('Data fetched successfully! You can now generate reports.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch report data.');
        } finally {
            setLoading(false);
        }
    };

    const processReportData = (data: any, year: string, month: string) => {
        const { clubs, activities, studentStats } = data;
        
        const totalClubs = clubs.length;
        const totalActivities = activities.length;
        let totalParticipants = 0;
        let totalRegistered = 0;

        const domainOrder: Record<string, number> = { 'TEC': 1, 'LCH': 2, 'ESO': 3, 'HWB': 4, 'IIE': 5 };

        // Group by domains
        const domainStats: any = {
            TEC: { name: domainMap.TEC, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            LCH: { name: domainMap.LCH, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            ESO: { name: domainMap.ESO, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            HWB: { name: domainMap.HWB, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            IIE: { name: domainMap.IIE, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
        };

        const activeClubsSet = new Set();
        const eventDaysSet = new Set();

        activities.forEach((act: any) => {
            const p = parseInt(act.participants) || 0;
            totalParticipants += p;
            if (act.domain && domainStats[act.domain]) {
                domainStats[act.domain].activities += 1;
                domainStats[act.domain].participants += p;
            }
            if (act.club_id) activeClubsSet.add(act.club_id);
            if (act.activity_date) eventDaysSet.add(act.activity_date.substring(0, 10));
        });

        // Club-wise statistics
        const clubStatsList: any[] = [];

        clubs.forEach((club: any) => {
            const stat = studentStats.find((s: any) => s.clubId === club.id);
            const regCount = stat ? parseInt(stat.total) : 0;
            totalRegistered += regCount;
            
            if (domainStats[club.domain]) {
                domainStats[club.domain].clubs += 1;
                domainStats[club.domain].regStudents += regCount;
            }

            clubStatsList.push({
                name: club.name,
                domain: club.domain,
                yr1: stat ? parseInt(stat.yr1) : 0,
                yr2: stat ? parseInt(stat.yr2) : 0,
                yr3: stat ? parseInt(stat.yr3) : 0,
                yr4: stat ? parseInt(stat.yr4) : 0,
                dayScholar: stat ? parseInt(stat.dayScholar) : 0,
                hosteler: stat ? parseInt(stat.hosteler) : 0,
                total: regCount
            });
        });
        
        // Sort club stats by domain then name
        clubStatsList.sort((a, b) => {
            if (a.domain !== b.domain) return (domainOrder[a.domain] || 99) - (domainOrder[b.domain] || 99);
            return a.name.localeCompare(b.name);
        });

        // Sort activities by domain then date
        activities.sort((a: any, b: any) => {
            const doA = domainOrder[a.domain || 'TEC'] || 99;
            const doB = domainOrder[b.domain || 'TEC'] || 99;
            if (doA !== doB) return doA - doB;
            return new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime();
        });

        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleString('default', { month: 'long' });

        return {
            monthStr: `${monthName} ${year}`,
            monthName, year,
            totalClubs,
            totalActivities,
            totalParticipants,
            totalRegistered,
            activeClubsCount: activeClubsSet.size,
            eventDaysCount: eventDaysSet.size,
            domainStats: Object.values(domainStats).filter((d: any) => d.clubs > 0 || d.activities > 0),
            clubStatsList,
            activities
        };
    };

    const getReportHtml = () => {
        if (!reportData) return;
        const { monthStr, monthName, year, totalClubs, totalActivities, totalParticipants, totalRegistered, domainStats, clubStatsList, activities, activeClubsCount, eventDaysCount } = reportData;

        const domainOrder: Record<string, number> = { 'TEC': 1, 'LCH': 2, 'ESO': 3, 'HWB': 4, 'IIE': 5 };
        // Ensure domainStats has code and is sorted
        const activeDomains = domainStats.map((d: any) => ({
            ...d,
            code: Object.keys(domainMap).find(k => domainMap[k] === d.name) || d.name.substring(0, 3).toUpperCase()
        })).sort((a: any, b: any) => (domainOrder[a.code] || 99) - (domainOrder[b.code] || 99));

        const eventDays = new Set();
        activities.forEach((act: any) => {
            if (act.activity_date) eventDays.add(new Date(act.activity_date).getDate());
        });

        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
        const firstDay = new Date(parseInt(year), monthIndex, 1).getDay();

        // Highlights
        const topActivities = activities.slice(0, 15);
        const highlightsHtml = topActivities.map((a: any) => `<li><b>${a.club_name || 'Club'}</b> conducted ${a.title} with ${a.participants} participants.</li>`).join('');

        // Domains Covered HTML
        const domainCardsHtml = activeDomains.map((d: any) => {
            let colorClass = 'c-maroon'; let textClass = 't-LCH';
            if (d.code === 'TEC') { colorClass = 'c-blue'; textClass = 't-TEC'; }
            else if (d.code === 'HWB') { colorClass = 'c-green'; textClass = 't-HWB'; }
            else if (d.code === 'ESO') { colorClass = 'c-brown'; textClass = 't-ESO'; }
            else if (d.code === 'IIE') { colorClass = 'c-purple'; textClass = 't-IIE'; }
            return `<div class="domain-card ${colorClass}"><div class="code ${textClass}">${d.code}</div><div class="name">${d.name}</div></div>`;
        }).join('');

        // Domain Summary Table HTML
        const domainTableHtml = activeDomains.map((d: any) => {
            let tint = `tint-${d.code}`;
            let bg = `bg-${d.code}`;
            let textClass = `t-${d.code}`;
            return `<tr class="${tint}"><td class="dom ${bg}">${d.code}</td><td class="name">${d.name}</td><td class="n">${d.clubs}</td><td class="n">${d.activities}</td><td class="n">${d.participants}</td><td class="reg ${textClass}">${d.regStudents}</td></tr>`;
        }).join('');

        // Club Stats HTML
        let clubRows: string[] = [];
        let sn = 1;
        let grandTotal = [0, 0, 0, 0, 0, 0, 0];
        
        const groupedClubs: any = {};
        clubStatsList.forEach((c: any) => {
            if (!groupedClubs[c.domain]) groupedClubs[c.domain] = [];
            groupedClubs[c.domain].push(c);
            grandTotal[0] += c.yr1; grandTotal[1] += c.yr2; grandTotal[2] += c.yr3; 
            grandTotal[3] += c.yr4; grandTotal[4] += c.dayScholar; grandTotal[5] += c.hosteler;
            grandTotal[6] += c.total;
        });

        Object.keys(groupedClubs).forEach((domCode) => {
            const domName = domainMap[domCode] || domCode;
            clubRows.push(`<tr class="grp ${domCode}"><td colspan="10">${domName}</td></tr>`);
            
            groupedClubs[domCode].forEach((c: any) => {
                clubRows.push(`<tr><td class="n">${sn}</td><td>${c.name}</td><td class="dom ${domCode}">${domCode}</td><td class="n">${c.yr1}</td><td class="n">${c.yr2}</td><td class="n">${c.yr3}</td><td class="n">${c.yr4}</td><td class="n">${c.dayScholar}</td><td class="n">${c.hosteler}</td><td class="tot t-${domCode}">${c.total}</td></tr>`);
                sn++;
            });
        });
        clubRows.push(`<tr class="grand"><td></td><td>GRAND TOTAL</td><td></td><td>${grandTotal[0]}</td><td>${grandTotal[1]}</td><td>${grandTotal[2]}</td><td>${grandTotal[3]}</td><td>${grandTotal[4]}</td><td>${grandTotal[5]}</td><td>${grandTotal[6]}</td></tr>`);

        const MAX_CLUB_ROWS_PAGE = 25;
        const clubPages = [];
        for (let i = 0; i < clubRows.length; i += MAX_CLUB_ROWS_PAGE) {
            clubPages.push(clubRows.slice(i, i + MAX_CLUB_ROWS_PAGE).join(''));
        }

        // Activities HTML
        let actRows: string[] = [];
        activities.forEach((a: any, i: number) => {
            const domCode = domainMap[a.domain] ? a.domain : 'TEC';
            actRows.push(`<tr><td class="n">${i+1}</td><td>${a.title}</td><td class="club t-${domCode}">${a.club_name || '-'}</td><td class="n">${a.enrolled || a.participants || 0}</td><td class="n">${a.present || a.participants || 0}</td><td class="venue">${a.venue || '-'}</td><td class="date">${a.activity_date ? new Date(a.activity_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}</td></tr>`);
        });

        const actPages = [];
        if (actRows.length > 0) {
            const firstPageCount = Math.min(16, actRows.length);
            actPages.push(actRows.slice(0, firstPageCount).join(''));
            for (let i = firstPageCount; i < actRows.length; i += 25) {
                actPages.push(actRows.slice(i, i + 25).join(''));
            }
        }
        
        let pageNum = 3;

        // Calendar Grid
        let calHtml = "<tr>";
        let cell = 0;
        for (let i = 0; i < firstDay; i++) { calHtml += "<td></td>"; cell++; }
        for (let d = 1; d <= daysInMonth; d++) {
            const isEv = eventDays.has(d);
            calHtml += `<td class="${isEv ? 'ev' : ''}">${d}</td>`;
            cell++;
            if (cell % 7 === 0 && d < daysInMonth) calHtml += "</tr><tr>";
        }
        while (cell % 7 !== 0) { calHtml += "<td></td>"; cell++; }
        calHtml += "</tr>";

        const letterheadUrl = window.location.origin + '/klef-letterhead.png';
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KL SAC Monthly Report – ${monthStr}</title>
<style>
  :root{
    --maroon:#800000; --green:#0b6b0b; --blue:#0a4a8c; --brown:#8b4a0b; --purple:#6a0dad;
    --maroon-bg:#f5e8e8; --green-bg:#e8f3e8; --blue-bg:#e8eef6; --brown-bg:#fff3e6; --purple-bg:#f3e8f8;
    --text:#222; --line:#d9d9d9;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#e6e6e6;font-family:"Times New Roman",Times,serif;color:var(--text)}

  /* ---------- Page shell ---------- */
  .page{
    width:210mm;min-height:297mm;margin:12px auto;background:#fff;position:relative;
    padding:0 0 14mm;box-shadow:0 2px 10px rgba(0,0,0,.2);overflow:hidden;
  }
  .letterhead{display:block;width:100%;border-bottom:3px solid #0b5d0b}
  .content{padding:10mm 11mm}
  .footer{
    position:absolute;left:0;right:0;bottom:0;height:10mm;background:var(--maroon);color:#fff;
    display:flex;align-items:center;justify-content:space-between;padding:0 10mm;font-size:8pt
  }
  .footer b{font-size:9pt}

  /* ---------- Cover ---------- */
  .cover{text-align:center;padding-top:14mm}
  .month-badge{display:inline-block;background:#0b6b0b;color:#fff;font-weight:bold;
    font-size:15pt;padding:5px 56px;letter-spacing:.5px}
  .cover h1{color:#800000;font-size:44pt;margin:14px auto 6px;line-height:1.1;
    border-bottom:2px solid #800000;padding-bottom:6px;width:90%}
  .cover .sub1{font-style:italic;font-size:15pt;color:#333;margin-top:4px}
  .cover .sub2{font-style:italic;font-size:12pt;color:#666;margin-top:2px}

  .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:26px 0 0}
  .stat{border:1px solid;padding:10px 6px 8px;text-align:center}
  .stat .num{font-size:30pt;font-weight:bold;line-height:1}
  .stat .lbl{font-size:8.5pt;color:#444;margin-top:2px}
  .c-maroon{border-color:#800000;background:#f5e8e8} .c-maroon .num{color:#800000}
  .c-green{border-color:#0b6b0b;background:#e8f3e8}    .c-green .num{color:#0b6b0b}
  .c-blue{border-color:#0a4a8c;background:#e8eef6}       .c-blue .num{color:#0a4a8c}
  .c-brown{border-color:#8b4a0b;background:#fff3e6}    .c-brown .num{color:#8b4a0b}
  .c-purple{border-color:#6a0dad;background:#f3e8f8}    .c-purple .num{color:#6a0dad}

  .domains-title{font-weight:bold;font-size:11pt;margin:24px 0 8px;color:#333}
  .domain-card{border:1px solid;padding:10px 6px;text-align:center}
  .domain-card .code{font-weight:bold;font-size:14pt}
  .domain-card .name{font-size:8.5pt;color:#444;margin-top:6px}
  .report-meta{border-top:1px solid #d9d9d9;margin-top:22px;padding-top:8px;text-align:center;
    font-style:italic;font-size:9pt;color:#666}

  /* ---------- Section bars ---------- */
  .bar{background:#800000;color:#fff;font-weight:bold;text-align:center;
    font-size:14pt;padding:9px 10px;letter-spacing:.3px}
  .subbar{background:#800000;color:#fff;font-weight:bold;font-size:10.5pt;padding:6px 8px;margin-top:14px}
  .subbar.green{background:#0b6b0b}
  .overview-text{font-size:10.5pt;line-height:1.75;text-align:justify;margin:14px 0 4px}

  /* ---------- Tables ---------- */
  table{width:100%;border-collapse:collapse;font-size:8.5pt}
  th{background:#800000;color:#fff;padding:6px 4px;border:1px solid #fff;font-size:8.5pt}
  td{padding:5px 6px;border:1px solid #d9d9d9}
  td.c,th.c{text-align:center}
  tbody tr:nth-child(even) td{background:#f4f4f4}

  .summary td.dom{color:#fff;font-weight:bold;text-align:center}
  .summary td.reg{font-weight:bold;text-align:center}
  .summary td.n{text-align:center}
  .bg-LCH{background:#800000} .bg-TEC{background:#0a4a8c}
  .bg-HWB{background:#0b6b0b} .bg-ESO{background:#8b4a0b} .bg-IIE{background:#6a0dad}
  .tint-LCH td.name{background:#f5e8e8!important} .tint-TEC td.name{background:#e8eef6!important}
  .tint-HWB td.name{background:#e8f3e8!important} .tint-ESO td.name{background:#fff3e6!important}
  .tint-IIE td.name{background:#f3e8f8!important}
  .t-LCH{color:#800000} .t-TEC{color:#0a4a8c} .t-HWB{color:#0b6b0b} .t-ESO{color:#8b4a0b} .t-IIE{color:#6a0dad}

  .highlights{list-style:none;margin-top:4px}
  .highlights li{font-size:9.5pt;padding:6px 4px 6px 16px;border-bottom:1px solid #e3e3e3;position:relative;line-height:1.4}
  .highlights li::before{content:"●";color:var(--green);position:absolute;left:2px;font-size:8pt;top:8px}

  .clubs td.dom{text-align:center;font-weight:bold}
  .clubs td.dom.LCH{background:var(--maroon-bg)!important;color:var(--maroon)}
  .clubs td.dom.TEC{background:var(--blue-bg)!important;color:var(--blue)}
  .clubs td.dom.HWB{background:var(--green-bg)!important;color:var(--green)}
  .clubs td.dom.ESO{background:var(--brown-bg)!important;color:var(--brown)}
  .clubs td.dom.IIE{background:var(--purple-bg)!important;color:var(--purple)}
  .clubs td.n{text-align:center}
  .clubs td.tot{text-align:center;font-weight:bold}
  .clubs tr.grp td{color:#fff;font-weight:bold;font-size:9pt;padding:5px 8px}
  .clubs tr.grp.LCH td{background:var(--maroon)!important}
  .clubs tr.grp.TEC td{background:var(--blue)!important}
  .clubs tr.grp.HWB td{background:var(--green)!important}
  .clubs tr.grp.ESO td{background:var(--brown)!important}
  .clubs tr.grp.IIE td{background:var(--purple)!important}
  .clubs tr.grand td{background:var(--green)!important;color:#fff;font-weight:bold;text-align:center}
  .note{font-style:italic;font-size:8pt;color:#666;margin-top:8px}
  .intro-small{font-size:8.5pt;line-height:1.5;margin:8px 0 12px;color:#333}

  /* ---------- Calendar + stat boxes ---------- */
  .cal-wrap{display:grid;grid-template-columns:1fr 1.15fr;gap:14px;margin-top:14px;align-items:start}
  .cal{border:1px solid var(--maroon)}
  .cal table{font-size:9pt}
  .cal th{background:var(--maroon);padding:5px 2px;font-size:9pt}
  .cal td{text-align:center;height:24px;padding:2px;border:1px solid #eee;color:#666;background:#fff!important}
  .cal td.ev{background:#e4f1e4!important;color:var(--green);font-weight:bold}
  .side-stats{display:grid;gap:6px}
  .side-stats .stat{padding:6px}
  .side-stats .num{font-size:26pt}
  .legend{font-size:8pt;color:#444;margin-top:10px}
  .legend i{display:inline-block;width:8px;height:8px;background:var(--green);margin-right:5px}

  .acts td.club{font-weight:bold}
  .acts td.venue{color:#777;font-size:7.5pt;text-transform:uppercase}
  .acts td.n{text-align:center}
  .acts td.date{text-align:center;color:#444}

  /* ---------- Responsive + print ---------- */
  @media (max-width:820px){
    .page{width:100%;min-height:auto;padding-bottom:16mm}
    .stat-row{grid-template-columns:repeat(2,1fr)}
    .cal-wrap{grid-template-columns:1fr}
    .cover h1{font-size:28pt}
    .table-scroll{overflow-x:auto}
  }
  @page{size:A4;margin:0}
  @media print{
    body{background:#fff}
    .page{margin:0;box-shadow:none;page-break-after:always;height:297mm}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style>
</head>
<body onload="window.print()">

<!-- ================= PAGE 1 : COVER ================= -->
<section class="page">
  <img class="letterhead" src="${letterheadUrl}" alt="Koneru Lakshmaiah Education Foundation">
  <div class="content cover">
    <span class="month-badge">${monthStr.toUpperCase()}</span>
    <h1>KL SAC MONTHLY REPORT</h1>
    <div class="sub1">Student Activity Center</div>
    <div class="sub2">Koneru Lakshmaiah Education Foundation</div>

    <div class="stat-row">
      <div class="stat c-maroon"><div class="num">${totalClubs}</div><div class="lbl">Number of Clubs</div></div>
      <div class="stat c-green"><div class="num">${totalActivities}</div><div class="lbl">Activities Conducted</div></div>
      <div class="stat c-blue"><div class="num">${totalParticipants}</div><div class="lbl">Total Participants</div></div>
      <div class="stat c-brown"><div class="num">${totalRegistered}</div><div class="lbl">Registered Students</div></div>
    </div>

    <div class="domains-title">Domains Covered</div>
    <div class="stat-row" style="margin-top:0; grid-template-columns:repeat(${activeDomains.length},1fr)">
      ${domainCardsHtml}
    </div>

    <div class="report-meta">Report Period: ${monthName} 1 – ${monthName} ${daysInMonth}, ${year} | Prepared by: Student Activity Center, KL University</div>
  </div>
  <div class="footer"><span>KL SAC | ${monthStr} Monthly Report</span><b>Koneru Lakshmaiah Education Foundation</b><span>Page 1</span></div>
</section>

<!-- ================= PAGE 2 : OVERVIEW ================= -->
<section class="page">
  <img class="letterhead" src="${letterheadUrl}" alt="">
  <div class="content">
    <div class="bar">OVERVIEW</div>
    <p class="overview-text">
      The Student Activity Center (SAC) of Koneru Lakshmaiah Education Foundation successfully conducted a series of enriching
      activities during ${monthStr}. Across <b>${activeClubsCount} active clubs</b> spanning ${activeDomains.length} domains — ${activeDomains.map((d: any) => d.name).join(', ')} — a total of <b>${totalActivities} activities</b> were organised, engaging
      <b>${totalParticipants} student participants</b>. The SAC has a total registered strength of <b>${totalRegistered} students</b> across all ${totalClubs} clubs.
    </p>

    <div class="subbar">Domain-wise Summary</div>
    <table class="summary">
      <thead><tr><th>Domain</th><th>Domain Name</th><th>Clubs</th><th>Activities</th><th>Participants</th><th>Reg. Students</th></tr></thead>
      <tbody>
        ${domainTableHtml}
      </tbody>
    </table>

    <div class="subbar green">Key Highlights of ${monthStr}</div>
    <ul class="highlights">
      ${highlightsHtml}
    </ul>
  </div>
  <div class="footer"><span>KL SAC | ${monthStr} Monthly Report</span><b>Koneru Lakshmaiah Education Foundation</b><span>Page 2</span></div>
</section>

<!-- ================= PAGE 3 : CLUB STATS (1/2) ================= -->
${clubPages.map((pageHtml, index) => {
  const isFirstClubPage = index === 0;
  const p = pageNum++;
  return `<section class="page">
  <img class="letterhead" src="${letterheadUrl}" alt="">
  <div class="content">
    ${isFirstClubPage ? `<div class="bar">REGISTERED STUDENT DATA — CLUB-WISE STATISTICS</div>
    <p class="intro-small">Total registered student membership across all <b>${totalClubs} SAC clubs</b> in ${activeDomains.length} domains, broken down by academic year and residential status (Day Scholar / Hosteler). Data reflects registrations as of ${monthStr}.</p>` : ''}
    <div class="table-scroll">
      <table class="clubs">
        <thead><tr><th class="c">S.No</th><th>Club</th><th class="c">Domain</th><th class="c">1st Yr</th><th class="c">2nd Yr</th><th class="c">3rd Yr</th><th class="c">4th Yr</th><th class="c">Day Scholar</th><th class="c">Hosteler</th><th class="c">Total</th></tr></thead>
        <tbody>${pageHtml}</tbody>
      </table>
    </div>
    ${(!isFirstClubPage && index === clubPages.length - 1) ? `<p class="note" style="margin-top:8px; font-size:8pt; color:#666;">Domains — TEC: Technology | LCH: Liberal Arts &amp; Culture | ESO: Extension &amp; Social Outreach | HWB: Health &amp; Wellbeing | IIE: Innovation, Incubation &amp; Entrepreneurship</p>` : ''}
  </div>
  <div class="footer"><span>KL SAC | ${monthStr} Monthly Report</span><b>Koneru Lakshmaiah Education Foundation</b><span>Page ${p}</span></div>
</section>`;
}).join('\n')}

<!-- Demographic Distribution Overview Dedicated Page -->
<section class="page">
  <img class="letterhead" src="${letterheadUrl}" alt="">
  <div class="content">
    <div class="bar" style="margin-bottom:16px;">DEMOGRAPHIC DISTRIBUTION OVERVIEW</div>
    <table style="width:100%; border:none; margin-top:24px;">
      <tr>
        <td style="width:50%; padding-right:12px; vertical-align:top; border:none;">
          <div style="border:1px solid #d9d9d9; padding:16px; background:#f9f9f9; text-align:center;">
            <h3 style="font-size:11pt; color:#800000; margin-bottom:16px; border-bottom:1px solid #e3e3e3; padding-bottom:8px; margin-top:0;">Academic Year Distribution</h3>
            <table style="width:100%; border:none; margin-bottom:10px;">
              <tr><td style="border:none; padding:2px 0; text-align:left; font-size:9.5pt;">1st Year</td><td style="border:none; padding:2px 0; text-align:right; font-size:9.5pt;"><b>${grandTotal[0]}</b></td></tr>
              <tr><td colspan="2" style="border:none; padding:0"><div style="background:#e3e3e3; height:8px;"><div style="background:#0a4a8c; height:8px; width:${grandTotal[6] ? (grandTotal[0]/grandTotal[6]*100) : 0}%;"></div></div></td></tr>
            </table>
            <table style="width:100%; border:none; margin-bottom:10px;">
              <tr><td style="border:none; padding:2px 0; text-align:left; font-size:9.5pt;">2nd Year</td><td style="border:none; padding:2px 0; text-align:right; font-size:9.5pt;"><b>${grandTotal[1]}</b></td></tr>
              <tr><td colspan="2" style="border:none; padding:0"><div style="background:#e3e3e3; height:8px;"><div style="background:#0a4a8c; height:8px; width:${grandTotal[6] ? (grandTotal[1]/grandTotal[6]*100) : 0}%;"></div></div></td></tr>
            </table>
            <table style="width:100%; border:none; margin-bottom:10px;">
              <tr><td style="border:none; padding:2px 0; text-align:left; font-size:9.5pt;">3rd Year</td><td style="border:none; padding:2px 0; text-align:right; font-size:9.5pt;"><b>${grandTotal[2]}</b></td></tr>
              <tr><td colspan="2" style="border:none; padding:0"><div style="background:#e3e3e3; height:8px;"><div style="background:#0a4a8c; height:8px; width:${grandTotal[6] ? (grandTotal[2]/grandTotal[6]*100) : 0}%;"></div></div></td></tr>
            </table>
            <table style="width:100%; border:none; margin-bottom:10px;">
              <tr><td style="border:none; padding:2px 0; text-align:left; font-size:9.5pt;">4th Year</td><td style="border:none; padding:2px 0; text-align:right; font-size:9.5pt;"><b>${grandTotal[3]}</b></td></tr>
              <tr><td colspan="2" style="border:none; padding:0"><div style="background:#e3e3e3; height:8px;"><div style="background:#0a4a8c; height:8px; width:${grandTotal[6] ? (grandTotal[3]/grandTotal[6]*100) : 0}%;"></div></div></td></tr>
            </table>
          </div>
        </td>
        <td style="width:50%; padding-left:12px; vertical-align:top; border:none;">
          <div style="border:1px solid #d9d9d9; padding:16px; background:#f9f9f9; text-align:center;">
            <h3 style="font-size:11pt; color:#800000; margin-bottom:16px; border-bottom:1px solid #e3e3e3; padding-bottom:8px; margin-top:0;">Residential Status</h3>
            <table style="width:100%; border:none; margin-bottom:16px;">
              <tr><td style="border:none; padding:2px 0; text-align:left; font-size:9.5pt;">Day Scholar</td><td style="border:none; padding:2px 0; text-align:right; font-size:9.5pt;"><b>${grandTotal[4]}</b></td></tr>
              <tr><td colspan="2" style="border:none; padding:0"><div style="background:#e3e3e3; height:8px;"><div style="background:#8b4a0b; height:8px; width:${grandTotal[6] ? (grandTotal[4]/grandTotal[6]*100) : 0}%;"></div></div></td></tr>
            </table>
            <table style="width:100%; border:none; margin-bottom:16px;">
              <tr><td style="border:none; padding:2px 0; text-align:left; font-size:9.5pt;">Hosteler</td><td style="border:none; padding:2px 0; text-align:right; font-size:9.5pt;"><b>${grandTotal[5]}</b></td></tr>
              <tr><td colspan="2" style="border:none; padding:0"><div style="background:#e3e3e3; height:8px;"><div style="background:#8b4a0b; height:8px; width:${grandTotal[6] ? (grandTotal[5]/grandTotal[6]*100) : 0}%;"></div></div></td></tr>
            </table>
            <div style="margin-top:28px; padding:12px; background:#0b6b0b; color:#fff;">
              <div style="font-size:9pt; margin-bottom:4px;">Total Registered Strength</div>
              <div style="font-size:20pt; font-weight:bold;">${grandTotal[6]}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
  <div class="footer"><span>KL SAC | ${monthStr} Monthly Report</span><b>Koneru Lakshmaiah Education Foundation</b><span>Page ${pageNum++}</span></div>
</section>

${actPages.map((pageHtml, index) => {
  const isFirstActPage = index === 0;
  const p = pageNum++;
  return `<section class="page">
  <img class="letterhead" src="${letterheadUrl}" alt="">
  <div class="content">
    ${isFirstActPage ? `
    <div class="bar">CALENDAR OF EVENTS — ${monthStr.toUpperCase()}</div>
    <div class="cal-wrap">
      <div class="cal">
        <table>
          <thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead>
          <tbody>${calHtml}</tbody>
        </table>
      </div>
      <div class="side-stats">
        <div class="stat c-maroon"><div class="num">${totalActivities}</div><div class="lbl">Activities</div></div>
        <div class="stat c-green"><div class="num">${totalParticipants}</div><div class="lbl">Participants</div></div>
        <div class="stat c-blue"><div class="num">${activeClubsCount}</div><div class="lbl">Clubs Active</div></div>
        <div class="stat c-brown"><div class="num">${eventDays.size}</div><div class="lbl">Event Days</div></div>
      </div>
    </div>
    <div class="legend"><i></i>Event Day — ${eventDays.size} days with activities in ${monthStr}</div>
    <div class="subbar" style="margin-top:16px">Domain-wise Activity Details</div>
    ` : ''}
    <div class="table-scroll">
      <table class="acts">
        <thead><tr><th class="c">S.No</th><th>Activity Name</th><th>Club</th><th class="c">Enrolled</th><th class="c">Present</th><th>Venue</th><th class="c">Date</th></tr></thead>
        <tbody>${pageHtml}</tbody>
      </table>
    </div>
  </div>
  <div class="footer"><span>KL SAC | ${monthStr} Monthly Report</span><b>Koneru Lakshmaiah Education Foundation</b><span>Page ${p}</span></div>
</section>`;
}).join('\n')}

</body>
</html>
        `;

        return htmlContent;
    };

    const downloadPDF = () => {
        if (!reportData) return;
        const htmlContent = getReportHtml();
        if (!htmlContent) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // Printing is handled by body onload="window.print()" in the HTML
        } else {
            toast.error("Please allow popups to view the PDF report.");
        }
    };

    const downloadWord = async () => {
        if (!reportData) return;
        const htmlContent = getReportHtml();
        if (!htmlContent) return;
        
        const wordHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>KL SAC Monthly Report</title>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
        `;

        const blob = new Blob(['\ufeff', wordHtml], {
            type: 'application/msword'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KL_SAC_Monthly_Report_${reportData.monthStr.replace(' ', '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Monthly Reports</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Month & Year</label>
                    <div className="flex flex-wrap gap-4">
                        <input
                            type="month"
                            value={monthInput}
                            onChange={(e) => setMonthInput(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none w-full sm:w-auto"
                        />
                        <button 
                            onClick={handleFetchData}
                            disabled={loading || !monthInput}
                            className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <FiRefreshCw className={loading ? "animate-spin" : ""} />
                            {loading ? 'Fetching...' : 'Fetch Data'}
                        </button>
                    </div>
                </div>
            </div>

            {reportData && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Report Ready: {reportData.monthStr}</h2>
                            <p className="text-gray-500">
                                {reportData.totalActivities} Activities • {reportData.totalParticipants} Participants • {reportData.totalRegistered} Registered Students
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={downloadPDF}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FiFileText />
                                Download PDF
                            </button>
                            <button
                                onClick={downloadWord}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FiDownload />
                                Download DOCX
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalClubs}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Total Clubs</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalActivities}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Activities Conducted</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalParticipants}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Total Participants</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalRegistered}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Registered Students</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
