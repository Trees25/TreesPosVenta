import fs from 'fs';
import path from 'path';

const inputFile = 'productos_1000.csv';
const outputFile = 'productos_con_proveedores.csv';

// Helper to get random int between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split(/\r?\n/);

    if (lines.length === 0) {
        console.log("File is empty");
        process.exit(1);
    }

    // Update header
    const header = lines[0];
    const newHeader = header + ',id_proveedor';

    const newLines = [newHeader];

    // Process rows
    // IDs random from 1 to 5 (Assumes you will have at least 5 providers)
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // Skip empty lines

        // Assign random provider ID between 1 and 5
        const providerId = getRandomInt(1, 5);
        newLines.push(lines[i] + ',' + providerId);
    }

    fs.writeFileSync(outputFile, newLines.join('\n'), 'utf8');
    console.log(`Successfully created ${outputFile} with supplier IDs.`);

} catch (err) {
    console.error("Error processing CSV:", err);
}
