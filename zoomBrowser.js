const { Browser, newPage, executablePath } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const { existsSync } = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { text } = require("express");
puppeteer.use(StealthPlugin());
function get_web_url(meetingURL) {
    if (meetingURL.includes("zoom")) {
        return meetingURL.replace("/j/", "/wc/join/");
    }
    return meetingURL;
}
exports.newBrowserZoom = async (url) => {
    const newUrl = get_web_url(url);
    console.log("New URL", newUrl);
    const puppeteerOptions = {
        headless: false,
        ignoreDefaultArgs: ["--enable-automation"],
        args: [
            //   "--use-fake-ui-for-media-stream",     
            //   "--use-fake-device-for-media-stream", 
            // '--use-file-for-fake-audio-capture=/home/mj/experiment/meet-the-bots/example.wav',  
            // '--allow-file-access',     
            // '--lang=en',     
            // '--no-sandbox',     
            "--auto-select-tab-capture-source-by-title=Zoom",
            // "--auto-select-desktop-capture-source=Entire screen",      
            "--start-maximized",
        ],
        env: {
            LANG: "en",
        },
        executablePath: executablePath(),
        // executablePath:'C:/Program Files/Google/Chrome/Application/Chrome.exe' 
    };
    if (existsSync("/usr/bin/chromium-browser")) {
        console.log("Altering puppeteer chromium path...");
        puppeteerOptions.executablePath = "/usr/bin/chromium-browser";
    }
    const browser = await puppeteer.launch(puppeteerOptions);
    browser
        .defaultBrowserContext()
        .overridePermissions("https://us05web.zoom.us/wc/*", [
            "microphone",
            "camera",
            "notifications",
        ]);
    browser
        .defaultBrowserContext()
        .overridePermissions('https://dev-light-app.antino.ca/11/22/zoomNew', [
            "microphone",
            "camera",
            "notifications",
        ]);
    const page = await browser.newPage();
    await page.goto(`https://dev-light-app.antino.ca/11/22/zoomNew`);
    await page.waitForTimeout(1000);
    let newPage = await browser.newPage();
    await newPage.goto(newUrl);
    await newPage.waitForTimeout(2000);
    // By pass the Pop up  //Filling the name 
    const name = await newPage.waitForSelector("#inputname");
    await name.focus()
    await name.type("Lightbulb");
    await newPage.evaluate(() => {
        window.scrollBy(1000, window.innerHeight);
    });
    //   await newPage.waitForSelector('#joinBtn');
    await newPage.waitForTimeout(100);
   
    //Clicking Join button  
    const joinButton = await newPage.waitForSelector("#joinBtn");
    await joinButton.click();
    await newPage.waitForTimeout(3000);
    let newP = await browser.newPage();
    await newP.goto(newUrl);
    await newPage.bringToFront();
    await newP.bringToFront();
    await newP.close()
    await newPage.bringToFront();
    //Previe Join button click  

    const previewJoinButton = await newPage.waitForSelector(".preview-join-button");
    previewJoinButton.click();
    await newPage.waitForTimeout(5000)
    //   await newPage.waitForTimeout(2000);
    //View Click  //  
    await clickText(newPage,"Join Audio by Computer")
    const viewBtn = await newPage.waitForSelector("#full-screen-dropdown");
    viewBtn.click();
    //Gallery view
    await newPage.waitForTimeout(1000);
    await clickText(newPage, "Gallery View");
};
const clickText = async (newPage, text, retries = 3) => {
    const elems = await newPage.$x(`//*[contains(text(),'${text}')]`);
    let clicked = false;
    for (const el of elems) {
        try {
            await el.click();
            clicked = true;
        } catch {
            // sometimes elements with the same text are found which are not clickable   
        }
    }
    if ((elems.length === 0 || !clicked) && retries > 0) {
        await newPage.waitForTimeout(300);
        await clickText(newPage, text, retries - 1);
    }
};
