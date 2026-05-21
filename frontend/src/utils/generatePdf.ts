import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfData {
  candidateName: string;
  jobTitle: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export const generateAnalysisPdf = (data: PdfData) => {
  const doc = new jsPDF();
  const { candidateName, jobTitle, score, strengths, weaknesses, recommendations } = data;

  // --- Header ---
  doc.setFillColor(15, 17, 26); // Dark background like the app
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('IA RECRUITER', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Análisis de Compatibilidad con IA', 20, 32);

  // --- Info Section ---
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text('Detalles del Candidato', 20, 55);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Candidato: ${candidateName}`, 20, 62);
  doc.text(`Puesto: ${jobTitle}`, 20, 68);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es')}`, 20, 74);

  // --- Score Box ---
  const scoreColor = score > 80 ? [34, 197, 94] : score > 50 ? [234, 179, 8] : [239, 68, 68];
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(140, 50, 50, 30, 3, 3, 'S');
  
  doc.setFontSize(24);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${score}%`, 165, 70, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('PUNTAJE IA', 165, 76, { align: 'center' });

  // --- Strengths & Weaknesses ---
  autoTable(doc, {
    startY: 90,
    head: [['Fortalezas Detectadas']],
    body: strengths.map(s => [s]),
    headStyles: { fillColor: [34, 197, 94], fontSize: 12 },
    bodyStyles: { fontSize: 10, textColor: [30, 41, 59] },
    margin: { left: 20, right: 110 },
  });

  autoTable(doc, {
    startY: 90,
    head: [['Áreas a Mejorar / Debilidades']],
    body: weaknesses.map(w => [w]),
    headStyles: { fillColor: [239, 68, 68], fontSize: 12 },
    bodyStyles: { fontSize: 10, textColor: [30, 41, 59] },
    margin: { left: 110, right: 20 },
  });

  // --- Recommendations ---
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Recomendaciones de la IA', 20, finalY + 15);
  
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const splitRecommendations = doc.splitTextToSize(recommendations.join('\n\n'), 170);
  doc.text(splitRecommendations, 20, finalY + 22);

  // --- Footer ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generado automáticamente por IA Recruiter - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`Analisis_IA_${candidateName.replace(' ', '_')}.pdf`);
};
