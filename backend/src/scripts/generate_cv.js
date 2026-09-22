const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('cv_test.pdf'));

doc.fontSize(25).text('JUAN PEREZ', 100, 80);
doc.fontSize(16).text('Senior Fullstack Developer', 100, 110);

doc.fontSize(12).text('\nRESUMEN:', 100, 150);
doc.text('Desarrollador con más de 8 años de experiencia en Node.js, React y bases de datos SQL/NoSQL. Experto en arquitecturas de microservicios y despliegue en AWS.');

doc.text('\nHABILIDADES:', 100, 220);
doc.text('• JavaScript, TypeScript, Node.js, NestJS');
doc.text('• React, Next.js, Tailwind CSS');
doc.text('• PostgreSQL, MongoDB, Redis');
doc.text('• Docker, Kubernetes, AWS');

doc.text('\nEXPERIENCIA:', 100, 320);
doc.text('Tech Solutions Inc. - Lead Developer (2018 - Presente)');
doc.text('- Liderazgo de equipo de 10 personas.');
doc.text('- Migración de monolito a microservicios.');

doc.end();
console.log('✅ CV de prueba generado: cv_test.pdf');
