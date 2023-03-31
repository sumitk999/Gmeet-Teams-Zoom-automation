const { Browser, newPage, executablePath } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const webmToMp4 = require("webm-to-mp4");
const fs = require("fs");
const FormData = require("form-data");
const _ = require("lodash");
const url = require("url");
const querystring = require("querystring");

const axios = require("axios");
const meetingBaseUrl = "https://dev-light-be.antino.ca/api/v1/meeting";

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { text } = require("express");
puppeteer.use(StealthPlugin());

const path = "C:\\Users\\Administrator\\Documents\\scripts";

async function deleteInstance(instance_id) {
  try {
    let script = `${path}\\delete_instance.sh`;
    console.log(`bash ${script} ${instance_id}`);
    let shell_exec_data = shell.exec(`bash ${script} ${instance_id}`);
    if (shell_exec_data) {
      Console.log(`${instance_id} deleted successfully`);
    } else {
      console.log(`meeting deletion failed`);
    }
  } catch (e) {
    console.log(`Error In Delete Instance Function`, e);
  }
}

async function uploadgmeet(filename, meetingUrl) {
  const { promises: fs } = require("fs");
  let file = await fs.readFile(`../${filename}`);
  console.log("file buffer", file);

  var formData = new FormData();
  formData.append("file", file, filename);
  //https://dfe7-2405-204-10a4-9603-881b-80f5-e7b1-fb8f.in.ngrok.io
  let result = await axios.post(
    `https://lightbulb-core-app-be.antino.ca/uploadRecording?meetingUrl=${meetingUrl}`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log("response", result.data);
  return result;
}

async function uploadteams(filename, meetingId) {
  const { promises: fs } = require("fs");
  let file = await fs.readFile(`../${filename}`);
  console.log("file buffer", file);

  var formData = new FormData();
  formData.append("file", file, filename);
  //https://dfe7-2405-204-10a4-9603-881b-80f5-e7b1-fb8f.in.ngrok.io
  let result = await axios.post(
    `https://dev-light-be.antino.ca/uploadRecordingGeneral?meetingId=${meetingId}`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log("response", result.data);
  return result;
}

function get_web_url(meetingURL) {
  if (meetingURL.includes("zoom")) {
    return meetingURL.replace("/j/", "/wc/join/");
  }
  return meetingURL;
}
let baseUrl = "https://dev-light-be.antino.ca";
//Bot status update
async function botStatus(data) {
  console.log("In Bot Status");
  const botresponse = await fetch(
    `${baseUrl}/api/v1/meeting/update-meeting-status`,
    {
      method: "POST",
      cache: "no-cache",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    }
  );
  return botresponse.json();
}

var usersJoined = [];
var usersLeft = [];

exports.newBrowserZoom = async (
  url,
  meetingNumber,
  meetingPasscode,
  instanceId,
  botname
) => {
  const newUrl = get_web_url(url);
  console.log("New URL", newUrl);
  let pageTitle = "Zoom Web";
  const puppeteerOptions = {
    defaultViewport: null,
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      //   "--use-fake-ui-for-media-stream",
      //   "--use-fake-device-for-media-stream",
      // '--use-file-for-fake-audio-capture=/home/mj/experiment/meet-the-bots/example.wav',
      // '--allow-file-access',      // '--lang=en',      // '--no-sandbox',
      `--auto-select-tab-capture-source-by-title=${pageTitle}`,
      // "--auto-select-desktop-capture-source=Entire screen",
      "--start-maximized",
    ],
    env: {
      LANG: "en",
    },
    // executablePath: executablePath(),
    executablePath: "C:/Program Files/Google/Chrome/Application/Chrome.exe",
  };
  // if (existsSync("/usr/bin/chromium-browser")) {
  //   console.log("Altering puppeteer chromium path...");
  //   puppeteerOptions.executablePath = "/usr/bin/chromium-browser";
  // }
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
    .overridePermissions(
      `https://dev-light-app.antino.ca/${meetingNumber}/${meetingPasscode}/zoomNew/${instanceId}/${botname}`,
      ["microphone", "camera", "notifications"]
    );
  const page = await browser.newPage();
  await page.goto(
    `https://dev-light-app.antino.ca/${meetingNumber}/${meetingPasscode}/zoomNew/${instanceId}/${botname}`
  );
  await page.waitForTimeout(1000);
  let newPage = await browser.newPage();
  await newPage.goto(newUrl);
  await newPage.waitForTimeout(2000);
  // By pass the Pop up  //Filling the name
  console.log("Joining Process Initiated");

  // //zoom new start recording
  // let result = await axios.get(`https://dev-light-be.antino.ca/startRecording?meetingId=${meetingNumber}`)
  //    console.log(result.data)

  // const name = await newPage.waitForSelector("#inputname");
  // await name.focus();

  // await name.type(`VM Pro Assistant - ${botname}`,{delay:20});

  let name = `VM Pro Assistant - ${botname}`;

  // await newPage.type('input[name=inputname]', name);
  await newPage.evaluate(
    (val) => (document.querySelector("#inputname").value = val),
    name
  );

  // await newPage.$eval("input[name=inputname]",(el) => {
  //   // el.value = name
  // });

  // await newPage.$eval("input[name=inputname]", (el) => (el.value = name));

  // await newPage.evaluate(() => {

  //    console.log("idhar hu main")
  //     const email = document.querySelector('#inputname');
  //      email.value = name;

  //   });

  await newPage.waitForTimeout(4000);
  await newPage.evaluate(() => {
    window.scrollBy(1000, window.innerHeight);
  });
  // await newPage.waitForSelector('#joinBtn');
  await newPage.waitForTimeout(100);

  //Join Difference Function
  const JoinDifference = () => {
    //In waiting Room
    let initialTime = Date.now() + 600000;
    const waitingInterval = setInterval(async () => {
      const checkviewBtn = await newPage.$("#full-screen-dropdown");

      const rejectPopup = await newPage.$(".zm-modal-body-title");
      console.log("Reject Pop up", rejectPopup);
      if (rejectPopup != null) {
        const text = await (
          await rejectPopup.getProperty("textContent")
        ).jsonValue();
        console.log("Text", text);
        if (text == "You have been removed") {
          console.log("Rejected from the meeting");
          //Bot Denied
          let payload = {
            key: "bot",
            //Replace meeting ID
            meetingId: meetingNumber,
            status: "BotDenied",
            platForm: "zoom",
          };
          botStatus(payload)
            .then((result) => console.log("Bot staus Updated sent", result))
            .catch((error) => console.log("Bot status error", error));
          clearInterval(waitingInterval);

          // pending updation of meeting status

          let meetingPayload = {
            key: "meeting",
            //Replace the Meeting ID
            meetingId: meetingNumber,
            status: "completed",
            platForm: "zoom",
          };

          botStatus(meetingPayload)
            .then((result) => console.log("Meeting staus Updated sent", result))
            .catch((error) => console.log("Meeting status error", error));

          //Delete VM instance APi CALL
          deleteInstance(instanceId);
        }
      }

      // console.log("View Button", checkviewBtn);
      if (checkviewBtn != null) {
        clearInterval(waitingInterval);

        afterJoin();
      } else {
        let time = Date.now();
        console.log("Initial Tim", initialTime);
        console.log("Current time", time);
        if (initialTime <= time) {
          console.log("Bot not accepted");

          //Bot Not Accepted
          let payload = {
            key: "bot",
            //Replace meeting ID
            meetingId: meetingNumber,
            status: "BotNotAccepted",
            platForm: "zoom",
          };
          botStatus(payload)
            .then((result) => console.log("Bot staus Updated sent", result))
            .catch((error) => console.log("Bot status error", error));

          // pending meeting status updation

          let meetingPayload = {
            key: "meeting",
            //Replace the Meeting ID
            meetingId: meetingNumber,
            status: "completed",
            platForm: "zoom",
          };

          botStatus(meetingPayload)
            .then((result) => console.log("Meeting staus Updated sent", result))
            .catch((error) => console.log("Meeting status error", error));

          clearInterval(waitingInterval);
          // let result = await axios.post(`http://3.111.85.158:3000/instanceCrud?type=delete_instance&arguments=${instanceId}`);
          deleteInstance(instanceId);
        }
        //In Waiting Room
        // console.log("In waiting room");
        // let payload = {
        //   key: "bot",
        //   //Replace meeting ID
        //   meetingId: meetingNumber,
        //   status: "BotWaiting",
        //   platForm: "zoom",
        // };
        // botStatus(payload)
        //   .then((result) => console.log("Bot staus Updated sent", result))
        //   .catch((error) => console.log("Bot status error", error));
      }
    }, 2000);

    const afterJoin = async () => {
      console.log("Joined");

      //zoom new start recording
      // let result = await axios.get(`https://dev-light-be.antino.ca/startRecording?meetingId=${meetingNumber}`)
      //    console.log(result.data)

      // pageTitle = await newPage.title();
      // console.log("page title updated",pageTitle);

      //Bot status
      let payload = {
        key: "bot",
        //Replace meeting ID
        meetingId: meetingNumber,
        status: "BotJoined",
        platForm: "zoom",
      };
      botStatus(payload)
        .then((result) => console.log("Bot staus Updated sent", result))
        .catch((error) => console.log("Bot status error", error));
      //Meeting Status
      let meetingPayload = {
        key: "meeting",
        //Replace Meeting ID
        meetingId: meetingNumber,
        status: "Running",
        platForm: "zoom",
      };
      botStatus(meetingPayload)
        .then((result) => console.log("Meeting staus Updated sent", result))
        .catch((error) => console.log("Meeting status error", error));
      //Start Recording
      // let result = await axios.get(`https://dev-light-be.antino.ca/startRecording?meetingId=${meetingNumber}`)
      // console.log(result.data)

      const viewBtn = await newPage.waitForSelector("#full-screen-dropdown", {
        timeout: 60000,
      });
      viewBtn.click();
      //Gallery view
      await newPage.waitForTimeout(2000);
      await clickText(newPage, "Gallery View");
      //Join Computer Audio
      await newPage.waitForTimeout(2000);
      await clickText(newPage, "Join Audio by Computer");

      await newPage.evaluate(() => {
        document.title = "Zoom Web";
      });

      let result = await axios.get(
        `https://dev-light-be.antino.ca/startRecording?meetingId=${meetingNumber}`
      );
      console.log(result.data);

      //For Pop ups
      await newPage.waitForTimeout(5000);
      await newPage.mouse.click(160, 300, { button: "left" });

      const endInterval = setInterval(async () => {
        //Stop Recording

        const closeRecording = await newPage.$(".zm-modal-body-title");
        console.log("Close Recording", closeRecording);

        if (closeRecording != null) {
          // clearInterval(endInterval);
          // console.log("Recording should be stooped");

          const text = await (
            await closeRecording.getProperty("textContent")
          ).jsonValue();
          console.log("Text", text);
          if (text == "You have been removed") {
            clearInterval(endInterval);
            console.log("Removed from the Meeting");
            //Bot Removed
            let payload = {
              key: "bot",
              //Replace meeting ID
              meetingId: meetingNumber,
              status: "BotRemoved",
              platForm: "zoom",
            };
            botStatus(payload)
              .then((result) => console.log("Bot staus Updated sent", result))
              .catch((error) => console.log("Bot status error", error));

            let meetingPayload = {
              key: "meeting",
              //Replace the Meeting ID
              meetingId: meetingNumber,
              status: "completed",
              platForm: "zoom",
            };

            botStatus(meetingPayload)
              .then((result) =>
                console.log("Meeting staus Updated sent", result)
              )
              .catch((error) => console.log("Meeting status error", error));

            // stop recording
            let result = await axios.get(
              `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingNumber}`
            );
            console.log(result.data);

            // // delete api called
            // deleteInstance(instanceId);
          }

          if (text == "This meeting has been ended by host") {
            clearInterval(endInterval);
            console.log("Recording should be stooped");

            let meetingPayload = {
              key: "meeting",
              //Replace the Meeting ID
              meetingId: meetingNumber,
              status: "completed",
              platForm: "zoom",
            };

            botStatus(meetingPayload)
              .then((result) =>
                console.log("Meeting staus Updated sent", result)
              )
              .catch((error) => console.log("Meeting status error", error));

            //Bot left

            let botPayload = {
              key: "bot",
              //Replace the Meeting ID
              meetingId: meetingNumber,
              status: "BotLeft",
              platForm: "zoom",
            };
            botStatus(botPayload)
              .then((result) => console.log("Bot staus Updated sent", result))
              .catch((error) => console.log("Bot status error", error));

            // stop recording
            let result = await axios.get(
              `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingNumber}`
            );
            console.log(result.data);
          }
        }
      }, 2000);
    };
  };

  //Clicking Join button
  const joinButton = await newPage.waitForSelector("#joinBtn");

  //Fetching Passcode Element for distribution of UI
  const passcodeElement = await newPage.$("#inputpasscode");

  if (passcodeElement == null) {
    await newPage.type("input[name=inputname]", " ");
    await newPage.waitForTimeout(3000);
    await joinButton.click();
    await newPage.waitForTimeout(3000);
    let newP = await browser.newPage();
    await newP.goto(newUrl);
    await newPage.bringToFront();
    await newP.bringToFront();
    await newP.close();
    await newPage.bringToFront();
    await newPage.waitForTimeout(5000);
    JoinDifference();
  } else {
    await newPage.type("input[name=inputname]", " ");
    await newPage.waitForTimeout(3000);
    await joinButton.click();
    await newPage.waitForTimeout(3000);
    let newP = await browser.newPage();
    await newP.goto(newUrl);
    await newPage.bringToFront();
    await newP.bringToFront();
    await newP.close();
    await newPage.bringToFront();

    //Preview Join button click
    const previewJoinButton = await newPage.waitForSelector(
      ".preview-join-button",
      { timeout: 60000 }
    );
    previewJoinButton.click();

    await newPage.waitForTimeout(5000);
    JoinDifference();
  }
};

exports.teamsBrowser = async (url, meetingId, instanceId, name) => {
  console.log("function called for teams recording");
  const puppeteerOptions = {
    defaultViewport: null,
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
      "--start-maximized",
    ],
    env: {
      LANG: "en",
    },

    // executablePath:executablePath(),

    executablePath: "C:/Program Files/Google/Chrome/Application/Chrome.exe",
  };
  // if (existsSync("/usr/bin/chromium-browser")) {
  //   console.log("Altering puppeteer chromium path...");
  //   puppeteerOptions.executablePath = "/usr/bin/chromium-browser";
  // }
  // console.log(executablePath());
  const browser = await puppeteer.launch(puppeteerOptions);
  browser
    .defaultBrowserContext()
    .overridePermissions("https://teams.microsoft.com/", [
      "microphone",
      "camera",
      "notifications",
    ]);

  // browser
  //   .defaultBrowserContext()
  //   .overridePermissions(`https://dev-light-app.antino.ca/${meetingId}/22/teams`, [
  //     // .overridePermissions('http://127.0.0.1:5500/index.html', [
  //     "microphone",
  //     "camera",
  //     "notifications",
  //   ]);

  browser
    .defaultBrowserContext()
    .overridePermissions(
      `https://dev-light-app.antino.ca/${meetingId}/22/teams/`,
      [
        // .overridePermissions('http://127.0.0.1:5500/index.html', [
        "microphone",
        "camera",
        "notifications",
      ]
    );

  const page = await browser.newPage();

  page.on("console", async (message) => {
    console.log(`${message.text()}`);
    //inMeetingServiceListener Meeting Ended

    if ("Video Downloaded" === message.text()) {
      setTimeout(async () => {
        const path = require("path");

        // const getMostRecentFile = (dir) => {
        //   const files = orderReccentFiles(dir);
        //   return files.length ? files[0] : undefined;
        // };

        // const orderReccentFiles = (dir) => {
        //   return fs.readdirSync(dir)
        //     .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
        //     .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
        //     .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
        // }
        // let filename = getMostRecentFile('C:\\Users\\lbadmin\\Downloads').file;

        fs.exists(
          `C:\\Users\\Administrator\\Downloads\\${meetingId}.webm`,
          async (exists) => {
            if (exists) {
              let filename = `${meetingId}.webm`;
              async function convert() {
                const { promises: fs } = require("fs");

                await fs.writeFile(
                  `C:\\Users\\Administrator\\Downloads\\${meetingId}conv.mp4`,
                  Buffer.from(
                    webmToMp4(
                      await fs.readFile(
                        `C:\\Users\\Administrator\\Downloads\\${filename}`
                      )
                    )
                  )
                );
              }
              await convert();

              filename = `${meetingId}conv.mp4`;
              // console.log("latest filename",filename);
              console.log("latest filename", filename);
              console.log("meetingId", meetingId);

              // let result = await uploadteams(filename,meetingId);
            } else {
              console.log("file not found");
            }
          }
        );
        //let filename = getMostRecentFile('C:\\Users\\Administrator\\Downloads').file;

        // async function convert(){
        //   const { promises: fs } = require("fs");

        //   await fs.writeFile(
        //     `C:\\Users\\lbadmin\\Downloads\\${meetingId}_conv.mp4`,
        //     Buffer.from(webmToMp4(await fs.readFile(`C:\\Users\\lbadmin\\Downloads\\${filename}`))) );
        // }
        // await convert();

        //  filename = `${meetingId}_conv.mp4`;
        // // console.log("latest filename",filename);
        // console.log("latest filename",filename);
        // console.log("meetingId",meetingId);

        // let result = await uploadteams(filename,meetingId);

        setTimeout(async () => {
          console.log("Browser Instance Closed after download");
          // await browser.close();
        }, 10000);
      }, 10000);
    }
  });

  // await page.goto(`https://dev-light-app.antino.ca/${meetingId}/22/teams`);

  await page.goto(
    `https://dev-light-app.antino.ca/${meetingId}/22/teams/${instanceId}/${name}`
  );
  console.log("front end recording dev link for recording teams is running");
  // await page.goto('http://127.0.0.1:5500/index.html');
  let newPage = await browser.newPage();

  // //==============================================================================================

  // console.log("url   ====",url);
  await newPage.goto(url);

  await newPage.waitForTimeout(1000);
  let newP = await browser.newPage();
  newPage.close();
  await newP.goto(url);
  await newPage.waitForTimeout(2000);
  const aa = await newP.waitForSelector("button[data-tid=joinOnWeb]");
  await newP.click("button[data-tid=joinOnWeb]");
  await newP.waitForTimeout(20000);
  const urls = await newP.evaluate(() => window.location.href);
  // console.log("urls ===> ",urls);
  if (urls.includes("pre-join-calling")) {
    console.log("pre-join-calling ----->  ", urls);
    await preJoinCalling();
  }
  if (urls.includes("modern-calling")) {
    console.log("/modern-calling ----->  ", urls);
    await modernCalling();
  }

  async function modernCalling() {
    await newP.waitForTimeout(3000);
    await newP.keyboard.type(`VM Pro Assistant - ${name}`, { delay: 15 });
    await newP.keyboard.press("Tab");
    await newP.keyboard.type(" ", { delay: 5 });
    await newP.keyboard.press("Tab");
    await newP.keyboard.press("Tab");
    await newP.keyboard.press("Tab");
    await newP.keyboard.type(" ", { delay: 5 });
    await newP.keyboard.press("Tab");
    await newP.keyboard.press("Tab");
    await newP.keyboard.press("Enter");
    // await newP.waitForTimeout(5000)
    joinForModernCalling();
  }
  async function joinForModernCalling() {
    let count = Date.now() + 600000;
    const inter = setInterval(async () => {
      try {
        const frameHandle = await newP.$(
          'iframe[class="embedded-electron-webview embedded-page-content"]'
        );
        const frame = await frameHandle.contentFrame();
        // console.log(await frame.$('#roster-button'));
        if ((await frame.$("#roster-button")) != null) {
          clearInterval(inter);
          // start socket

          console.log("User Admitted !!!");
          console.log("before calling the api");
          let result = await axios.get(
            `https://dev-light-be.antino.ca/startRecording?meetingId=${meetingId}`
          );
          console.log(result.data);
          await afterJoinModernCalling(frame);
        } else {
          const time = Date.now();
          console.log((count - time) / 1000);

          const botDenied = (await newP.content()).match(
            "Sorry, but you were denied access to the meeting."
          );
          // console.log("text ===>  ",botDenied);
          if (botDenied != null) {
            clearInterval(inter);
            console.log("Bot has denied!!!!");
            await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
              meetingId: `${meetingId}`,
              status: "BotDenied",
              key: "bot",
            });

            await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
              meetingId: `${meetingId}`,
              status: "completed",
              key: "meeting",
            });

            deleteInstance(instanceId);
            // await newP.close()
          }

          if (count < time) {
            clearInterval(inter);

            console.log("Timeout");
            // await newP.close();
            console.log("User not admitted ==> Browser closed");
            await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
              meetingId: `${meetingId}`,
              status: "BotNotAccepted",
              key: "bot",
            });

            await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
              meetingId: `${meetingId}`,
              status: "completed",
              key: "meeting",
            });
            deleteInstance(instanceId);
            // await browser.close()
          }
          console.log("User not Joined.........");
        }
      } catch (err) {
        console.log("error inside setInterval", err);
      }
    }, 2000);
  }
  async function afterJoinModernCalling() {
    // await frame.click('#roster-button')
    // await newP.waitForTimeout(3000)
    let intVal = setInterval(async () => {
      try {
        const frameHandle = await newP.$(
          'iframe[class="embedded-electron-webview embedded-page-content"]'
        );
        const frame = await frameHandle.contentFrame();

        await frame.focus("#roster-button");
        //  let dd = await frame.$("#roster-title-section-2")
        // let t = await (await dd.getProperty('textContent')).jsonValue()
        // // console.log("dddd====",dd);
        // const nv = t.replace(/[A-Za-z()]/g, '')
        // console.log("participents ==>  ",nv);
        // if (nv < 2) {
        //  clearInterval(intVal)
        //  await newP.close()
        //  await browser.close()
        // }
        // await frame.click('#roster-button')
      } catch (error) {
        // console.log("error => ", error);
        const botRemoved = (await newP.content()).match(
          "You've been removed from this meeting"
        );
        if (botRemoved != null) {
          clearInterval(intVal);
          let result = await axios.get(
            `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
          );
          console.log(result.data);
          console.log("Bot Kicked !!!!");
        } else {
          clearInterval(intVal);
          //stop recording socket
          let result = await axios.get(
            `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
          );
          console.log(result.data);

          console.log("Meeting Ended!!!!");
          // await newP.close();
        }
        // await browser.close()
      }
    }, 1000);
  }
  async function preJoinCalling() {
    const ab = await newP.waitForSelector("#preJoinAudioButton");
    await newP.click("#preJoinAudioButton");
    await newP.waitForSelector("input[id=username]");
    await newP.focus("input[id=username]");
    await newP.keyboard.type(`VM Pro Assistant - ${name}`, { delay: 15 });
    // await newP.waitForTimeout(5000)
    await newP.keyboard.press("Tab");
    // await newP.keyboard.press("Tab");
    await newP.keyboard.press("Enter");
    // await newP.keyboard.down("Shift");
    // await newP.keyboard.press("Tab");
    // await newP.keyboard.up("Shift");

    await newP.waitForTimeout(500);
    await newP.keyboard.press("Enter");
    await newP.waitForTimeout(15000);
    await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
      meetingId: `${meetingId}`,
      status: "BotWaiting",
      key: "bot",
    });
    await joinForPreJoinCalling();
  }
  async function joinForPreJoinCalling() {
    let count = Date.now() + 600000;
    const inter = setInterval(async () => {
      const element = await newP.$("#roster-button");
      if (element != null) {
        clearInterval(inter);
        console.log("User Admitted !!!", element);

        let result = await axios.get(
          `http://dev-light-be.antino.ca/startRecording?meetingId=${meetingId}`
        );
        console.log(result.data);
        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "BotJoined",
          key: "bot",
        });
        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "running",
          key: "meeting",
        });

        // const closeMicPopup = await newP.waitForSelector('#critical-ufd-close-button')
        // await closeMicPopup.click()
        // try {
        //   const closeMicPopup = await newP.waitForSelector(
        //     "#critical-ufd-close-button"
        //   );
        //   await newP.click("#critical-ufd-close-button");
        //   // await closeMicPopup.click()
        //   await afterJoinPreJoinCalling();
        //   console.log("Try called");
        // } catch {
        //   console.log("catch called");
        //   await afterJoinPreJoinCalling();
        // }
        await afterJoinPreJoinCalling();
      } else {
        const time = Date.now();
        console.log((count - time) / 1000);

        const botDenied = (await newP.content()).match(
          "Sorry, but you were denied access to the meeting."
        );
        // console.log("text ===>  ",botDenied);
        if (botDenied != null) {
          clearInterval(inter);
          console.log("Bot has denied!!!!");

          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "BotDenied",
            key: "bot",
          });

          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "completed",
            key: "meeting",
          });

          deleteInstance(instanceId);
          // await newP.close()
        }

        if (count < time) {
          clearInterval(inter);
          console.log("Timeout");
          // await newP.close();
          console.log("User not admitted ==> Browser closed");
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "BotNotAccepted",
            key: "bot",
          });
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "completed",
            key: "meeting",
          });

          deleteInstance(instanceId);
          // await browser.close()
        }
        console.log("User not Joined.........");
      }
    }, 2000);
  }
  // const random = Math.random()
  console.log("Tab pressed");
  async function afterJoinPreJoinCalling() {
    await newP.waitForSelector("#roster-button");
    await newP.click("#roster-button");
    await newP.waitForTimeout(1000);
    let dd = await newP.$(".toggle-number");
    let t = await (await dd.getProperty("textContent")).jsonValue();
    await newP.click("#roster-button");
    const userJoinedAction = (arr) => {
      console.log("User Joined");
      arr.map((user) => {
        let obj = { event: "userJoin", userName: user, joinTime: new Date() };
        usersJoined.push(obj);
      });
      console.log("Final Users Joined Array", usersJoined);
    };
    //Left user Function
    const userLeftAction = (arr) => {
      console.log("User Left");
      arr.map((user) => {
        let obj = { event: "userLeft", userName: user, leaveTime: new Date() };
        usersLeft.push(obj);
      });
      console.log("Final users left Array", usersLeft);
    };
    let tempList = [];
    let intVal = setInterval(async () => {
      try {
        const userList = await newP.evaluate(() => {
          const list = Array.from(
            document.querySelectorAll(".ts-user-name")
          ).map((elm) => elm.innerText);
          return list;
        });
        if (userList.length > tempList.length) {
          var dif = _.differenceWith(userList, tempList, _.isEqual);
          //   //New Addition
          // console.log("User Joined", " at ", new Date());
          if (dif.length != 0) {
            userJoinedAction(dif);
          }
        }
        if (tempList.length > userList.length) {
          var difleft = _.differenceWith(tempList, userList, _.isEqual);
          //New Addition
          if (difleft.length != 0) {
            userLeftAction(difleft);
          }
          //   console.log("User Left", " at ", new Date());
        }
        tempList = userList;
        let dd = await newP.$(".toggle-number");
        let t = await (await dd.getProperty("textContent")).jsonValue();
        const nv = t.replace(/[()]/g, "");
        if (nv < 2) {
          clearInterval(intVal);

          let result = await axios.get(
            `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
          );
          console.log(result.data);

          await page.bringToFront();

          // await newP.close();
          // await browser.close();
        }
        // console.log(t);
        // console.log(nv);
      } catch (error) {
        // console.log("error => ", error);
        const botRemoved = (await newP.content()).match(
          "You've been removed from this meeting"
        );
        if (botRemoved != null) {
          clearInterval(intVal);

          let result = await axios.get(
            `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
          );
          console.log(result.data);

          console.log("Bot Kicked !!!!");
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "BotRemoved",
            key: "bot",
          });
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "completed",
            key: "meeting",
          });
          await userslogs();
          await page.bringToFront();
        } else {
          clearInterval(intVal);
          let result = await axios.get(
            `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
          );
          console.log(result.data);
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "completed",
            key: "meeting",
          });
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "BotLeft",
            key: "bot",
          });
          await userslogs();
          console.log("Meeting Ended!!!!");
          await page.bringToFront();
          // await newP.close();
          // await browser.close()
        }
      }
    }, 2000);
  }
};

exports.newBrowser = async (link, meetingId, instanceId, name) => {
  const puppeteerOptions = {
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      // '--lang=en',
      // '--no-sandbox',
      "--auto-select-tab-capture-source-by-title=Meet",
      // "--auto-select-desktop-capture-source=Entire screen"
      "--start-maximized",
    ],
    env: {
      LANG: "en",
    },

    // executablePath: executablePath(),
    executablePath: "C:/Program Files/Google/Chrome/Application/Chrome.exe",
  };

  //if (existsSync("/usr/bin/chromium-browser")) {
  //  console.log("Altering puppeteer chromium path...");
  //  puppeteerOptions.executablePath = "/usr/bin/chromium-browser";
  //}
  const browser = await puppeteer.launch(puppeteerOptions);
  browser
    .defaultBrowserContext()
    .overridePermissions("https://meet.google.com/", [
      "microphone",
      "camera",
      "notifications",
    ]);

  // https://dev-light-app.antino.ca
  // browser
  //   .defaultBrowserContext()
  //   .overridePermissions(`https://prod-light-app.antino.ca/${meetingId}/22/gmeet/`, [
  //     "microphone",
  //     "camera",
  //     "notifications",
  //   ]);

  browser
    .defaultBrowserContext()
    .overridePermissions(
      `https://dev-light-app.antino.ca/${meetingId}/22/gmeet/`,
      ["microphone", "camera", "notifications"]
    );

  const page = await browser.newPage();

  // setTimeout()
  // await newPage.setViewport({ width: 1500, height: 768});

  //   await page.goto('http://127.0.0.1:5500/index.html');

  // await page.goto(`https://prod-light-app.antino.ca/${meetingId}/22/gmeet/${instanceId}`);
  await page.goto(
    `https://dev-light-app.antino.ca/${meetingId}/22/gmeet/${instanceId}/${name}`
  );

  //await page.waitForTimeout(3000);

  page.on("console", async (message) => {
    console.log(`${message.text()}`);
    //inMeetingServiceListener Meeting Ended

    if ("Video Downloaded" === message.text()) {
      setTimeout(async () => {
        console.log("not closing browser when video downloaded");
        // console.log("Browser Instance Closed after download")
        // await browser.close();
      }, 15000);
    }

    if ("STOPPED" === message.text()) {
      await page.bringToFront();
      console.log("meeting downloaded");

      setTimeout(async () => {
        // console.log("browser instance closed");

        const path = require("path");

        fs.exists(
          `C:\\Users\\Administrator\\Downloads\\${meetingId}.webm`,
          async (exists) => {
            if (exists) {
              let filename = `${meetingId}.webm`;
              console.log("latest filename", filename);
              console.log("meetingUrl", link);

              async function convert() {
                const { promises: fs } = require("fs");

                await fs.writeFile(
                  `C:\\Users\\Administrator\\Downloads\\${meetingId}conv.mp4`,
                  Buffer.from(
                    webmToMp4(
                      await fs.readFile(
                        `C:\\Users\\Administrator\\Downloads\\${filename}`
                      )
                    )
                  )
                );
              }
              await convert();

              filename = `${meetingId}conv.mp4`;
              // let result = await uploadgmeet(filename,link);
            } else {
              console.log("file not found");
            }
          }
        );

        // const getMostRecentFile = (dir) => {
        //   const files = orderReccentFiles(dir);
        //   return files.length ? files[0] : undefined;
        // };

        // const orderReccentFiles = (dir) => {
        //   return fs.readdirSync(dir)
        //     .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
        //     .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
        //     .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
        // }
        // let filename = getMostRecentFile('C:\\Users\\lbadmin\\Downloads').file;

        // async function convert(){
        //   const { promises: fs } = require("fs");

        //   await fs.writeFile(
        //     `C:\\Users\\lbadmin\\Downloads\\${meetingId}_conv.mp4`,
        //     Buffer.from(webmToMp4(await fs.readFile(`C:\\Users\\lbadmin\\Downloads\\${filename}`))) );
        // }
        // await convert();

        //  filename = `${meetingId}_conv.mp4`;

        // fs.exists('C:\\Users\\lbadmin\\Downloads', (exists) => {
        //     console.log(exists ? 'Found' : 'Not found!');
        // });

        // console.log("latest filename",filename);
        // console.log("meetingUrl",link);

        // let result = await uploadgmeet(filename,link);

        //browser.close();
      }, 10000);
    }
  });

  //   await page.waitForTimeout(3000)
  let newPage = await browser.newPage();

  await newPage.goto(link);
  //   await newPage.keyboard.type('LigthBulb', { delay: 15 });
  // console.log('turn off cam using Ctrl+E');
  await newPage.waitForTimeout(3000);
  await newPage.keyboard.down("ControlLeft");
  await newPage.keyboard.press("KeyE");
  await newPage.keyboard.up("ControlLeft");
  await newPage.waitForTimeout(100);

  // console.log('turn off mic using Ctrl+D');
  await newPage.waitForTimeout(1000);
  await newPage.keyboard.down("ControlLeft");
  await newPage.keyboard.press("KeyD");
  await newPage.keyboard.up("ControlLeft");
  await newPage.waitForTimeout(100);

  // await newPage.keyboard.type("LigthBulb", { delay: 15 });
  await newPage.keyboard.type(`VM Pro Assistant - ${name}`, { delay: 15 });

  await clickText(newPage, "Ask to join");

  let count = Date.now() + 600000;

  //setTimeout(async()=>{
  // await clickText(newPage, "Got it");

  //},30000)

  //await clickText(newPage, "Got it");

  // const inter  = setInterval(async ()=>{
  //       const element = await newPage.$(".uGOf1d");
  //       if(element != null){
  //           clearInterval(inter)
  //           console.log("User Admitted !!!",element);
  //           // io.sockets.in(meetingId).emit('Start Recording', {meetingId: meetingId});
  //            let result = await axios.get(`https://dev-light-be.antino.ca/startRecording?meetingId=${meetingId}`)
  //           // let result = await axios.get(`https://lightbulb-core-app-be.antino.ca/startRecording?meetingId=${meetingId}`)

  //           console.log(result.data)
  //           await test(element)
  //       }else{
  //           const time = Date.now()
  //           console.log((count-time)/1000);
  //           if(count <= time){
  //               clearInterval(inter)
  //               console.log("Timeout");
  //               await newPage.close()
  //               console.log("User not admitted ==> Browser closed");
  //               await browser.close()
  //           }
  //           console.log("User not Joined.........");
  //       }
  //   },2000)

  //   async function test(element){
  //       let text;
  //       const clrInt = setInterval(async () => {
  //           try {
  //               text = await newPage.evaluate(element => element.textContent, element);
  //               // console.log('peoples====>>>>>>>', text);
  //               await clickText(newPage, "Got it");
  //               if (text == 1 || text == 'undefined') {
  //                   clearInterval(clrInt)
  //                    let result = await axios.get(`https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`)
  //                   //let result = await axios.get(`https://lightbulb-core-app-be.antino.ca/stopRecording?meetingId=${meetingId}`)
  //                   // io.sockets.in(meetingId).emit("Stop Recording", {meetingId: meetingId});
  //                   console.log(result.data)

  //                   console.log("Browser closed");
  //                   //newPage.close()
  //                   //browser.close()
  //               }
  //           } catch (error) {
  //               // console.log("error --> ",error);
  //               clearInterval(clrInt)
  //               newPage.close()
  //               console.log("Browser closed");
  //               browser.close()
  //           }
  //       }, 2000)
  //   }

  const inter = setInterval(async () => {
    const element = await newPage.$(".uGOf1d");
    if (element != null) {
      clearInterval(inter);
      console.log("User Admitted !!!", element);
      await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
        meetingId: `${meetingId}`,
        status: "BotJoined",
        key: "bot",
      });
      await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
        meetingId: `${meetingId}`,
        status: "running",
        key: "meeting",
      });
      // io.sockets.in(meetingId).emit('Start Recording', {meetingId: meetingId});
      let result = await axios.get(
        `https://dev-light-be.antino.ca/startRecording?meetingId=${meetingId}`
      );
      console.log(result.data);
      await test(element);
    } else {
      const time = Date.now();
      console.log((count - time) / 1000);
      const botDenied = (await newPage.content()).match(
        "You can't join this call"
      );

      if (botDenied != null) {
        clearInterval(inter);
        console.log("Bot has denied!!!!");
        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "BotDenied",
          key: "bot",
        });

        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "completed",
          key: "meeting",
        });

        deleteInstance(instanceId);

        // await newPage.close()
      }
      if (count <= time) {
        clearInterval(inter);
        // console.log("Timeout");
        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "BotNotAccepted",
          key: "bot",
        });

        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "completed",
          key: "meeting",
        });
        // await newPage.close()
        console.log("User not admitted ==> Browser closed");

        deleteInstance(instanceId);

        // await browser.close()
      }
      console.log("User not Joined.........");
    }
  }, 2000);

  async function test(element) {
    let text;
    const userJoinedAction = (arr) => {
      console.log("User Joined");
      arr.map((user) => {
        let obj = { event: "userJoin", userName: user, joinTime: new Date() };
        usersJoined.push(obj);
      });
      console.log("Final Users Joined Array", usersJoined);
    };
    //Left user Function
    const userLeftAction = (arr) => {
      console.log("User Left");
      arr.map((user) => {
        let obj = { event: "userLeft", userName: user, leaveTime: new Date() };
        usersLeft.push(obj);
      });
      console.log("Final users left Array", usersLeft);
    };
    let tempList = [];
    const clrInt = setInterval(async () => {
      try {
        text = await newPage.evaluate(
          (element) => element.textContent,
          element
        );
        // console.log('peoples====>>>>>>>', text);
        await clickText(newPage, "Got it");
        const userList = await newPage.evaluate(() => {
          const list = Array.from(document.querySelectorAll(".zWGUib")).map(
            (elm) => elm.innerText
          );
          return list;
        });
        if (userList.length > tempList.length) {
          var dif = _.differenceWith(userList, tempList, _.isEqual);
          //   //New Addition
          //   console.log("User Joined", dif, " at ", new Date());
          if (dif.length != 0) {
            userJoinedAction(dif);
          }
        }
        if (tempList.length > userList.length) {
          var difleft = _.differenceWith(tempList, userList, _.isEqual);
          //New Addition
          //   console.log("User Left", difleft, " at ", new Date());
          if (difleft.length != 0) {
            userLeftAction(difleft);
          }
        }
        //Updating list to temp
        tempList = userList;
        const botRemoved = (await newPage.content()).match(
          "You've been removed from the meeting"
        );
        // console.log('botRemoved  ====>>>>>>>  ', botRemoved);
        if (botRemoved != null) {
          clearInterval(clrInt);
          console.log("Bot has kicked !!!!!!");
          userslogs()
          let result = await axios.get(
            `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
          );
          console.log(result.data);
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "BotRemoved",
            key: "bot",
          });
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "botKicked",
            key: "meeting",
          });
        }

        if (text == 1 || text == "undefined") {
          clearInterval(clrInt);
          let result = await axios.get(
            `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
          );
          // io.sockets.in(meetingId).emit("Stop Recording", {meetingId: meetingId});
          console.log(result.data);
          userslogs()
          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "BotLeft",
            key: "bot",
          });

          await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
            meetingId: `${meetingId}`,
            status: "completed",
            key: "meeting",
          });

          console.log("Browser closed");
          //newPage.close()
          //browser.close()
        }
      } catch (error) {
        // console.log("error --> ",error);
        clearInterval(clrInt);
        let result = await axios.get(
          `https://dev-light-be.antino.ca/stopRecording?meetingId=${meetingId}`
        );
        console.log(result.data);

        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "BotLeft",
          key: "bot",
        });
        userslogs()
        await axios.post(`${meetingBaseUrl}/update-meeting-status`, {
          meetingId: `${meetingId}`,
          status: "completed",
          key: "meeting",
        });
        // newPage.close()
        // console.log("Browser closed");
        // browser.close()
      }
    }, 2000);
  }

  // await newPage.waitForTimeout(10000)
  // setTimeout(async () => {
  //   const element = await newPage.$(".uGOf1d");
  //   console.log("elements ---->  ", element);
  //   let text;
  //   const clrInt = setInterval(async () => {
  //     try {
  //       text = await newPage.evaluate(
  //         (element) => element.textContent,
  //         element
  //       );
  //       console.log("peoples====>>>>>>>", text);
  //       if (text == 1 || text == "undefined") {
  //         clearInterval(clrInt);
  //         setTimeout(() => {

  //           newPage.close();
  //           browser.close();
  //         }, 5000);
  //       }
  //     } catch (error) {
  //       console.log("error --> ", error);
  //       clearInterval(clrInt);
  //       newPage.close();
  //       browser.close();
  //     }
  //   }, 5000);
  // }, 20 * 1000 * 1);

  // await newPage.waitForTimeout(11000)
  // console.log("after setinterval",text);
  // await newPage.waitForTimeout(15000)
  // console.log("after setinterval 2",text);

  // newPage.waitForTimeout(30000)
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

const userslogs = () => {
  console.log("Sending User Logs");
  let payloadJoin = {
    key: "attendeesJoin",
    meetingCode: "34343",
    userDetails: usersJoined,
  };
  //Joij time API
  let payloadleave = {
    key: "attendeesLeave",
    meetingCode: "34343",
    userDetails: usersLeft,
  };
  //Leave time API
  console.log("Join Payload", payloadJoin);
  console.log("Leave Payload", payloadleave);
};
