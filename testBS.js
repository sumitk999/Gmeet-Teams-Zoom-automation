const { Browser, newPage, executablePath } = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const { existsSync } = require('fs');
const expect = require('chai').expect;


const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { text } = require('express');
puppeteer.use(StealthPlugin());

exports.newBrowser = async () => {
	const puppeteerOptions = {
		headless: false,
		ignoreDefaultArgs: ["--enable-automation"],
		args: [

			// '--use-fake-ui-for-media-stream',
			// '--use-fake-device-for-media-stream',
			// '--use-file-for-fake-audio-capture=/home/mj/experiment/meet-the-bots/example.wav',
			// '--allow-file-access',
			// '--lang=en',
			// '--no-sandbox',
			"--auto-select-tab-capture-source-by-title=meet",
			// "--auto-select-desktop-capture-source=Entire screen",
			'--start-maximized'
		],
		env: {
			LANG: 'en',
		},


	};
    const caps = {
        headless: false,
        'browser': 'chrome',  // You can choose `chrome`, `edge` or `firefox` in this capability
        'browser_version': 'latest',  // We support v83 and above. You can choose `latest`, `latest-beta`, `latest-1`, `latest-2` and so on, in this capability
        'os': 'os x',
        'os_version': 'big sur',
        'build': 'puppeteer-build-1',
        'name': 'My first Puppeteer test',  // The name of your test and build. See browserstack.com/docs/automate/puppeteer/organize tests for more details
        'browserstack.username': process.env.BROWSERSTACK_USERNAME || 'sumitkumar_N6CFjc',
        'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY || 'mH3ggvFDMC7bqmEYuddQ',
        // defaultViewport :{width: 1700, height: 800},
        "args": [
            '--use-fake-ui-for-media-stream',
			'--use-fake-device-for-media-stream',
            // "--auto-select-tab-capture-source-by-title=Meet",
            "--auto-select-desktop-capture-source=Entire screen",
            '--start-maximized'
        ],
    };
	const browser = await puppeteer.connect({
        // 
        
        browserWSEndpoint:
            `wss://cdp.browserstack.com/puppeteer?caps=${encodeURIComponent(JSON.stringify(caps))}`,
    });
	browser
		.defaultBrowserContext()
		.overridePermissions('https://meet.google.com/', [
			'microphone',
			'camera',
			'notifications',
		]);

	browser
		.defaultBrowserContext()
		.overridePermissions('https://lightbulb.tiiny.site/', [
			'microphone',
			'camera',
			'notifications',
		]);
	const page = await browser.newPage();
	// setTimeout()
	// await newPage.setViewport({ width: 1500, height: 768});

	//   await page.goto('http://127.0.0.1:5500/index.html');
	await page.goto('https://lightbulb.tiiny.site/');
	//   await page.waitForTimeout(3000)
	let newPage = await browser.newPage();


	await newPage.goto('https://meet.google.com/ayn-yayg-yvo');
	//   await newPage.keyboard.type('LigthBulb', { delay: 15 });
	// console.log('turn off cam using Ctrl+E');
	await newPage.waitForTimeout(3000);
	await newPage.keyboard.down('ControlLeft');
	await newPage.keyboard.press('KeyE');
	await newPage.keyboard.up('ControlLeft');
	await newPage.waitForTimeout(100);

	// console.log('turn off mic using Ctrl+D');
	await newPage.waitForTimeout(1000);
	await newPage.keyboard.down('ControlLeft');
	await newPage.keyboard.press('KeyD');
	await newPage.keyboard.up('ControlLeft');
	await newPage.waitForTimeout(100);

	await newPage.keyboard.type('LigthBulb', { delay: 15 });

	await clickText(newPage, 'Ask to join');
	// const ll=await newPage.waitForSelector('.VfPpkd-RLmnJb')
	// let count = Date.now() + 60000
	// const inter  = setInterval(async ()=>{
	// 	const element = await newPage.$(".uGOf1d");
	// 	if(element != null){
	// 		clearInterval(inter)
	// 		console.log("User Admitted !!!",element);
	// 		await test(element)
	// 	}else{
	// 		const time = Date.now()
	// 		console.log((count-time)/1000);
	// 		if(count <= time){
	// 			clearInterval(inter)
	// 			console.log("Timeout");
	// 			await newPage.close()
	// 			console.log("User not admitted ==> Browser closed");
	// 			await browser.close()

	// 		}
	// 		console.log("User not Joined.........");
	// 	}
	// },2000)
	async function test(element){
		let text;
		const clrInt = setInterval(async () => {
			try {
				text = await newPage.evaluate(element => element.textContent, element);
				console.log('peoples====>>>>>>>', text);
				if (text == 1 || text == 'undefined') {
					clearInterval(clrInt)
					newPage.close()
					console.log("Browser closed");
					browser.close()
				}
			} catch (error) {
				// console.log("error --> ",error);
				clearInterval(clrInt)
				newPage.close()
				console.log("Browser closed");
				browser.close()
			}
		}, 2000)
	}
	

}

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

