const fs = require('fs');
const path = require('path');

function runTest() {
    try {
        const filePath = path.join(__dirname, '../index.html');
        const html = fs.readFileSync(filePath, 'utf-8');

        // This is a brittle test, but it avoids the need for external dependencies.
        // It looks for the specific HTML structure of the featured cards.
        const mugLinkRegex = /<div class="featured-card">\s*<img[^>]+alt="Creative Mug"[^>]+>\s*<h3>Art Mugs<\/h3>\s*<p>[^<]+<\/p>\s*<a class="featured-btn" href="products.html">Shop Mugs<\/a>/;
        const caseLinkRegex = /<div class="featured-card">\s*<img[^>]+alt="Designer Phone Case"[^>]+>\s*<h3>Phone Case Art<\/h3>\s*<p>[^<]+<\/p>\s*<a class="featured-btn" href="products.html">Shop Cases<\/a>/;

        let passed = true;
        let messages = [];

        if (mugLinkRegex.test(html)) {
            messages.push('PASS: "Shop Mugs" link seems correct.');
        } else {
            passed = false;
            messages.push('FAIL: "Shop Mugs" link is incorrect or the structure has changed.');
        }

        if (caseLinkRegex.test(html)) {
            messages.push('PASS: "Shop Cases" link seems correct.');
        } else {
            passed = false;
            messages.push('FAIL: "Shop Cases" link is incorrect or the structure has changed.');
        }

        console.log(messages.join('\n'));

        if (passed) {
            console.log('\nAll tests passed!');
            process.exit(0);
        } else {
            console.error('\nSome tests failed.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error running test:', error);
        process.exit(1);
    }
}

runTest();
