const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.get('/check', async (req, res) => {
  const { idType, idValue } = req.query;

  if (!idType || !idValue) {
    return res.status(400).json({ error: "Missing idType or idValue" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto('https://mhfr.agristack.gov.in/farmer-registry-mh/#/checkEnrolmentStatus', {
      waitUntil: 'networkidle0'
    });

    await page.click(`input[value="${idType}"]`);
    await page.type('input[formcontrolname="idValue"]', idValue);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    const result = await page.evaluate(() => document.body.innerText);

    await browser.close();

    res.send(`<pre>${result}</pre>`);
  } catch (error) {
    res.status(500).send("Scraping failed: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
