const { Browser, newPage, executablePath } = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const { existsSync } = require('fs');
const socketIo = require("socket.io");
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
			"--auto-select-tab-capture-source-by-title=Meet",
			// "--auto-select-desktop-capture-source=Entire screen",
			'--start-maximized'
		],
		env: {
			LANG: 'en',
		},

		executablePath: executablePath(),

		// executablePath:'C:/Program Files/Google/Chrome/Application/Chrome.exe'

	};

	if (existsSync('/usr/bin/chromium-browser')) {
		console.log('Altering puppeteer chromium path...');
		puppeteerOptions.executablePath = '/usr/bin/chromium-browser';
	}
	const browser = await puppeteer.launch(puppeteerOptions);
	browser
		.defaultBrowserContext()
		.overridePermissions('https://meet.google.com/', [
			'microphone',
			'camera',
			'notifications',
		]);

	browser
		.defaultBrowserContext()
		.overridePermissions('https://dev-light-app.antino.ca/11/22/gmeet/', [
			'microphone',
			'camera',
			'notifications',
		]);
	const page = await browser.newPage();
	// setTimeout()
	// await newPage.setViewport({ width: 1500, height: 768});

	//   await page.goto('http://127.0.0.1:5500/index.html');
	await page.goto('https://dev-light-app.antino.ca/11/22/gmeet/');
	//   await page.waitForTimeout(3000)
	let newPage = await browser.newPage();


	await newPage.goto('https://meet.google.com/cwh-tuca-tgx');
	//   await newPage.keyboard.type('LigthBulb', { delay: 15 });
	// console.log('turn off cam using Ctrl+E');
	// await newPage.waitForTimeout(1110);
	// await newPage.keyboard.down('ControlLeft');
	// await newPage.keyboard.press('KeyE');
	// await newPage.keyboard.up('ControlLeft');
	// // await newPage.waitForTimeout(100);

	// console.log('turn off mic using Ctrl+D');
	// await newPage.waitForTimeout(100);
	// await newPage.keyboard.down('ControlLeft');
	// await newPage.keyboard.press('KeyD');
	// await newPage.keyboard.up('ControlLeft');
	await newPage.waitForTimeout(3000);
	await newPage.waitForSelector("#c6")
	await newPage.type("#c6", "LigthBulb", { delay: 15 })
	// await newPage.keyboard.type('LigthBulb', { delay: 15 });

	await clickText(newPage, 'Ask to join');
	
	let count = Date.now() + 600000
	const inter = setInterval(async () => {
		//VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ JsuyRc boDUxc
		// const abc = await newPage.waitForSelector('button[jsname=A5il2e]')
		// abc.click()

		const element = await newPage.$(".uGOf1d");
		if (element != null) {
			clearInterval(inter)
			await clickText(newPage, 'people_outline')
			await newPage.waitForTimeout(500)
			await clickText(newPage, 'close')
			const users = await newPage.$$(".zWGUib");
			// const texts = await newPage.evaluate(users => users.textContent, users);
			console.log("users ====  ", users);
			users.map(async (ele) => {
				const texts = await newPage.evaluate(ele => ele.textContent, ele);
				console.log("User Name => ", texts);
			})
			console.log("User Admitted !!!", element);
			await test(element, users)
		} else {
			const time = Date.now()
			console.log((count - time) / 1000);
			// const elems = await newPage.evaluate(el => el.innerText, await newPage.$x('//*[contains(text(), "You can't join")]'))
			// console.log("elements ====>",elems);
			// const asa =await newPage.waitForXPath("//*[contains(text(), 'You can't join this call')]");
			const botDenied = (await newPage.content()).match("You can't join this call")

			if (botDenied != null) {
				clearInterval(inter)
				console.log("Bot has denied!!!!");
				await newPage.close()
			}
			if (count <= time) {
				clearInterval(inter)
				console.log("Timeout");
				// await newPage.close()
				console.log("User not admitted ==> Browser closed");
				// await browser.close()

			}
			console.log("User not Joined.........");
		}
	}, 2000)
	async function test(element, users) {
		let text;
		const clrInt = setInterval(async () => {
			try {
				text = await newPage.evaluate(element => element.textContent, element);
				// const user = await newPage.evaluate(users => users.textContent, users);
				console.log('peoples====>>>>>>>', text);
				const botRemoved = (await newPage.content()).match("You've been removed from the meeting")
				// console.log('botRemoved  ====>>>>>>>  ', botRemoved);
				if (botRemoved != null) {
					clearInterval(clrInt)
					console.log("Bot has kicked !!!!!!")
				}
				if (text == 1 || text == 'undefined') {
					clearInterval(clrInt)
					// newPage.close()
					console.log("Meeting Ended !!!");
					console.log("Browser closed");
					// browser.close()
				}
			} catch (error) {
				console.log("error --> ", error);
				clearInterval(clrInt)
				// newPage.close()
				console.log("Browser closed");
				// browser.close()
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

