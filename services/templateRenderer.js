// services/templateRenderer.js
const fs = require('fs');
const path = require('path');

const renderTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '../templates', templateName); // Adjust path if necessary
  let template = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders in the template with actual data
  for (const key in data) {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), data[key]);
  }

  return template;
};

module.exports = { renderTemplate };
