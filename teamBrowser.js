const { Browser, newPage, executablePath } = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const { existsSync } = require('fs');

const url = require('url');
const querystring = require('querystring');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

exports.newBrowser = async (payload) => {
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
			"--auto-select-tab-capture-source-by-title=Microsoft",
			'--start-maximized'
		],
		env: {
			LANG: 'en',
		},

		// executablePath:executablePath(),

		executablePath: 'C:/Program Files/Google/Chrome/Application/Chrome.exe'

	};
	if (existsSync('/usr/bin/chromium-browser')) {
		console.log('Altering puppeteer chromium path...');
		puppeteerOptions.executablePath = '/usr/bin/chromium-browser';
	}
	// console.log(executablePath());
	const browser = await puppeteer.launch(puppeteerOptions);
	browser
		.defaultBrowserContext()
		.overridePermissions('https://teams.microsoft.com/', [
			'microphone',
			'camera',
			'notifications',
		]);

	browser
		.defaultBrowserContext()
		.overridePermissions('https://dev-light-app.antino.ca/11/2/teams', [
		// .overridePermissions('http://127.0.0.1:5500/index.html', [
			'microphone',
			'camera',
			'notifications',
		]);
	const page = await browser.newPage();

	await page.goto('https://dev-light-app.antino.ca/11/2/teams');
	// await page.goto('http://127.0.0.1:5500/index.html');
	let newPage = await browser.newPage();


	// //==============================================================================================
	const url = "https://teams.microsoft.com/l/meetup-join/19%3ameeting_ODNjYWEwMjctYTgwNi00MTg0LThkZTAtMWM3NjhhNmY2YjA0%40thread.v2/0?context=%7b%22Tid%22%3a%2282cb77e5-b2fd-4c87-8739-2727d9a86da0%22%2c%22Oid%22%3a%22135e2a95-ffe0-4a60-8e6b-0684ffdded7c%22%7d"
	// console.log("url   ====",url);
	await newPage.goto(url)

	await newPage.waitForTimeout(1000)
	let newP = await browser.newPage();
	newPage.close()
	await newP.goto(url)
	await newPage.waitForTimeout(2000)
	const aa = await newP.waitForSelector('button[data-tid=joinOnWeb]');
	await newP.click('button[data-tid=joinOnWeb]')
	await newP.waitForTimeout(15000)
	const urls = await newP.evaluate(() => window.location.href)
	// console.log("urls ===> ",urls);
	if (urls.includes("pre-join-calling")) {
		// console.log("pre-join-calling ----->  ", urls);
		await preJoinCalling()
	}
	if (urls.includes("modern-calling")) {
		// console.log("/modern-calling ----->  ", urls);
		await modernCalling()
	}

	async function modernCalling() {
		await newP.waitForTimeout(3000)
		await newP.keyboard.type('LigthBulb Bot', { delay: 15 });
		await newP.keyboard.press('Tab');
		await newP.keyboard.type(' ', { delay: 5 });
		await newP.keyboard.press('Tab');
		await newP.keyboard.press('Tab');
		await newP.keyboard.press('Tab');
		await newP.keyboard.type(' ', { delay: 5 });
		await newP.keyboard.press('Tab');
		await newP.keyboard.press('Tab');
		await newP.keyboard.press('Enter');
		// await newP.waitForTimeout(5000)
		joinForModernCalling()
	}
	async function joinForModernCalling(){
		let count = Date.now() + 600000;
		const inter = setInterval(async () => {
			const frameHandle = await newP.$('iframe[class="embedded-electron-webview embedded-page-content"]');
			const frame = await frameHandle.contentFrame();
			// console.log(await frame.$('#roster-button'));
			if (await frame.$('#roster-button') != null) {
				clearInterval(inter)
				console.log("User Admitted !!!");
				await afterJoinModernCalling(frame)
			} else {
				const time = Date.now()
				console.log((count - time) / 1000);
				const botDenied = (await newP.content()).match("Sorry, but you were denied access to the meeting.")
			// console.log("text ===>  ",botDenied);
			if(botDenied != null){
				clearInterval(inter)
				console.log("Bot has denied!!!!");
				await newP.close()
			}
				if (count < time) {
					clearInterval(inter)
					console.log("Timeout");
					await newP.close()
					console.log("User not admitted ==> Browser closed");
					// await browser.close()

				}
				console.log("User not Joined.........");
			}
		}, 2000)
	}
	async function afterJoinModernCalling(){
		// await frame.click('#roster-button')
		// await newP.waitForTimeout(3000)
		let intVal = setInterval(async ()=>{
			try {
				const frameHandle = await newP.$('iframe[class="embedded-electron-webview embedded-page-content"]');
				const frame = await frameHandle.contentFrame()
				
				await frame.focus('#roster-button')
			// 	let dd = await frame.$("#roster-title-section-2")
			// let t = await (await dd.getProperty('textContent')).jsonValue()
			// // console.log("dddd====",dd);
			// const nv = t.replace(/[A-Za-z()]/g, '')
			// console.log("participents ==>  ",nv);
			// if (nv < 2) {
			// 	clearInterval(intVal)
			// 	await newP.close()
			// 	await browser.close()
			// }
			// await frame.click('#roster-button')
			} catch (error) {
				// console.log("error => ", error);
				const botRemoved = (await newP.content()).match("You've been removed from this meeting")
				if(botRemoved != null){
					clearInterval(intVal)
					console.log("Bot Kicked !!!!");
				}else{
				clearInterval(intVal)
				console.log("Meeting Ended!!!!");
				// await newP.close()
				// await browser.close()
				}
			}
			
			
		},1000)
		
	}
	async function preJoinCalling() {

		const ab = await newP.waitForSelector('#preJoinAudioButton');
		await newP.waitForTimeout(5000)
		await newP.click('#preJoinAudioButton')
		await newP.waitForSelector('input[id=username]')
		await newP.focus('input[id=username]')
		await newP.keyboard.type('LigthBulb Bot', { delay: 15 });
		await newP.waitForTimeout(500)
		await newP.keyboard.press('Tab');
		await newP.waitForTimeout(500)
		await newP.keyboard.press('Tab');
		await newP.waitForTimeout(500)
		await newP.keyboard.press('Enter');
		await newP.waitForTimeout(500)
		await newP.keyboard.down('Shift');
		await newP.waitForTimeout(500)
		await newP.keyboard.press('Tab');
		await newP.waitForTimeout(500)
		await newP.keyboard.up('Shift');

		await newP.waitForTimeout(500)
		await newP.keyboard.press('Enter');
		await newP.waitForTimeout(15000)
		await joinForPreJoinCalling()
	}
	async function joinForPreJoinCalling() {
		let count = Date.now() + 600000
		const inter = setInterval(async () => {
			const element = await newP.$("#roster-button");
			if (element != null) {
				clearInterval(inter)
				console.log("User Admitted !!!", element);
				await afterJoinPreJoinCalling()
			} else {
				const time = Date.now()
				console.log((count - time) / 1000);
				const botDenied = (await newP.content()).match("Sorry, but you were denied access to the meeting.")
			// console.log("text ===>  ",botDenied);
			if(botDenied != null){
				clearInterval(inter)
				console.log("Bot has denied!!!!");
				await newP.close()
			}
				if (count < time) {
					clearInterval(inter)
					console.log("Timeout");
					await newP.close()
					console.log("User not admitted ==> Browser closed");
					// await browser.close()

				}
				console.log("User not Joined.........");
			}
		}, 2000)
	}
	// const random = Math.random()
	console.log("Tab pressed");
	async function afterJoinPreJoinCalling() {
		await newP.waitForSelector('#roster-button')
		await newP.click('#roster-button')
		await newP.waitForTimeout(3000)
		// let dd = await newP.$(".toggle-number")
		// let t = await (await dd.getProperty('textContent')).jsonValue()
		await newP.click('#roster-button')
		let intVal = setInterval(async () => {
			try {

				let dd = await newP.$(".toggle-number")
				let t = await (await dd.getProperty('textContent')).jsonValue()
				const nv = t.replace(/[()]/g, '')
				if (nv < 2) {
					clearInterval(intVal)
					await newP.close()
					await browser.close()
				}
				// console.log(t);
				console.log(nv);
			} catch (error) {
				// console.log("error => ", error);
				const botRemoved = (await newP.content()).match("You've been removed from this meeting")
				if(botRemoved != null){
					clearInterval(intVal)
					console.log("Bot Kicked !!!!");
				}else{
				clearInterval(intVal)
				console.log("Meeting Ended!!!!");
				// await newP.close()
				// await browser.close()
				}
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

