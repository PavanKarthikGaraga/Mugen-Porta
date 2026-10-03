'use client';

import React, { useState } from 'react';
import { FiDownload, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

        // Group by domains
        const domainStats: any = {
            LCH: { name: domainMap.LCH, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            TEC: { name: domainMap.TEC, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            HWB: { name: domainMap.HWB, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            ESO: { name: domainMap.ESO, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
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
            if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
            return a.name.localeCompare(b.name);
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

    const downloadPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        const { monthStr, monthName, year, totalClubs, totalActivities, totalParticipants, totalRegistered, domainStats, clubStatsList, activities, activeClubsCount, eventDaysCount } = reportData;

        // Ensure domainStats has code
        const activeDomains = domainStats.map((d: any) => ({
            ...d,
            code: Object.keys(domainMap).find(k => domainMap[k] === d.name) || d.name.substring(0, 3).toUpperCase()
        }));
        
        const eventDaysSet = new Set();
        activities.forEach((act: any) => {
            if (act.activity_date) eventDaysSet.add(act.activity_date.substring(0, 10));
        });

        // ---------------- PAGE 1: COVER ----------------
        // Green box "AUGUST 2026"
        doc.setFillColor(0, 100, 0);
        doc.rect(75, 45, 60, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(monthStr.toUpperCase(), 105, 50, { align: 'center' });

        // KL SAC MONTHLY REPORT
        doc.setFontSize(26);
        doc.setTextColor(151, 0, 3);
        doc.text("KL SAC MONTHLY REPORT", 105, 65, { align: 'center' });

        // Red line under it
        doc.setDrawColor(151, 0, 3);
        doc.setLineWidth(0.5);
        doc.line(30, 68, 180, 68);

        // Subtitle
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "italic");
        doc.text("Student Activity Center", 105, 75, { align: 'center' });
        doc.text("Koneru Lakshmaiah Education Foundation", 105, 80, { align: 'center' });

        // 4 Stats Boxes
        const drawStatBox = (x: number, y: number, w: number, h: number, borderColor: number[], numColor: number[], numStr: string, textStr: string) => {
            doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
            doc.setFillColor(250, 250, 250);
            doc.setLineWidth(0.5);
            doc.rect(x, y, w, h, 'FD');
            doc.setFontSize(22);
            doc.setTextColor(numColor[0], numColor[1], numColor[2]);
            doc.setFont("helvetica", "bold");
            doc.text(numStr, x + w/2, y + 12, { align: 'center' });
            doc.setFontSize(9);
            doc.setTextColor(50, 50, 50);
            doc.setFont("helvetica", "normal");
            doc.text(textStr, x + w/2, y + 18, { align: 'center' });
        };

        drawStatBox(15, 95, 40, 22, [151, 0, 3], [151, 0, 3], totalClubs.toString(), "Number of Clubs");
        drawStatBox(60, 95, 40, 22, [0, 128, 0], [0, 128, 0], totalActivities.toString(), "Activities Conducted");
        drawStatBox(105, 95, 40, 22, [0, 80, 160], [0, 80, 160], totalParticipants.toString(), "Total Participants");
        drawStatBox(150, 95, 40, 22, [139, 69, 19], [139, 69, 19], totalRegistered.toString(), "Registered Students");

        // Domains Covered
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Domains Covered", 105, 130, { align: 'center' });

        const boxWidth = 34;
        const gap = 2.5;
        // Center the domain boxes block
        const totalBlockWidth = activeDomains.length * boxWidth + (activeDomains.length - 1) * gap;
        const startX = 105 - (totalBlockWidth / 2);

        activeDomains.forEach((dom: any, i: number) => {
            const x = startX + i * (boxWidth + gap);
            let color = [0,0,0];
            if (dom.code === 'LCH') color = [151, 0, 3];
            else if (dom.code === 'TEC') color = [0, 80, 160];
            else if (dom.code === 'HWB') color = [0, 128, 0];
            else if (dom.code === 'ESO') color = [139, 69, 19];
            else color = [128, 0, 128]; // IIE
            
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.rect(x, 135, boxWidth, 18);
            
            doc.setFontSize(14);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.setFont("helvetica", "bold");
            doc.text(dom.code, x + boxWidth/2, 142, { align: 'center' });
            
            doc.setFontSize(6.5);
            doc.setTextColor(50, 50, 50);
            doc.setFont("helvetica", "normal");
            const nameLines = doc.splitTextToSize(dom.name, boxWidth - 2);
            doc.text(nameLines, x + boxWidth/2, 147, { align: 'center' });
        });

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(15, 165, 195, 165);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "italic");
        doc.text(`Report Period: ${monthName} 1 – ${monthName} 31, ${year} | Prepared by: Student Activity Center, KL University`, 105, 172, { align: 'center' });

        // ---------------- PAGE 2: OVERVIEW & HIGHLIGHTS ----------------
        doc.addPage();
        
        doc.setFillColor(151, 0, 3);
        doc.rect(10, 45, 190, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("OVERVIEW", 105, 52, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const overviewText = `The Student Activity Center (SAC) of Koneru Lakshmaiah Education Foundation successfully conducted a series of enriching activities during ${monthStr}. Across ${activeClubsCount} active clubs spanning ${activeDomains.length} domains — ${activeDomains.map((d: any)=>d.name).join(', ')} — a total of ${totalActivities} activities were organised, engaging ${totalParticipants} student participants. The SAC has a total registered strength of ${totalRegistered} students across all ${totalClubs} clubs.`;
        const lines = doc.splitTextToSize(overviewText, 190);
        doc.text(lines, 10, 62);
        let yPos = 62 + (lines.length * 5) + 5;

        doc.setFillColor(151, 0, 3);
        doc.rect(10, yPos, 190, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Domain-wise Summary", 12, yPos + 5.5);

        yPos += 8;

        (doc as any).autoTable({
            startY: yPos,
            margin: { left: 10, right: 10 },
            head: [['Domain', 'Domain Name', 'Clubs', 'Activities', 'Participants', 'Reg. Students']],
            body: activeDomains.map((d: any) => [d.code, d.name, d.clubs, d.activities, d.participants, d.regStudents]),
            theme: 'grid',
            headStyles: { fillColor: [151, 0, 3], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { halign: 'center', fontStyle: 'bold' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center', fontStyle: 'bold' }
            },
            didParseCell: function(data: any) {
                if (data.section === 'body') {
                    const domainCode = data.row.raw[0];
                    let color = [0,0,0]; let bgColor = [255, 255, 255];
                    if (domainCode === 'LCH') { color = [151, 0, 3]; bgColor = [255, 235, 235]; }
                    else if (domainCode === 'TEC') { color = [0, 80, 160]; bgColor = [235, 245, 255]; }
                    else if (domainCode === 'HWB') { color = [0, 128, 0]; bgColor = [235, 255, 235]; }
                    else if (domainCode === 'ESO') { color = [139, 69, 19]; bgColor = [255, 245, 235]; }
                    else { color = [128, 0, 128]; bgColor = [250, 235, 250]; }
                    
                    if (data.column.index === 0) {
                        data.cell.styles.textColor = [255, 255, 255];
                        data.cell.styles.fillColor = color;
                    } else {
                        data.cell.styles.fillColor = bgColor;
                    }
                    if (data.column.index === 5) {
                        data.cell.styles.textColor = color;
                    }
                }
            }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        doc.setFillColor(0, 128, 0); // Green box
        doc.rect(10, yPos, 190, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Key Highlights of ${monthStr}`, 12, yPos + 5.5);

        yPos += 12;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const topActivities = activities.slice(0, 15);
        topActivities.forEach((a: any) => {
            const text = `  ${a.club_name || 'Club'} conducted ${a.title} attracting ${a.participants} participants.`;
            const alines = doc.splitTextToSize(text, 185);
            if (yPos + alines.length * 5 > 270) {
                doc.addPage();
                yPos = 45;
            }
            doc.setFillColor(0, 128, 0);
            doc.circle(13, yPos - 1.5, 1, 'F');
            doc.text(alines, 15, yPos);
            yPos += alines.length * 5 + 3;
        });

        // ---------------- PAGE 3: CLUB-WISE STATISTICS ----------------
        doc.addPage();

        doc.setFillColor(151, 0, 3);
        doc.rect(10, 45, 190, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("REGISTERED STUDENT DATA — CLUB-WISE STATISTICS", 105, 52, { align: 'center' });

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const p3Text = `Total registered student membership across all ${totalClubs} SAC clubs in ${activeDomains.length} domains, broken down by academic year and residential status (Day Scholar / Hosteler). Data reflects registrations as of ${monthStr}.`;
        const p3lines = doc.splitTextToSize(p3Text, 190);
        doc.text(p3lines, 10, 62);

        let y3 = 62 + (p3lines.length * 5) + 5;

        const clubTableBody: any[] = [];
        let sNo = 1;
        const groupedClubs: any = {};
        clubStatsList.forEach((c: any) => {
            if (!groupedClubs[c.domain]) groupedClubs[c.domain] = [];
            groupedClubs[c.domain].push(c);
        });

        Object.keys(groupedClubs).forEach((domCode) => {
            const domName = domainMap[domCode] || domCode;
            let bgColor = [0, 80, 160];
            if (domCode === 'LCH') bgColor = [151, 0, 3];
            else if (domCode === 'HWB') bgColor = [0, 128, 0];
            else if (domCode === 'ESO') bgColor = [139, 69, 19];
            else if (domCode === 'IIE') bgColor = [128, 0, 128];

            clubTableBody.push([{ content: domName, colSpan: 10, styles: { fillColor: bgColor, textColor: [255,255,255], fontStyle: 'bold' } }]);
            groupedClubs[domCode].forEach((c: any) => {
                clubTableBody.push([ sNo++, c.name, c.domain, c.yr1, c.yr2, c.yr3, c.yr4, c.dayScholar, c.hosteler, c.total ]);
            });
        });

        clubTableBody.push([ 
            { content: 'GRAND TOTAL', colSpan: 3, styles: { fillColor: [0, 128, 0], textColor: [255,255,255], halign: 'center', fontStyle: 'bold' } },
            { content: clubStatsList.reduce((acc, s) => acc + s.yr1, 0).toString(), styles: { fillColor: [0, 128, 0], textColor: [255,255,255], fontStyle: 'bold' } },
            { content: clubStatsList.reduce((acc, s) => acc + s.yr2, 0).toString(), styles: { fillColor: [0, 128, 0], textColor: [255,255,255], fontStyle: 'bold' } },
            { content: clubStatsList.reduce((acc, s) => acc + s.yr3, 0).toString(), styles: { fillColor: [0, 128, 0], textColor: [255,255,255], fontStyle: 'bold' } },
            { content: clubStatsList.reduce((acc, s) => acc + s.yr4, 0).toString(), styles: { fillColor: [0, 128, 0], textColor: [255,255,255], fontStyle: 'bold' } },
            { content: clubStatsList.reduce((acc, s) => acc + s.dayScholar, 0).toString(), styles: { fillColor: [0, 128, 0], textColor: [255,255,255], fontStyle: 'bold' } },
            { content: clubStatsList.reduce((acc, s) => acc + s.hosteler, 0).toString(), styles: { fillColor: [0, 128, 0], textColor: [255,255,255], fontStyle: 'bold' } },
            { content: totalRegistered.toString(), styles: { fillColor: [0, 128, 0], textColor: [255,255,255], fontStyle: 'bold' } },
        ]);

        (doc as any).autoTable({
            startY: y3,
            margin: { left: 10, right: 10, bottom: 20 },
            head: [['S.No', 'Club', 'Domain', '1st Yr', '2nd Yr', '3rd Yr', '4th Yr', 'Day Scholar', 'Hosteler', 'Total']],
            body: clubTableBody,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [151, 0, 3], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { halign: 'center' },
                2: { halign: 'center', fontStyle: 'bold', textColor: [151, 0, 3] },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' },
                6: { halign: 'center' },
                7: { halign: 'center' },
                8: { halign: 'center' },
                9: { halign: 'center', fontStyle: 'bold', textColor: [151, 0, 3] },
            }
        });

        // ---------------- PAGE 4: CALENDAR & ACTIVITY DETAILS ----------------
        doc.addPage();
        doc.setFillColor(151, 0, 3);
        doc.rect(10, 45, 190, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`CALENDAR OF EVENTS — ${monthStr.toUpperCase()}`, 105, 52, { align: 'center' });

        // Calendar Grid
        const startX = 10;
        let startY = 60;
        const cellW = 14;
        const cellH = 12;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        doc.setFillColor(151, 0, 3);
        doc.rect(startX, startY, cellW * 7, cellH, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        days.forEach((d, i) => {
            doc.text(d, startX + i*cellW + cellW/2, startY + cellH/2 + 3, { align: 'center' });
        });

        startY += cellH;
        
        // Ensure month parsing avoids off-by-one errors (0-indexed in Date object)
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
        const firstDay = new Date(parseInt(year), monthIndex, 1).getDay();

        let currentDay = 1;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                if (row === 0 && col < firstDay) {
                    doc.rect(startX + col*cellW, startY + row*cellH, cellW, cellH);
                } else if (currentDay <= daysInMonth) {
                    const dateStr = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
                    if (eventDaysSet.has(dateStr)) {
                        doc.setFillColor(230, 255, 230);
                        doc.rect(startX + col*cellW, startY + row*cellH, cellW, cellH, 'F');
                        doc.setTextColor(0, 128, 0);
                        doc.setFont("helvetica", "bold");
                    } else {
                        doc.setTextColor(100, 100, 100);
                        doc.setFont("helvetica", "normal");
                    }
                    doc.rect(startX + col*cellW, startY + row*cellH, cellW, cellH);
                    doc.text(currentDay.toString(), startX + col*cellW + cellW/2, startY + row*cellH + cellH/2 + 3, { align: 'center' });
                    currentDay++;
                } else {
                    doc.rect(startX + col*cellW, startY + row*cellH, cellW, cellH);
                }
            }
        }

        // Right side stats boxes next to calendar
        const boxX = startX + (cellW * 7) + 5;
        const boxW = 190 - (cellW * 7) - 5;
        const rBoxH = 19;
        let rY = 60;

        const drawRBox = (y: number, num: number, text: string, color: number[]) => {
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.setFillColor(250, 250, 250);
            doc.setLineWidth(0.5);
            doc.rect(boxX, y, boxW, rBoxH, 'FD');
            doc.setTextColor(color[0], color[1], color[2]);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(num.toString(), boxX + boxW/2, y + 10, { align: 'center' });
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(text, boxX + boxW/2, y + 15, { align: 'center' });
        };

        drawRBox(rY, totalActivities, "Activities", [151, 0, 3]); rY += rBoxH + 2.5;
        drawRBox(rY, totalParticipants, "Participants", [0, 128, 0]); rY += rBoxH + 2.5;
        drawRBox(rY, activeClubsCount, "Clubs Active", [0, 80, 160]); rY += rBoxH + 2.5;
        drawRBox(rY, eventDaysCount, "Event Days", [139, 69, 19]);

        doc.setFillColor(0, 128, 0);
        doc.rect(10, 60 + (6*cellH) + 8, 3, 3, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Event Day — ${eventDaysCount} days with activities in ${monthStr}`, 15, 60 + (6*cellH) + 10.5);

        let y4 = 60 + (6*cellH) + 18;
        doc.setFillColor(151, 0, 3);
        doc.rect(10, y4, 190, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Domain-wise Activity Details", 12, y4 + 5.5);

        y4 += 8;

        const actRows = activities.map((a: any, i: number) => [
            i + 1, a.title, a.club_name || '-', a.participants, a.venue || '-', a.activity_date ? new Date(a.activity_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
        ]);

        (doc as any).autoTable({
            startY: y4,
            margin: { left: 10, right: 10, bottom: 20 },
            head: [['S.No', 'Activity Name', 'Club', 'Students', 'Venue', 'Date']],
            body: actRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [151, 0, 3], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { halign: 'center' },
                2: { fontStyle: 'bold', textColor: [151, 0, 3] },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' }
            }
        });

        // ---------------- GLOBALLY APPLY HEADERS & FOOTERS ----------------
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Header
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.rect(10, 10, 190, 25);
            doc.setFontSize(22);
            doc.setTextColor(151, 0, 3);
            doc.setFont("helvetica", "bold");
            doc.text("Koneru Lakshmaiah Education Foundation", 105, 19, { align: 'center' });
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text("(Deemed to be University estd. u/s. 3 of the UGC Act, 1956)", 105, 24, { align: 'center' });
            doc.setFontSize(7.5);
            doc.setTextColor(50, 50, 50);
            doc.setFont("helvetica", "normal");
            doc.text("Campus: Green Fields, Vaddeswaram - 522 302, Guntur District, Andhra Pradesh, INDIA.", 105, 29, { align: 'center' });
            doc.text("Admin Off: 29-36-38, Museum Road, Governorpet, Vijayawada - 520 002.", 105, 33, { align: 'center' });
            doc.setDrawColor(0, 100, 0);
            doc.setLineWidth(1.5);
            doc.line(10, 36, 200, 36);
            
            // Footer
            doc.setFillColor(151, 0, 3);
            doc.rect(0, 285, 210, 12, 'F');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "normal");
            doc.text(`KL SAC | ${monthStr} Monthly Report`, 15, 292);
            doc.text("Koneru Lakshmaiah Education Foundation", 105, 292, { align: 'center' });
            doc.text(`Page ${i}`, 195, 292, { align: 'right' });
        }

        doc.save(`KL_SAC_Monthly_Report_${monthStr.replace(' ', '_')}.pdf`);
    };

    const downloadWord = async () => {
        if (!reportData) return;
        const { monthStr, totalClubs, totalActivities, totalParticipants, totalRegistered, domainStats, clubStatsList, activities } = reportData;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: monthStr.toUpperCase(),
                        alignment: AlignmentType.CENTER,
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: "KL SAC MONTHLY REPORT",
                        alignment: AlignmentType.CENTER,
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Student Activity Center", italics: true })
                        ],
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    
                    new Paragraph({ text: `Total Clubs: ${totalClubs}` }),
                    new Paragraph({ text: `Activities Conducted: ${totalActivities}` }),
                    new Paragraph({ text: `Total Participants: ${totalParticipants}` }),
                    new Paragraph({ text: `Registered Students: ${totalRegistered}` }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    
                    new Paragraph({ text: "Domain-wise Summary", heading: HeadingLevel.HEADING_3 }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: ['Domain Name', 'Clubs', 'Activities', 'Participants', 'Reg. Students'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] }))
                            }),
                            ...domainStats.map((d: any) => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(d.name)] }),
                                    new TableCell({ children: [new Paragraph(d.clubs.toString())] }),
                                    new TableCell({ children: [new Paragraph(d.activities.toString())] }),
                                    new TableCell({ children: [new Paragraph(d.participants.toString())] }),
                                    new TableCell({ children: [new Paragraph(d.regStudents.toString())] }),
                                ]
                            }))
                        ]
                    }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    
                    new Paragraph({ text: "Key Highlights", heading: HeadingLevel.HEADING_3 }),
                    ...activities.map((a: any) => new Paragraph({
                        text: `• ${a.club_name || 'Club'} conducted ${a.title} with ${a.participants} participants.`,
                        spacing: { after: 100 }
                    })),
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `KL_SAC_Monthly_Report_${monthStr.replace(' ', '_')}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
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
